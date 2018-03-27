const blork = require("./blork");
const debug = require("./debug");
const format = require("./format");
const { ANY } = require("./constants");

// Make a default instance.
const { args, check, add, throws } = blork();

// Exports.
exports.blork = blork;
exports.args = args;
exports.check = check;
exports.add = add;
exports.throws = throws;
exports.format = format;
exports.debug = debug;
exports.ANY = ANY;
