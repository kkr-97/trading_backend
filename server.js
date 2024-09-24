const express = require("express");
const mongoose = require("mongoose");

const app = express();
require("dotenv").config();
const port = process.env.PORT || 3002;
const uri = process.env.MONGODB_URI;

const connectDB = async () => {
  await mongoose
    .connect(uri)
    .then(() => console.log("MongoDB Connected..."))
    .catch((e) => console.error("Connection Error: ", e));
};

app.listen(port, () => {
  connectDB();
  console.log("Server is running in 3001 port");
});
