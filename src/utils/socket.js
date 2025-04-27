const socket = require("socket.io");
const crypto = require("crypto");

//Creating complex roomId bcz just joining two ids can be easily guessed and hacked
//also we can use jwt verification
const getSecretRoomId = (userId, targetUserId) => {
  const roomId = [userId, targetUserId].sort().join("_");
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
    socket.on("joinChat", ({ loggedInUser, userId, firstName }) => {
      //creating room id to be unique for each chat with same people sorting to maintain the order of room id
      // const roomId = [loggedInUser, userId].sort().join("_");
      const roomId = getSecretRoomId(userId, loggedInUser); //secure ids
      console.log(firstName + " Joined room: " + roomId);
      socket.join(roomId);
    });

    socket.on("sendMessage", ({ firstName, userId, loggedInUser, text }) => {
      // creating the same room id again and sending the message to that room so that every user in the rooom can get it
      // const roomId = [userId, loggedInUser].sort().join("_");
      const roomId = getSecretRoomId(userId, loggedInUser); //secure ids
      console.log(firstName + " " + text);
      // Again emitting the event so that this time the client can listen to messageReceived event and display the message
      io.to(roomId).emit("messageReceived", { firstName, text });
    });

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
