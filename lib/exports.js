const blork = require("./blork");
const debug = require("./debug");
const format = require("./format");

// Make a default instance.
const { args, check, add, throws } = blork();

// Exports.
module.exports.blork = blork;
module.exports.args = args;
module.exports.check = check;
module.exports.throws = throws;
module.exports.add = add;
module.exports.format = format;
module.exports.debug = debug;
