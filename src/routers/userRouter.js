const express = require("express");
const { useAuth } = require("../middleware/auth");
const connectionrequestModel = require("../models/connectionRequest");
const User = require("../models/user");

const userRouter = express.Router();

userRouter.get("/user/feed", useAuth, async (req, res) => {
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 10);
  const skip = (page - 1) * limit;
  try {
    const loggedInUser = req.user;

    const connections = await connectionrequestModel
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      })
      .populate([
        { path: "fromUserId", select: "firstName" },
        { path: "toUserId", select: "firstName" },
      ]);

    const notAllowedInFeed = new Set();
    connections.forEach((req) => {
      notAllowedInFeed.add(req.fromUserId._id.toString()),
        notAllowedInFeed.add(req.toUserId._id.toString());
    });

    const user = await User.find({
      _id: { $nin: Array.from(notAllowedInFeed) },
    })
      .select("firstName lastName skills about photoUrl age gender")
      .skip(skip)
      .limit(limit);

    res.json({ data: user });
  } catch (err) {
    res.send("Error :" + err.message);
  }
});

module.exports = userRouter;
