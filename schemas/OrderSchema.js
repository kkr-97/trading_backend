const { Schema } = require("mongoose");

const OrderSchema = new Schema({
  name: String,
  price: Number,
  percent: String,
  mode: String,
});

module.exports = { OrderSchema };
