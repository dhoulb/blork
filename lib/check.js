const BlorkError = require("./BlorkError");
const checkers = require("./checkers");
const format = require("./format");

/**
 * Internal check.
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} instanceError Type of error that gets thrown if values don't match types.
 * @param {Object} instanceCheckers An object listing checkers for a Blork isntance.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function check(value, type, name, instanceError, instanceCheckers) {
	// Found.
	if (typeof type === "string") return checkString(value, type, name, instanceError, instanceCheckers);
	if (type instanceof Function) return checkFunction(value, type, name, instanceError);
	if (type instanceof Array) return checkArray(value, type, name, instanceError, instanceCheckers);
	if (type instanceof Object) return checkObject(value, type, name, instanceError, instanceCheckers);

	// Not found.
	throw new BlorkError(format("Blork type must be a string, function, array, or object", type));
}

/**
 * Internal check for string types, e.g. 'bool'
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} instanceError Type of error that gets thrown if values don't match types.
 * @param {Object} instanceCheckers An object listing checkers for a Blork isntance.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function checkString(value, type, name, instanceError, instanceCheckers) {
	// Find checker in list of checkers.
	let checker = instanceCheckers[type];

	// Checker didn't exist.
	if (!checker) {
		// Optional value (ends with '?')
		if (type.length > 0 && type[type.length - 1] === "?") {
			// Find checker without '?'.
			checker = instanceCheckers[type.slice(0, -1)];

			// Undefined.
			if (checker && value === undefined) return 0;
		}

		// Unknown checker.
		if (!checker) throw new BlorkError(`Blork type '${type}' does not exist`);
	}

	// Check, and error if it fails.
	const result = checker(value);

	// Error if it returned string.
	if (typeof result === "string") throw new instanceError(format(result, value, name));

	// Success if it returned anything else.
	return 1;
}

/**
 * Internal check for function types, e.g. Boolean
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} instanceError Type of error that gets thrown if values don't match types.
 * @param {Object} instanceCheckers An object listing checkers for a Blork isntance.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function checkFunction(value, type, name, instanceError) {
	// Vars.
	let result = true;

	// Switch for type.
	switch (type) {
		// Built-in types.
		case Boolean:
			result = checkers.bool(value);
			break;
		case Number:
			result = checkers.num(value);
			break;
		case String:
			result = checkers.str(value);
			break;
		// Other types do an instanceof check.
		default:
			if (!(value instanceof type)) result = `Must be an instance of ${type.name || "anonymous class"}`;
	}

	// Success if it returned true,
	if (result === true) return 1;

	// Error if it returned string.
	throw new instanceError(format(result, value, name));
}

/**
 * Internal check for array types, e.g. [Boolean]
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} instanceError Type of error that gets thrown if values don't match types.
 * @param {Object} instanceCheckers An object listing checkers for a Blork isntance.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function checkArray(value, type, name, instanceError, instanceCheckers) {
	// Value must be an array.
	if (value instanceof Array) {
		// Vars.
		const prefix = name.length ? name : "Array";
		let pass = 0;

		// Tuple array or normal array.
		if (type.length === 1) {
			// Normal array: Loop through items and check they match type[0]
			const l = value.length;
			for (let i = 0; i < l; i++)
				if (check(value[i], type[0], `${prefix}[${i}]`, instanceError, instanceCheckers)) pass++;
		} else {
			// Tuple array: Loop through types and match each with a value recursively.
			const l = type.length;
			for (let i = 0; i < l; i++)
				if (check(value[i], type[i], `${prefix}[${i}]`, instanceError, instanceCheckers)) pass++;

			// No excess items in a tuple.
			if (value.length > l)
				throw new instanceError(format(`Too many array items (expected ${l})`, value.length, prefix));
		}
		return pass;
	} else throw new instanceError(format("Must be an array", value, name));
}

/**
 * Internal check for object types, e.g. { bool: Boolean }
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} instanceError Type of error that gets thrown if values don't match types.
 * @param {Object} instanceCheckers An object listing checkers for a Blork isntance.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function checkObject(value, type, name, instanceError, instanceCheckers) {
	// Value must be an object.
	if (typeof value !== "object" || value === null) throw new instanceError(format("Must be an object", value, name));

	// Recurse into each type.
	let pass = 0;
	for (const key in type)
		if (check(value[key], type[key], name ? `${name}[${key}]` : key, instanceError, instanceCheckers)) pass++;
	return pass;
}

// Exports.
module.exports = check;
