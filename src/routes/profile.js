const express = require("express");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");

const router = express.Router();

//getProfile
router.get("/", async (req, res) => {
  try {
    // auth middleware now doing authentication and if user found after token validation
    //it attaches the user in req and passes on to next
    // as we new next will work till res.send is called
    const user = req.user;
    res.send(user);
  } catch (err) {
    res.status(400).send("user does not exist");
  }
});

//Update Profile
router.patch("/", async (req, res) => {
  try {
    const { body } = req;
    if (!validateEditProfileData(body))
      throw new Error("Invalid field requested");

    const loggedInUser = req.user;

    Object.keys(body).forEach((key) => (loggedInUser[key] = body[key]));
    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfully`,
      data: { loggedInUser },
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
});

//update profile password
router.patch("/password", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) throw new Error("Please send password");
    if (!validator.isStrongPassword(password)) throw new Error("weak password");

    const user = req.user;
    user["password"] = await bcrypt.hash(password, 10);

    await user.save(res.send(`Password updated for ${user.firstName}`));
  } catch (error) {
    res.status(400).send("Error: " + error.message);
  }
});

module.exports = router;
