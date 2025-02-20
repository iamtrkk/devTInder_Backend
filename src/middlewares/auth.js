const jwt = require("jsonwebtoken");
const User = require("../models/user");

// will fetch the user profile using jwt from cookie without any key like email provided in body or param
const userAuth = async (req, res, next) => {
  try {
    //getting token which is set on user browser while login
    const { token } = req.cookies;
    if (!token) throw new Error("Invalid Token!!!!!");

    // will get the hidden id from token which was hided during login
    const decodedObj = await jwt.verify(token, "dev@Trk386"); //secret key used during signing the token
    const { _id } = decodedObj;

    // then will use that id to get user details
    const user = await User.findById(_id);
    if (!user) throw new Error("User not found");

    //if user find then attaching and passing it to the next handler
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

module.exports = { userAuth };
