const { EMPTY } = require("../constants");
const debug = require("./debug");

/**
 * Format an error message.
 * Optionally with a prefix and a variable to debug.
 *
 * @param {string} message Message describing what went wrong, e.g. "Must be a string"
 * @param {mixed} value=EMPTY A value to debug shown at the end of the message, e.g. "Must be string (received 123)"
 * @param {string} prefix=undefined An optional prefix for the message e.g. the function name or the name of the value, e.g. "name: Must be string (received 123)"
 * @returns {string} The error message.
 */
function format(message, value, prefix) {
	// Defaults.
	if (arguments.length < 3) prefix = "";
	if (arguments.length < 2) value = EMPTY;

	// e.g. MyPrefix: Must be string (received 123)
	return (
		(typeof prefix === "string" && prefix.length > 0 ? `${prefix}: ` : "") +
		message +
		(value !== EMPTY ? ` (received ${debug(value)})` : "")
	);
}

// Exports.
module.exports = format;