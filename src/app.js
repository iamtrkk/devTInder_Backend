const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const { userAuth } = require("./middlewares/auth");
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const feedRouter = require("./routes/feed");
const cors = require("cors");

require("dotenv").config();

const app = express();

// common middle ware which will be matched to all requests because path is empty
app.use(
  cors({
    origin: "http://localhost:5173", // white listed domains
    credentials: true, // send cookies that is token here for auth
  })
); // allow cross origin
app.use(express.json()); // converts incoming json body to js object which known to js
app.use(cookieParser()); //Prases cookie to readable form

// Routers
app.use("/", authRouter);
app.use("/user", userAuth, userRouter);
app.use("/profile", userAuth, profileRouter);
app.use("/request", userAuth, requestRouter);
app.use("/feed", userAuth, feedRouter);

connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(process.env.PORT, () => {
      console.log("Server is successfully listening to port 5678");
    });
  })
  .catch((err) => {
    console.error("Couldn't connect to Database");
  });
