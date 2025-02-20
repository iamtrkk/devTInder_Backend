const validator = require("validator");

const validateSignUpData = (body) => {
  const { firstName, lastName, emailId, password } = body;
  if (!firstName || !lastName) throw new Error("Name is not valid");
  else if (!validator.isEmail(emailId)) throw new Error("Emal is not valid");
  else if (!validator.isStrongPassword(password))
    throw new Error("Please enter a strong password");
};

const validateEditProfileData = (body) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "emailId",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];
  return Object.keys(body).every((field) => allowedFields.includes(field));
};

module.exports = { validateSignUpData, validateEditProfileData };
