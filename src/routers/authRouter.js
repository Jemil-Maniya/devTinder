const express = require("express");
const { signUpValidator } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    signUpValidator(req);
    const { firstName, lastName, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    await user.save();
    res.send("User Created / Sign up success");
  } catch (err) {
    console.log("Signup Api error");
    res.send(err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Enter a valid email or password");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials - email");
    }
    const isValidPassword = await user.validatePassword(password);
    if (isValidPassword) {
      const token = await user.getJWT();
      res.cookie("token", token);

      // hide to show pass in res
      const userObj = user.toObject();
      delete userObj.password;
      delete userObj.__v

      res.json({ data :userObj });
    } else {
      throw new Error("Invalid Credentials - password");
    }
    console.log(user);
  } catch (err) {
    res.send("Login Problem" + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("LogOut");
});
module.exports = authRouter;
