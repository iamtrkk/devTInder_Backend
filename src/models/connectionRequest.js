const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      // It will get user details from User collection for fromUserId. basically kind of join that we do in SQL
      //and we can use populate to get data from User collectin when fetching document from this collection
      ref: "User",
      required: true,
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      //to get the usr details if required to send
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: {
        // also we can use validate for this
        values: ["ignored", "interested", "accepted", "rejected"],
        message: `{VALUE} is incorrect status type`,
      },
    },
  },
  { timestamps: true }
);

//indexed DB search optimization on fromUserId by default for every query
// connectionRequestSchema.index({ fromUserId: 1 });

// Compound index bcz it applies on both ids for search optimization
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  //check if fromuserId and toUserId are same
  //it will automatically check if both user are same for every request eith its connection request or connection action like accepted rejected
  //this way we dont need to write same code in multiple api it is basically a rule for specifi schema
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId))
    throw new Error("Can't send request to yourself");
  next();
});

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema); //collection will be created by this name in DB adding s at the end
