const express = require("express");
const { useAuth } = require("../middleware/auth");
const {
  editProfileValidator,
  forgotPasswordValidator,
} = require("../utils/validation");

const profileRouter = express.Router();

profileRouter.get("/profile", useAuth, async (req, res) => {
  try {
    const user = req.user;
    // console.log(req)
    res.send(user);
  } catch (err) {
    res.send("profile API Error" + err.message);
  }
});

profileRouter.patch("/profile/edit", useAuth, async (req, res) => {
  try {
    if (!editProfileValidator(req)) {
      throw new Error("Can not edit the profile");
    }
    const loggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.send(`${loggedInUser.firstName}, "Your PRofile Updated"`);
  } catch (err) {
    res.send("Error:" + err.message);
  }
});

profileRouter.patch("/profile/password", useAuth, async (req, res) => {
  try {
    const newHashedPassword = await forgotPasswordValidator(req);
    const loggedInUser = req.user;
    loggedInUser.password = newHashedPassword;
    await loggedInUser.save();
    res.send("password Updated")
  } catch (err) {
    res.send("Error: " + err.message);
  }
});

module.exports = profileRouter;
