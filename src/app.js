const express = require("express");

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
  const user = await User.findByIdAndUpdate(req.body.userid, data, {
    returnDocument: "after",
  });
  try {
    res.send(user);
  } catch (err) {
    console.log("/user put api err");
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

app.post("/signUp", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.semd("USER ADDED");
  } catch (err) {
    console.log("POST /signUp error");
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
