const express = require("express");
const { signUpValidator } = require("./utils/validation");
const bcrypt = require("bcrypt");

const app = express();

// app.use((req, res) => {
//   res.send("NAMASTE DEVLOPERS");
// });

const connectDB = require("./config/database");
const User = require("./models/user");

// if we want to make the data from the end user then we have to call the express.json in the app.use

app.use(express.json());

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

app.post("/signup", async (req, res) => {
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

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new Error("Enter a valid email or password");
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials - email");
    }
    const passwordHash = user.password;
    const isValidPassword = await bcrypt.compare(password, passwordHash);
    if (!isValidPassword) {
      throw new Error("Invalid Credentials - password");
    }
    res.send("Login succesful");
    console.log(user);
  } catch (err) {
    res.send("Login Problem");
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
