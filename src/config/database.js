const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://tariqueanwar386:5Ini9RZyLtsP14Wy@clusternodejs.plnnj.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
