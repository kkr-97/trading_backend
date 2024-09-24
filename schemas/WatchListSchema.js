const { Schema } = require("mongoose");

const WatchListSchema = new Schema({
  name: String,
  price: Number,
  percent: String,
  isDown: Boolean,
});

module.exports = WatchListSchema;
