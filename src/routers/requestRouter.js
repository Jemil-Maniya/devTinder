const express = require("express");
const { useAuth } = require("../middleware/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");

const requestRouter = express.Router();

requestRouter.post(
  "/send/request/:status/:toUserId",
  useAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { toUserId, status } = req.params;
      const allowedStatus = ["intrested", "ignored"];
      if (!allowedStatus.includes(status)) {
        throw new Error("Invalid STATUS");
      }
      const toUserPresent = User.findById(toUserId);
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
      const data = await connectionRequest.save();
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
        fromUserId: loggedInUser._id,
      });
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

module.exports = requestRouter;
