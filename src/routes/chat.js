const express = require("express");
const { Chat } = require("../models/chat");

const router = express.Router();

router.get("/:targetUserId", async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const loggedInUser = req.user._id;

    // Check if conversation history exists with this participants
    // if not create new chat
    let chat = await Chat.findOne({
      participants: { $all: [loggedInUser, targetUserId] },
    }).populate({
      path: "messages.senderId", //populate the senderId object
      select: "firstName lastName", //select this fields from User
    });

    if (!chat) {
      chat = new Chat({
        participants: [loggedInUser, targetUserId],
        messages: [],
      });
      await chat.save();
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
