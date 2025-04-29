const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

//Creating complex roomId bcz just joining two ids can be easily guessed and hacked
//also we can use jwt verification
const getSecretRoomId = (loggedInUser, targetUserId) => {
  const roomId = [loggedInUser, targetUserId].sort().join("_");
  return crypto.createHash("sha256").update(roomId).digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });
  io.on("connection", (socket) => {
    //Handle events
    socket.on("joinChat", ({ loggedInUser, targetUserId, firstName }) => {
      //creating room id to be unique for each chat with same people sorting to maintain the order of room id
      // const roomId = [loggedInUser, targetUserId].sort().join("_");
      const roomId = getSecretRoomId(targetUserId, loggedInUser); //secure ids
      console.log(firstName + " Joined room: " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, targetUserId, loggedInUser, text }) => {
        try {
          // creating the same room id again and sending the message to that room so that every user in the rooom can get it
          // const roomId = [targetUserId, loggedInUser].sort().join("_");
          const roomId = getSecretRoomId(targetUserId, loggedInUser); //secure ids
          console.log("sendMessage", firstName + " " + text);

          // Save messages to DB
          // Check if conversation history exists with this participants
          // if not create new chat
          let chat = await Chat.findOne({
            // finding chat where participants array has exactly this two user ids
            participants: { $all: [targetUserId, loggedInUser] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [targetUserId, loggedInUser],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: loggedInUser,
            text,
          });

          await chat.save();

          // Again emitting the event so that this time the client can listen to messageReceived event and display the message to both user
          io.to(roomId).emit("messageReceived", { firstName, text, loggedInUser });
        } catch (err) {
          console.error(err.message);
        }
      }
    );

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
