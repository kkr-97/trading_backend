const { model } = require("mongoose");
const { OrderSchema } = require("../schemas/OrderSchema");

const OrdersModel = new model("order", OrderSchema);

module.exports = { OrdersModel };
