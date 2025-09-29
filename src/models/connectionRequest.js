const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
  fromUserId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  toUserId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
    enum: {
      values: ["intrested", "ignored", "accepted", "rejected"],
      message: `{VALUE} is not a valid status category`,
    },
  },
});

connectionRequestSchema.index({
  toUserId: 1,
  fromUserId: 1,
});

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Can not request to your self");
  }
  next();
});

const connectionRequestModel = mongoose.model(
  "ConnectionRequest",
  connectionRequestSchema
);

module.exports = connectionRequestModel;
