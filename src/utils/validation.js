const validator = require("validator");

const signUpValidator = (req) => {
  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Enter the valid name");
  } else if (!validator.isEmail(email)) {
    throw new Error("Invalid email");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is not strong");
  }
};

const editProfileValidator = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const allowedGender = ["male", "female"];

  const isEditableGender = allowedGender.includes(
    req.body.gender && req.body.gender.toLowerCase()
  );

  if (req.body.gender !== undefined && !isEditableGender) {
    throw new Error("Invalid gender");
  }

  const { firstName, lastName } = req.body;
  if (
    (firstName !== undefined &&
      (typeof firstName !== "string" || firstName.length < 2)) ||
    (lastName !== undefined &&
      (typeof lastName !== "string" || lastName.length < 2))
  ) {
    throw new Error("not a valid name");
  }
  const { photoUrl } = req.body;
  if (photoUrl !== undefined && !validator.isURL(photoUrl)) {
    throw new Error("not a valid image url");
  }
  const editableFields = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  return editableFields;
};

module.exports = { signUpValidator, editProfileValidator };
