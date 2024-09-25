const { model } = require("mongoose");
const { PostionsSchema } = require("../schemas/PositionsSchema");

const PositionsModel = new model("position", PostionsSchema);

module.exports = { PositionsModel };
