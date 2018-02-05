/**
 * Neatly convert any value into a string for debugging.
 * @param {mixed} value The value to debug.
 * @return {string} String representing the debugged value.
 */
function debug(value) {
	if (value === null) return "null";
	else if (value === undefined) return "undefined";
	else if (value === true) return "true";
	else if (value === false) return "false";
	else if (typeof value === "number") {
		// e.g. 123.456
		return value.toString();
	} else if (typeof value === "symbol") {
		// e.g. Symbol(foo)
		return value.toString();
	} else if (typeof value === "string") {
		// e.g. 123 or 456.789
		return JSON.stringify(value);
	} else return debugObject(value);
}

/**
 * Debug an object.
 * @param {object} value The value to debug.
 * @return {string} String representing the debugged value.
 * @internal
 */
function debugObject(value) {
	// Function, e.g. myFunc()
	if (value instanceof Function) {
		// Named function.
		if (value.name.length > 0) return `${value.name}()`; // tslint:disable-line:no-unsafe-any
		// Unnamed function.
		return "anonymous function";
	}

	// Find the right value.
	if (value.constructor instanceof Function && value.constructor.name.length > 0) {
		// Error, e.g. TypeError "Must be a string"
		if (value instanceof Error) return `${value.constructor.name} ${debug(value.message)}`;
		// Date, e.g. 2011-10-05T14:48:00.000Z
		if (value instanceof Date) return value.toISOString();
		// Regular expression, e.g. /abc/
		if (value.constructor === RegExp) return value.toString();
		// Array, e.g. Array: [1, 3, 4]
		if (value.constructor === Array) return JSON.stringify(value, undefined, "\t");
		// Object, e.g. Object: { "a": 123 }
		if (value.constructor === Object) return JSON.stringify(value, undefined, "\t");
		// Other object with named constructor.
		return `instance of ${value.constructor.name}`;
	}

	// Other unnamed object.
	return "instance of anonymous class";
}

// Exports.
module.exports = debug;
