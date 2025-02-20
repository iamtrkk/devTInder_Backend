const express = require("express");
const bcrypt = require("bcrypt");
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");

const router = express.Router();

//Sign up
router.post("/signup", async (req, res) => {
  // creatng a new instance of the user model
  // In spring also we used to create object using new keyword
  // const user = new User({
  //   firstName: "Tarique",
  //   lastName: "Anwar",
  //   emailId: "tariqueanwar386@gmail.com",
  //   password: "admin",
  // });
  try {
    // API level validation using helper function
    const body = req.body;
    validateSignUpData(body);

    // Getting data from request
    const { firstName, lastName, gender, emailId, password } = body;

    // encypting password to 10 salt bsically a encryption level
    const passwordHash = await bcrypt.hash(password, 10);

    // creatng a new instance of the user model
    // In spring also we used to create object using new keyword
    const user = new User({
      firstName,
      lastName,
      gender,
      emailId,
      password: passwordHash,
    });

    //DB crud operations always returns a promise so we have to use async await
    await user.save();

    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("Error saving user: " + err.message);
  }
});

//Login user
router.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    // Check if user exists or not by email
    // now here when we create instance we can also access schema methods like getjwt and password validator
    const user = await User.findOne({ emailId: emailId }); //This returns one document with matching field which is email here
    if (!user) throw new Error("Invalid credentials");

    // Now will compare user entered password with encrypted DB password via bcrypt library
    // const isPasswordValid = await bcrypt.compare(password, user.password); //moved to user schema
    const isPasswordValid = await user.validatePassword(password); //no need to add user.password
    if (!isPasswordValid) throw new Error("Invalid credentials");

    //Now if password valid create JWT Token
    // Here we create token and hide the logged in user id inside that token
    // const token = await jwt.sign({ _id: user._id }, "dev@Trk386", { // moved to user schema
    //   expiresIn: "1d", //means need to login again next day
    // });

    const token = await user.getJWT(); //no need to pass user.id, using instance of user which automaticlly gets id using this

    //Now add the token to cookie and send the response back to user
    res.cookie(
      "token",
      token
      // { expires: new Date(Date.now() + 8 * 3600000) } //means browser cookie will cleared in 8 hours but will stay valid at jwt level
    );

    res.send("Login successful");
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//Logout user
router.post("/logout", async (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .send("Logout successfull!!");
});

module.exports = router;
