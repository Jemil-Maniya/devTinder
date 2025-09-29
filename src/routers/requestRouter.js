const express = require("express");
const { useAuth } = require("../middleware/auth");
const connectionRequestModel = require("../models/connectionRequest");

const requestRouter = express.Router();

requestRouter.post(
  "/send/request/:status/:toUserId",
  useAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const { toUserId, status } = req.params;
      const allowedStatus = ["intrested", "ignored"];
      if(!allowedStatus.includes(status)){
        throw new Error("Invalid STATUS")
      }
      const alreadyPresent = await connectionRequestModel.findOne({
        $or: [
          { toUserId, fromUserId },
          { toUserId: fromUserId, fromUserId: toUserId },
        ],
      });
      if (alreadyPresent) {
        throw new Error("request is already present");
      }

      const connectionRequest = new connectionRequestModel({
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

module.exports = requestRouter;
