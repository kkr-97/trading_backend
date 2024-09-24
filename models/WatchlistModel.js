const { model } = require("mongoose");
const { WatchListSchema } = require("../schemas/WatchListSchema");

const WatchListModel = new model("watchlist", WatchListSchema);

module.exports = WatchListModel;
