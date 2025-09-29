const express = require("express");
const connectionrequestModel = require("../models/connectionRequest");
const { useAuth } = require("../middleware/auth");

const requestRouter = express.Router();

requestRouter.post(
  "/send/request/:status/:toUserId",
  useAuth,
  async (req, res) => {
    try {
      const user = req.user;
      const { toUserId, status } = req.params;
      const fromUserId = user._id;
      const allowedStatus = ["intrested", "ignored"];
      if (!allowedStatus.includes(status)) {
        throw new Error("invalid status");
      }

      const existingUser = await connectionrequestModel.findOne({
        $or: [
          {
            toUserId,
            fromUserId,
          },
          {
            toUserId: fromUserId,
            fromUserId: toUserId,
          },
        ],
      });

      if (existingUser) {
        throw new Error("Request is already sended");
      }
      const connectionRequestInstance = new connectionrequestModel({
        toUserId,
        fromUserId,
        status,
      });

      const data = await connectionRequestInstance.save();
      res.send("Success" + data);
    } catch (err) {
      res.send("ERROR : " + err.message);
    }
  }
);

module.exports = requestRouter;
