'use strict';

const auctionControl = require("./lib/auctionControlOptimized");

module.exports.AuctionControl = auctionControl;
module.exports.contracts = [auctionControl];