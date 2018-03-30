const ValueError = require("./errors/ValueError");
const BlorkError = require("./errors/BlorkError");
const blork = require("./functions/blork");
const debug = require("./functions/debug");
const format = require("./functions/format");
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
exports.BlorkError = BlorkError;
exports.ValueError = ValueError;
