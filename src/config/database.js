const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://jemilmaniya27:wL3I4U6ldzw6E7Lk@namastedev.dtvkl0d.mongodb.net/devTinder"
  );
};



module.exports = connectDB