const express = require("express");

const app = express();

// app.use((req, res) => {
//   res.send("NAMASTE DEVLOPERS");
// });

app.get("/user/:userID/:lastname", (req, res) => {
  console.log(req.query)
  console.log(req.params);
  res.send({ name: "Jemil", password: "nothing" });
});

app.post("/user", (req, res) => {
  res.send({ name: "nothing to post", password: "no password" });
});

app.listen(7777, () => {
  console.log("SERVER IS LISTENING YOUR REQUEST");
});
