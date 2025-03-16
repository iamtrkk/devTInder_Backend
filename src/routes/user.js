const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { USER_SAFA_DATA } = require("../utils/const");

const router = express.Router();

//get by email
router.get("/", async (req, res) => {
  const userEmail = req.body.emailId;
  try {
    // returns all document with matching email
    // if I use findOne then it will return one object
    const users = await User.find({ emailId: userEmail });
    if (!users.length) res.status(404).send("user not found");
    else res.send(users);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Update by id
router.patch("/:userId", async (req, res) => {
  const { userId } = req.params;
  const body = req.body;

  try {
    // API level validation to restrict modification of some fields like email
    const ALLOWED_UPDATES = [
      'firstName',
      'lastName',
      "photoUrl",
      "about",
      "gender",
      "age",
      "skills",
    ];

    const isUpdateAllowed = Object.keys(body).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) throw new Error("Update not allowed");

    const data = await User.findByIdAndUpdate({ _id: userId }, body, {
      returnDocument: "after", //this is optional it basically returns the document before edited and after edited version
      runValidators: true, // BY default validators run only on post calls to run on patch we need to enable it here
    });
    res.json({ message: "edited", data });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

// Delete by id
router.delete("/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    // const user = await User.findByIdAndDelete({_id:userId});
    const data = await User.findByIdAndDelete(userId); //Shorthand for 1st one we can directly pass id

    if (!data) throw new Error("User not found");

    res.json({ message: "deleted", data });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//Request received
router.get("/requests/received", async (req, res) => {
  try {
    const loggedInUser = req.user;

    //Getting all pending requests which is status being interested for the logged in user
    const connectionRequests = await ConnectionRequest.find({
      //return array of matching documents
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate(
      // user to fetch user details using id from other collection, basically need to create ref before using this
      "fromUserId",
      // either it can be done using string or array of required data if string or array is not passed then all details will be
      // returned including password which we dont need to return in response
      //it can also be done by findOne using ID but its very inefficient
      USER_SAFA_DATA
    );
    // .populate("fromUserId", ["firstName", "lastName"]);

    if (!connectionRequests.length) throw new Error("No requests found");

    res.json({
      message: "Data fetched successfully",
      data: connectionRequests,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

//All accepted connections
router.get("/connections", async (req, res) => {
  const loggedInUser = req.user;

  //get accepted connections received to logged in userId
  //or, accepted connections send by logged in user id
  const connectionRequests = await ConnectionRequest.find({
    $or: [
      { toUserId: loggedInUser._id, status: "accepted" },
      { fromUserId: loggedInUser._id, status: "accepted" },
    ],
  })
    .populate("fromUserId", USER_SAFA_DATA)
    .populate("toUserId", USER_SAFA_DATA);

  //it will return the whole connection data but we need only user info of opposite user
  //so we will map and return only user info
  const data = connectionRequests.map((row) =>
    //condition to fix if request is sent by me i.e logged in user but the response should always give details of opposite user
    row.fromUserId._id.toString() === loggedInUser._id.toString() //toString must to compare mongo id
      ? row.toUserId
      : row.fromUserId
  );
  res.json({ data });
});

module.exports = router;
