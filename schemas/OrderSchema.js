const { Schema } = require("mongoose");

const OrderSchema = new Schema({
  date: String,
  name: String,
  qty: Number,
  price: Number,
  mode: String,
});

module.exports = { OrderSchema };
