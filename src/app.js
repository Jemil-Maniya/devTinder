const express = require("express");

const app = express();

app.use("/nodemon", (req, res)=> {
    res.send("IS NODEMON WORKING ?")
})

app.use("/use",(req,res)=>{
    res.send("START SCRIPT or dev script")
})

app.use("/test",(req, res)=> {
    res.send("TESTING IS OKAY ?")
})

app.use((req, res) => {
  res.send("NAMASTE DEVLOPERS");
});

app.listen(7777, () => {
  console.log("SERVER IS LISTENING YOUR REQUEST");
});
