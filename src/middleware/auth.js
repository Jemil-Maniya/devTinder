const jwt = require("jsonwebtoken");
const User = require("../models/user");

const useAuth = async (req, res, next) => {
  try {
    const cookie = req.cookies;
    const { token } = cookie;
    if (!token) {
      throw new Error("Token is not present");
    }
    const decoddedObj = await jwt.verify(token, "123");
    const _id = decoddedObj._id;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User not found");
    }
    req.user = user;

    next();
  } catch (err) {
    res.send("middle ware error:- " + err.message);
  }
};

module.exports = {
  useAuth,
};
