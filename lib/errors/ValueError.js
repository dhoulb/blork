const format = require("../functions/format");
const { EMPTY } = require("../constants");

/**
 * ValueError
 * An error type that includes standardised formatting and prefixes.
 */
class ValueError extends TypeError {
	/**
	 * Constructor.
	 * @param {string} message Message describing what went wrong, e.g. "Must be a string"
	 * @param {mixed} value A value to debug shown at the end of the message, e.g. "Must be string (received 123)"
	 * @param {string} prefix=undefined An optional prefix for the message e.g. the function name or the name of the value, e.g. "name: Must be string (received 123)"
	 */
	constructor(message, value, prefix) {
		// Defaults.
		if (arguments.length < 3) prefix = "";
		if (arguments.length < 2) value = EMPTY;
		if (arguments.length < 1) message = "Invalid value";

		// Save message through TypeError.
		// We format the `.message` property itself (rather than on the fly in `.toString()`) because Jest and others call it directly.
		super(format(message, value, prefix));

		// Save parts separately.
		this.prefix = prefix;
		this.reason = message;
		if (value !== EMPTY) this.value = value;

		// Save name as constructor name (e.g. ValueError).
		this.name = this.constructor.name;
	}
}

// Exports.
module.exports = ValueError;
