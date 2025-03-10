const express = require("express");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { USER_SAFA_DATA } = require("../utils/const");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const loggedInUser = req.user;

    //Pagination to get limited records with page no.
    const page = parseInt(req.query.page) || 1; //if not query passed use default
    let limit = parseInt(req.query.limit) || 10; // 10 docs per page
    limit = limit > 50 ? 50 : limit; //corner case user can send any high number limit which will be costly
    // this is used by mongoDB to skip 1st specified number of results and send rest
    //if 5 then it will it will not return first 5 results
    const skip = (page - 1) * limit;

    //User should see all the user cards except:
    //2. his connections
    //3. ignored people
    //4. already sent request
    const connectionRequests = await ConnectionRequest.find({
      //selecting request I have sent or received
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      //selecting fields we need other wise it get all fields same as populate where we select field
    }).select("fromUserId toUserId");
    // to store unique Ids from to and from
    const hideUsersFromFeed = new Set();

    //adding all requests to set as it will accept unique ids only
    connectionRequests.forEach((con) => {
      hideUsersFromFeed.add(con.fromUserId.toString());
      hideUsersFromFeed.add(con.toUserId).toString();
    });

    // Getting all users info for which connection request does not exists of any status
    // and hiding current user
    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFA_DATA)
      .skip(skip)
      .limit(limit);

    res.send(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
