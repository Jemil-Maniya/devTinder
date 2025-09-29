const mongoose = require("mongoose");

const connectionrequestSchema = new mongoose.Schema(
  {
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
        message: `{VALUE} can not be insert`,
      },
    },
  },
  { timestamps: true }
);

connectionrequestSchema.index({
  fromUserId: 1,
  toUserId: 1,
});

connectionrequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("You can not send the connection Request to your self");
  }
  next();
});

const connectionrequestModel = new mongoose.model(
  "connectionrequest",
  connectionrequestSchema
);

module.exports = connectionrequestModel;
