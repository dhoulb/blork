const ValueError = require("./errors/ValueError");
const BlorkError = require("./errors/BlorkError");
const blork = require("./functions/blork");
const debug = require("./functions/debug");
const format = require("./functions/format");

// Make a default instance.
const { args, check, add, checker, throws, prop } = blork();

// Exports.
exports.blork = blork;
exports.args = args;
exports.check = check;
exports.add = add;
exports.checker = checker;
exports.throws = throws;
exports.prop = prop;
exports.format = format;
exports.debug = debug;
exports.BlorkError = BlorkError;
exports.ValueError = ValueError;
