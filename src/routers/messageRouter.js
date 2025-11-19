// routes/messageRouter.js
const express = require("express");
const messageRouter = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/messages");
const { useAuth } = require("../middleware/auth");

// GET /api/messages/:userA/:userB?limit=100
// returns messages between userA and userB (oldest -> newest)
// server computes fromSelf using authenticated user
messageRouter.get("/:userA/:userB", useAuth, async (req, res) => {
  const { userA, userB } = req.params;
  const limit = Math.min(500, parseInt(req.query.limit || "200", 10));

  try {
    // resolve "me" placeholder
    const loggedInId = req.user && (req.user._id || req.user.id);
    if (!loggedInId) {
      return res.status(401).json({ ok: false, error: "Not authenticated" });
    }

    const resolvedA = userA === "me" ? String(loggedInId) : userA;
    const resolvedB = userB === "me" ? String(loggedInId) : userB;

    if (
      !mongoose.Types.ObjectId.isValid(resolvedA) ||
      !mongoose.Types.ObjectId.isValid(resolvedB)
    ) {
      return res.status(400).json({ ok: false, error: "Invalid user id(s)" });
    }

    const messages = await Message.find({
      $or: [
        { from: resolvedA, to: resolvedB },
        { from: resolvedB, to: resolvedA },
      ],
    })
      .sort({ time: 1 })
      .limit(limit)
      .lean();

    const loggedIdStr = String(loggedInId);

    const messagesWithFlag = messages.map((m) => ({
      _id: m._id,
      id: m._id,
      from: String(m.from),
      to: String(m.to),
      text: m.text ?? "",
      time: m.time || m.createdAt,
      status: m.status,
      meta: m.meta || {},
      fromSelf: String(m.from) === loggedIdStr,
    }));

    return res.json({ ok: true, messages: messagesWithFlag });
  } catch (err) {
    console.error("GET /api/messages error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/messages/send
// Body: { from, to, text, meta }
messageRouter.post("/send", useAuth, async (req, res) => {
  try {
    const { from, to, text, meta } = req.body;

    const loggedInId = req.user && (req.user._id || req.user.id);
    if (!loggedInId) {
      return res.status(401).json({ ok: false, error: "Not authenticated" });
    }

    const sender =
      from === "me" ? String(loggedInId) : String(from || loggedInId);

    if (!sender || !to) {
      return res.status(400).json({ ok: false, error: "Missing from/to" });
    }
    if (
      !mongoose.Types.ObjectId.isValid(sender) ||
      !mongoose.Types.ObjectId.isValid(to)
    ) {
      return res.status(400).json({ ok: false, error: "Invalid from/to id" });
    }

    const created = await Message.create({
      from: sender,
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

    // Emit via Socket.IO if available
    const io = req.app && req.app.get && req.app.get("io");
    if (io) {
      // emit to recipient and sender rooms
      io.to(messageForEmit.to).emit("receiveMessage", messageForEmit);
      io.to(messageForEmit.from).emit("messageSent", messageForEmit);
    }

    return res.json({ ok: true, message: messageForEmit });
  } catch (err) {
    console.error("POST /api/messages/send error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = messageRouter;
