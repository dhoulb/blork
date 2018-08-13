const ValueError = require("./errors/ValueError");
const BlorkError = require("./errors/BlorkError");
const blork = require("./helpers/blork");
const debug = require("./helpers/debug");
const format = require("./helpers/format");
const destack = require("./helpers/destack");
const { CLASS, KEYS, VALUES, EMPTY } = require("./constants");

// Make a default instance.
module.exports = blork();

// Exports.
module.exports.blork = blork;
module.exports.format = format;
module.exports.debug = debug;
module.exports.destack = destack;
module.exports.BlorkError = BlorkError;
module.exports.ValueError = ValueError;
module.exports.CLASS = CLASS;
module.exports.KEYS = KEYS;
module.exports.VALUES = VALUES;
module.exports.EMPTY = EMPTY;
