const { UNDEF } = require("./constants");
const format = require("./format");

/**
 * ValueError
 *
 * Blork normally throws TypeError (or a custom error) when the value you're checking is invalid.
 * But! A ValueError is thrown when you're using Blork wrong.
 * - The type you're checking against (not the value you're checking) is invalid or doesn't exist.
 */
class ValueError extends TypeError {
	/**
	 * Constructor.
	 * @param {string} message Message describing what went wrong, e.g. "Must be a string"
	 * @param {mixed} value A value to debug shown at the end of the message, e.g. "Must be string (received 123)"
	 * @param {string} prefix=undefined An optional prefix for the message e.g. the function name or the name of the value, e.g. "name: Must be string (received 123)"
	 */
	constructor(message, value = UNDEF, prefix = UNDEF) {
		// Save message as normal.
		super(format(message, value, prefix));

		// Save value separately.
		if (value !== UNDEF) this.value = value;
	}
}
ValueError.name = "ValueError";
ValueError.message = "Invalid value";

// Exports.
module.exports = ValueError;
