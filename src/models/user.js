const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// A schema is basically like a class in java which is blue print of data
// And then we create a model which helps to create objects which is actual instance of a class
// Basically a DTO in spring boot
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true, //These are DB leve validators
      // index: true, //helps optimizing db query either put it here or add it while querying
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
      maxLength: 50,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true, //remove whitespaces
      validate(value) {
        //custom validation using validator library
        if (!validator.isEmail(value))
          throw new Error("Invalid Email " + value);
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        //custom validation using validator library
        if (!validator.isStrongPassword(value))
          throw new Error("weak password " + value);
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      // required: true,
      validate(value) {
        //custom validation
        if (!["male", "female", "others"].includes(value)) {
          throw new Error("Gender not valid");
        }
      },
      //Same thing as above validator
      // enum: {
      //   values: ["male", "female", "others"],
      //   message: `${VALUE} is incorrect gender type`,
      // },
    },
    photoUrl: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/666/666201.png",
      validate(value) {
        //custom validation using validator library
        if (!validator.isURL(value)) throw new Error("Invalid url " + value);
      },
    },
    about: {
      type: String,
      default: "This is a default about",
    },
    skills: {
      type: [String],
    },
  },
  { timestamps: true }
);

// We can define user related operations here in schema only which will make our api code cleaner
// just helper functions good to define here because it automatically get attached to the instance of the current user
// no need to verify and call the function by id it will auto fetch

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  // dont user arrow function here
  const user = this; // refering to current instance of user
  const passwordHash = user.password;

  // Now will compare user entered password with encrypted DB password via bcrypt library
  const isPasswordValid = await bcrypt.compare(
    passwordInputByUser,
    passwordHash
  );

  return isPasswordValid;
};

userSchema.methods.getJWT = async function () {
  const user = this;

  // Here we create token and hide the logged in user id inside that token
  const token = await jwt.sign({ _id: user._id }, "dev@Trk386", {
    expiresIn: "1d", //means need to login again next day
  });
  return token;
};

module.exports = mongoose.model("User", userSchema);
