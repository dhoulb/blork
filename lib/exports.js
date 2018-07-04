const ValueError = require("./errors/ValueError");
const BlorkError = require("./errors/BlorkError");
const blork = require("./functions/blork");
const debug = require("./functions/debug");
const format = require("./functions/format");
const { CLASS, KEYS, VALUES } = require("./constants");

// Make a default instance.
module.exports = blork();

// Exports.
module.exports.blork = blork;
module.exports.format = format;
module.exports.debug = debug;
module.exports.BlorkError = BlorkError;
module.exports.ValueError = ValueError;
module.exports.CLASS = CLASS;
module.exports.KEYS = KEYS;
module.exports.VALUES = VALUES;
