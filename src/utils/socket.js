// utils/socketConfig.js
const socketIO = require("socket.io");
const Message = require("../models/messages");

const initializeSocket = (server, options = {}) => {
  const io = socketIO(server, {
    cors: {
      origin: options.origin || "*",
      credentials: true,
    },
  });

  // in-memory mapping userId -> Set of socket ids
  const userSockets = new Map();

  const addSocketForUser = (userId, socketId) => {
    const s = userSockets.get(userId) || new Set();
    const wasOffline = !userSockets.has(userId); // true if this is first socket
    s.add(socketId);
    userSockets.set(userId, s);

    // If this was the first socket for the user, broadcast userOnline
    if (wasOffline) {
      io.emit("userOnline", { userId });
      console.log("PRESENCE: userOnline ->", userId);
    }
  };

  const removeSocketForUser = (userId, socketId) => {
    const s = userSockets.get(userId);
    if (!s) return;
    s.delete(socketId);
    if (s.size === 0) {
      userSockets.delete(userId);
      // user became fully offline -> broadcast
      io.emit("userOffline", { userId });
      console.log("PRESENCE: userOffline ->", userId);
    } else {
      userSockets.set(userId, s);
    }
  };

  const debugRooms = () =>
    Array.from(
      io.sockets && io.sockets.adapter && io.sockets.adapter.rooms
        ? io.sockets.adapter.rooms.keys()
        : []
    ).slice(0, 50);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // JOIN with ack: socket.emit("join", userId, cb)
    socket.on("join", async (userId, cb) => {
      try {
        if (!userId) {
          if (typeof cb === "function") cb({ ok: false, error: "no userId" });
          return;
        }

        userId = String(userId);
        socket.join(userId);
        socket.data.userId = userId; // keep on socket for cleanup
        addSocketForUser(userId, socket.id);

        console.log(`Socket ${socket.id} joined room ${userId}`);
        console.log(
          "DEBUG: userSockets keys (sample):",
          Array.from(userSockets.keys()).slice(0, 50)
        );
        console.log("DEBUG: adapter rooms keys (sample):", debugRooms());

        // Replay pending messages for this user (messages with status 'sent')
        try {
          const pending = await Message.find({
            to: userId,
            status: "sent",
          }).lean();
          if (pending && pending.length)
            console.log(
              `Replaying ${pending.length} pending messages to ${userId}`
            );
          for (const m of pending) {
            const messageForEmit = {
              id: m._id,
              _id: m._id,
              from: String(m.from),
              to: String(m.to),
              text: m.text ?? "",
              time: m.time || m.createdAt,
              status: m.status,
              meta: m.meta || {},
            };
            socket.emit("receiveMessage", messageForEmit);
            try {
              // mark delivered after replay
              await Message.findByIdAndUpdate(m._id, { status: "delivered" });
            } catch (updErr) {
              console.error("Error updating pending message status:", updErr);
            }
          }
        } catch (err) {
          console.error("Error replaying pending messages:", err);
        }

        if (typeof cb === "function") cb({ ok: true });
      } catch (err) {
        console.error("join handler error:", err);
        if (typeof cb === "function") cb({ ok: false, error: err.message });
      }
    });

    // RPC: checkOnline -> returns { ok:true, online: boolean }
    socket.on("checkOnline", (targetUserId, cb) => {
      try {
        const s = userSockets.get(String(targetUserId));
        const online = !!(s && s.size > 0);
        if (typeof cb === "function") cb({ ok: true, online });
      } catch (err) {
        console.error("checkOnline error:", err);
        if (typeof cb === "function")
          cb({ ok: false, error: err.message, online: false });
      }
    });

    // payload: { from, to, text, meta } with optional ack cb
    socket.on("sendMessage", async (payload, cb) => {
      try {
        const { from, to, text, meta } = payload || {};
        if (!from || !to) {
          if (typeof cb === "function")
            cb({ ok: false, error: "Missing from/to" });
          return;
        }

        console.log("sendMessage payload received:", {
          from: String(from),
          to: String(to),
          text: (text || "").slice(0, 60),
        });

        const created = await Message.create({
          from,
          to,
          text: text ?? "",
          meta: meta || {},
          time: new Date(),
          status: "sent",
        });

        const messageForEmit = {
          id: created._id,
          _id: created._id,
          from: String(created.from),
          to: String(created.to),
          text: created.text ?? "",
          time: created.time,
          status: created.status,
          meta: created.meta || {},
        };

        // debug: which sockets/rooms exist
        const toRoom = String(messageForEmit.to);
        const fromRoom = String(messageForEmit.from);
        const toSockets = userSockets.get(toRoom);
        const fromSockets = userSockets.get(fromRoom);

        console.log(
          "DEBUG: before emit - adapter rooms contains toRoom?",
          !!io.sockets.adapter.rooms.get(toRoom)
        );
        console.log(
          "DEBUG: tracked toSockets:",
          toSockets ? Array.from(toSockets) : "none",
          "tracked fromSockets:",
          fromSockets ? Array.from(fromSockets) : "none"
        );

        // Emit to recipient and sender rooms (primary)
        io.to(toRoom).emit("receiveMessage", messageForEmit);
        io.to(fromRoom).emit("messageSent", messageForEmit);

        // Also emit directly to tracked socket ids for extra reliability
        if (toSockets) {
          for (const sid of toSockets) {
            io.to(sid).emit("receiveMessage", messageForEmit);
          }
        }
        if (fromSockets) {
          for (const sid of fromSockets) {
            io.to(sid).emit("messageSent", messageForEmit);
          }
        }

        // debug: check adapter state after emit
        console.log("Emitted message", messageForEmit.id, "to room", toRoom);
        console.log(
          "DEBUG: adapter.rooms.get(toRoom) ->",
          io.sockets.adapter.rooms.get(toRoom)
        );
        console.log(
          "DEBUG: adapter.rooms.get(fromRoom) ->",
          io.sockets.adapter.rooms.get(fromRoom)
        );

        if (typeof cb === "function") cb({ ok: true, message: messageForEmit });
      } catch (err) {
        console.error("sendMessage error:", err);
        if (typeof cb === "function") cb({ ok: false, error: err.message });
      }
    });

    socket.on("disconnect", (reason) => {
      const userId = socket.data.userId;
      if (userId) removeSocketForUser(userId, socket.id);
      console.log(
        "Socket disconnected:",
        socket.id,
        "reason:",
        reason,
        "userId:",
        userId
      );
      console.log(
        "DEBUG: userSockets keys after disconnect:",
        Array.from(userSockets.keys()).slice(0, 50)
      );
    });
  });

  return io;
};

module.exports = initializeSocket;
