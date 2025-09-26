const express = require("express");
const { signUpValidator } = require("./utils/validation");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { useAuth } = require("./middleware/auth");
const connectDB = require("./config/database");
const User = require("./models/user");
const cookieParser = require("cookie-parser");
const authRouter = require("./routers/authRouter");
const profileRouter = require("./routers/profileRouter");

const app = express();
// if we want to make the data from the end user then we have to call the express.json in the app.use

app.use(express.json());
app.use(cookieParser());
app.use("/", authRouter);
app.use("/", profileRouter);








app.patch("/user", async (req, res) => {
  const data = req.body;
  try {
    const UPDATE_ALLOWED = ["userid", "photoUrl", "about", "gender", "skills"];
    const isUpdateAllowed = Object.keys(data).every((k) =>
      UPDATE_ALLOWED.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("YOU CAN NOT CHANGE THIS FIELD");
    }
    const user = await User.findByIdAndUpdate(req.body.userid, data, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send(user);
  } catch (err) {
    console.log("/user put api err");
    res.send(err.message);
  }
});

app.delete("/user", async (req, res) => {
  try {
    const users = await User.findByIdAndDelete(req.body.userid);
    res.send("USER DELETED");
  } catch (err) {}
});

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      res.send("NOTHING TOP WATCH");
    } else {
      res.send(users);
    }
  } catch {
    console.log("get /feed error");
  }
});

app.get("/user", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.emailid });
    if (!user) {
      res.send("NO USER FOUND");
    } else {
      res.send(user);
    }
  } catch (err) {
    console.log("get /user error");
  }
});

connectDB()
  .then(() => {
    console.log("DB CONNECTED");
    app.listen(7777, () => {
      console.log("SERVER IS LISTENING ON PORT 7777");
    });
  })
  .catch(() => {
    console.log("DB NOT CONNECTED");
  });
