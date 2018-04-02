const format = require("../functions/format");

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
	constructor(message = "Invalid value", value = undefined, prefix = "") {
		// Save message through TypeError.
		// We format immediately (rather than in toString) because Jest (and presumably others) call .message directly.
		super(arguments.length > 1 ? format(message, value, prefix) : message);

		// Save parts separately.
		this.prefix = prefix;
		this.reason = message;
		if (arguments.length > 1) this.value = value;

		// Save name as constructor name (e.g. ValueError).
		this.name = this.constructor.name;
	}
}

// Exports.
module.exports = ValueError;
