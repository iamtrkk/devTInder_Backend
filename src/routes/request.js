const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const user = require("../models/user");

const router = express.Router();

//send request
router.post("/send/:status/:toUserId", async (req, res) => {
  try {
    const fromUserId = req.user._id; //comes from auth when we login we are attaching details of logged in user
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    //Checking if status is correct as this API is only for ignore and interested
    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status))
      throw new Error(`Request ${status} not valid`);

    //Checking if User exists at the receiving end
    const toUser = await user.findById(toUserId);
    if (!toUser) throw new Error("User not exists");

    //Checking if either of one has already sent a request to other
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        //returns if either of the document found in DB
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingRequest) throw new Error("Connection request already exists");

    //make entry will al checks are passed
    //One more check is happening at schema level that is from and to cant be same using pre method in schema
    //it will automatically check if both user are same for every request either its connection request or connection action like accepted rejected
    //this way we dont need to write same code in multiple api it is basically a rule for specifi schema
    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });

    const data = await connectionRequest.save();

    res.json({
      message: "Connection request sent successfully",
      data,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

//Review request
router.post("/review/:status/:requestId", async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    //its review api so status can only be accepted or rejected
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status))
      return res.status(400).json({ message: `Request ${status} not valid` });

    //find connetion which needs to be reviewed a strict check as only logged in user can
    //review the request and logged in user can only review his request not others
    // and status must be interested to take action
    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });
    if (!connectionRequest)
      return res.status(404).json({ message: `Connection request not found` });

    //if found change status and save
    connectionRequest.status = status;
    const data = await connectionRequest.save();

    res.json({ message: `Connection request ` + status, data });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = router;
