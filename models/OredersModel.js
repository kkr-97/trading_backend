const { model } = require("mongoose");
const { WatchListSchema } = require("../schemas/WatchListSchema");

const OrdersModel = new model("order", WatchListSchema);

module.exports = { OrdersModel };
