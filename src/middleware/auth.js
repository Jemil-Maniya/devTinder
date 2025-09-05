const useAuth = (req, res, next) => {
  const token = "xyz";
  const isAuth = token === "xyz";
  if (!isAuth) {
    res.send("Unauthorized access contact to the admin team ASAP!");
  } else {
    next();
  }
};

const isAdminAuth = (req, res, next) => {
  const token = "xyz";
  const isAuth = token === "xyz";
  if (isAuth) {
    next();
  } else {
    res.send("YOU ARE NOT A ADMIN")
  }
};

module.exports = {
  useAuth,
  isAdminAuth,
};
