const express = require("express");
const { useAuth } = require("../middleware/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");
const { default: mongoose } = require("mongoose");

const requestRouter = express.Router();

requestRouter.post(
  "/send/request/:status/:toUserId",
  useAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { status, toUserId } = req.params;
      // const toUserId = new mongoose.Types.ObjectId(req.params.toUserId);

      const allowedStatus = ["intrested", "ignored"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid STATUS");
      }
      const toUserPresent = await User.findById(toUserId);
      if (!toUserPresent) {
        throw new Error("User is not present");
      }

      const alreadyPresent = await ConnectionRequestModel.findOne({
        $or: [
          { toUserId, fromUserId },
          { toUserId: fromUserId, fromUserId: toUserId },
        ],
      });
      if (alreadyPresent) {
        throw new Error("request is already present");
      }

      const connectionRequest = new ConnectionRequestModel({
        toUserId,
        fromUserId,
        status,
      });
      let data = await connectionRequest.save();
      data = await data.populate([
        { path: "fromUserId", select: "firstName lastName" },
        { path: "toUserId", select: "firstName lastName" },
      ]);
      res.json({
        message: "success",
        data,
      });
    } catch (err) {
      res.send("Error :" + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  useAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;
      const dataCheck = await ConnectionRequestModel.findOne({
        status: "intrested",
        _id: requestId,
        toUserId: loggedInUser._id,
      }).populate([
        // { path: "toUserId", select: "firstName lastName" },
        { path: "fromUserId", select: "firstName lastName" },
      ]);
      if (!dataCheck) {
        throw new Error("You are not allowed to chnage");
      }
      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid status");
      }

      dataCheck.status = status;

      const data = await dataCheck.save();
      res.json({
        message: "Status Updated ",
        data,
      });
    } catch (err) {
      res.send({ message: "ERROR :" + err.message });
    }
  }
);

requestRouter.get("/user/request/received", useAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const getAllRequest = await ConnectionRequestModel.find({
      status: "intrested",
      toUserId: loggedInUser._id,
    }).populate([
      // { path: "toUserId", select: "firstName lastName" },
      {
        path: "fromUserId",
        select: "firstName lastName about skills photoUrl",
      },
    ]);

    if (!getAllRequest) {
      throw new Error("Data not found");
    }
    const data = await getAllRequest;
    res.json({ message: `all request of ${loggedInUser.firstName}`, data });
  } catch (err) {
    res.send({ message: "ERROR :" + err.message });
  }
});

requestRouter.get("/user/connections", useAuth, async (req, res) => {
  const loggedInUser = req.user;
  const getAllConnections = await ConnectionRequestModel.find({
    $or: [
      { status: "accepted", toUserId: loggedInUser._id },
      { status: "accepted", fromUserId: loggedInUser._id },
    ],
  }).populate([
    { path: "fromUserId", select: "firstName lastName" },
    { path: "toUserId", select: "firstName lastName" },
  ]);
  if (!getAllConnections) {
    throw new Error("No any connections");
  }

  const data = getAllConnections.map((getAllConnections) => {
    if (
      getAllConnections.fromUserId._id.toString() ===
      loggedInUser._id.toString()
    ) {
      return getAllConnections.toUserId;
    }
    return getAllConnections.fromUserId;
  });
  res.json({
    message: "all connections",
    data,
  });
});

module.exports = requestRouter;
