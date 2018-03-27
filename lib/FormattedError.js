const format = require("./format.js");
const { UNDEF } = require("./constants");

/**
 * FormattedError
 * An error to extend that automatically formats errors in "prefix: message (received X)" format.
 */
class FormattedError extends Error {
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

// Exports.
module.exports = FormattedError;
