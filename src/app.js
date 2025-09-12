const express = require("express");

const app = express();

// app.use((req, res) => {
//   res.send("NAMASTE DEVLOPERS");
// });

const connectDB = require("./config/database");
const User = require("./models/user");

// if we want to make the data from the end user then we have to call the express.json in the app.use

app.use(express.json());

app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    console.log("/Feed error");
  }
});

app.post("/signUp", async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.send("USER ADDED");
  } catch (err) {
    console.log("USER NOT ADDED");
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
