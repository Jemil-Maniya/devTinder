const express = require("express");

const app = express();

// app.use((req, res) => {
//   res.send("NAMASTE DEVLOPERS");
// });

const { useAuth, isAdminAuth } = require("./middleware/auth");

app.use("/user", useAuth);

app.get("/user/login", (req, res, next) => {
  console.log("GET ALL USER");
  res.send("YOU ARE LOGIN SUCCESSFULLY");
});

app.get("/admin", isAdminAuth, (req, res) => {
  res.status(200).send("YOU ARE A ADMIN");
});

app.use("/", (err, req, res) => {
  if (err) {
    res.send("SOMETHING WENT WRONG INTERNAL ERROR");
  }
});

app.listen(7777, () => {
  console.log("SERVER IS LISTENING YOUR REQUEST");
});
