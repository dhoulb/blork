const format = require("../helpers/format");
const cause = require("../helpers/cause");
const { EMPTY } = require("../constants");

// Regexes.
const R_STARTS_WITH_FUNCTION = /^[a-zA-Z0-9-_.]+\(\): /;

/**
 * ValueError
 *
 * An error type that includes standardised formatting and prefixes.
 * ValueError semantically means "there is a problem with a value that has been passed into the current function".
 */
class ValueError extends TypeError {
	/**
	 * Constructor.
	 * @param {string} message="Invalid value" Message describing what went wrong, e.g. "Must be a string"
	 * @param {mixed} value=EMPTY A value to debug shown at the end of the message, e.g. "Must be string (received 123)"
	 * @param {string} prefix="" An optional prefix for the message e.g. the function name or the name of the value, e.g. "name: Must be string (received 123)"
	 */
	constructor(message, value, prefix) {
		// Defaults.
		if (arguments.length < 3) prefix = "";
		if (arguments.length < 2) value = EMPTY;
		if (arguments.length < 1) message = "Invalid value";

		// Super.
		super("******");

		// Pin down the cause of the error.
		// This looks through the Error.stack and finds where e.g. check() or args() was actually called.
		const frame = cause(this.stack);
		/* istanbul ignore else */
		if (frame) {
			// Was this not called by an anonymous function?
			if (frame.function) {
				// Prepend the calling function name to the prefix, e.g. "name" → "MyClass.myFunc(): name"
				if (!prefix) {
					// No prefix (just use function name).
					prefix = frame.function;
				} else if (!R_STARTS_WITH_FUNCTION.test(prefix)) {
					// Skip any prefixes that already have a ':' colon by matching the regexp.
					prefix = `${frame.function}: ${prefix}`;
				}
			}
			// Update file, line, column.
			this.fileName = frame.file;
			this.lineNumber = frame.line;
			this.stack = frame.stack;
		}

		// Save everything.
		this.message = format(message, value, prefix);
		this.prefix = prefix;
		this.reason = message;
		this.stack = this.stack.replace("******", this.message);
		if (value !== EMPTY) this.value = value;

		// Save name as constructor name (e.g. ValueError).
		this.name = this.constructor.name;
	}
}

// Exports.
module.exports = ValueError;
