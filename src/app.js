const express = require("express");

const app = express();

// app.use((req, res) => {
//   res.send("NAMASTE DEVLOPERS");
// });



app.get("/user", (req, res, next) => {
console.log(" 1st route without")
next()
},
(req, res, next)=>{
console.log("2nd route without")
next()
}, (req, res, next)=>{
  console.log("3rd rouye without")
  next()
}, (req, res, next)=> {
  console.log("4th rouye without")
  next()
},
(req, res)=> {
  console.log("5th route with response")
  res.send("finally get the working route!")
});

app.listen(7777, () => {
  console.log("SERVER IS LISTENING YOUR REQUEST");
});
