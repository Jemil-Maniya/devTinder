const express = require("express");

const app = express();

// app.use((req, res) => {
//   res.send("NAMASTE DEVLOPERS");
// });

const connectDB = require("./config/database");
const User = require("./models/user");

app.post("/signUp", async (req, res) => {
  const user = new User({
    firstName: "jemil",
    lastName: "maniya",
    email: "jemilmaniya@gmail.com",
    password: "jemil123",
  });
  try {
    await user.save();
    res.send("USER ADDED ");
  } catch (error) {
    console.log("ERROR USER NOT ADDED");
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
