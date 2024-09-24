const { model } = require("mongoose");
const { HoldingsSchema } = require("../schemas");

const HoldingsModel = new model("holding", HoldingsSchema);

module.exports = HoldingsModel;
