const BlorkError = require("./BlorkError");
const format = require("./format");
const { ANY } = require("./constants");

// Vars.
const R_AND = /\s*&+\s*/;
const R_OR = /\s*\|+\s*/;
const R_OPTIONAL = /\?/;

/**
 * Internal check.
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} err Type of error that gets thrown if values don't match types.
 * @param {Object} checkers An object listing checkers for a Blork isntance.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function check(value, type, name, err, checkers) {
	// Defer to internal check, setting a blank typeStack and valueStack.
	return checkInternal(value, type, name, err, checkers, [], []);
}

/**
 * Internal internal check.
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} err Type of error that gets thrown if values don't match types.
 * @param {Object} checkers An object listing checkers for a Blork isntance.
 * @param {Array} typeStack The stack of parent types to track infinite loops.
 * @param {Array} valueStack The stack of parent values to track infinite loops.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function checkInternal(value, type, name, err, checkers, typeStack, valueStack) {
	// Found.
	if (typeof type === "string") return checkString(value, type, name, err, checkers);
	else if (type === true) return checkString(value, "true", name, err, checkers);
	else if (type === false) return checkString(value, "false", name, err, checkers);
	else if (type === null) return checkString(value, "null", name, err, checkers);
	else if (type === undefined) return checkString(value, "undefined", name, err, checkers);
	else if (type instanceof Function) return checkFunction(value, type, name, err, checkers);
	else if (type instanceof Array) return checkArray(value, type, name, err, checkers, typeStack, valueStack);
	else if (type instanceof Object) return checkObject(value, type, name, err, checkers, typeStack, valueStack);

	// Not found.
	throw new BlorkError(format("Blork type must be a string, function, array, or object", type));
}

/**
 * Internal check for string types, e.g. 'bool'
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {string} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} err Type of error that gets thrown if values don't match types.
 * @param {Object} checkers An object listing checkers for a Blork isntance.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function checkString(value, type, name, err, checkers) {
	// Locate checker and get result from it.
	const checker = getStringChecker(type, checkers);
	const result = checker(value);

	// Error if it returned string.
	if (typeof result === "string") throw new err(format(result, value, name));

	// Success if it returned anything else.
	return result ? 1 : 0; // 1 means success, 0 means not required.
}

/**
 * Turn a string type into a string checker.
 * @param {string} type The checker string e.g. "num" or "string".
 * @param {Object} checkers An object listing checkers for a Blork isntance.
 * @returns {function} The checker function corresponding to the string.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 */
function getStringChecker(type, checkers) {
	// Find checker in list of checkers.
	const checker = checkers[type] || lazyCreateChecker(type, checkers) || false;

	// Return checker or error.
	if (checker) return checker;

	// Failed to find checker.
	throw new BlorkError(`Blork type '${type}' does not exist`);
}

/**
 * Find a string checker, but create (on the fly) any smart checkers that need to exist.
 *
 * We do this lazily on first run, so the first time you check "str|num" the combined checker will be created and added to checkers.
 * The second time you use this checker, it will be simply reused.
 *
 * 1. OR checkers
 *    - Two or more checker names joined with " | "
 *    - Used if you need a value that can be multiple possible things at the same time.
 *    - Spaces around the pipe are optional (but recommended to enhance readability).
 *    e.g. "num | str" or "date|null" or "lower | upper | null | undefined"
 *
 * 2. AND checkers
 *    - Two or more checker names joined with " & "
 *    - Usually used if you want to combine a built-in checker with a custom checker.
 *    - Note that internal checkers already check type etc, i.e. no need to use "str&lower" as "lower" already checks stringiness.
 *    - Spaces around the pipe are optional (but recommended to enhance readability).
 *    e.g. "lower+ & unique-username" makes sure you have a lowercase non-empty string AND that it's a unique username.
 *
 * 2. Optional checkers
 *    - A checker name that ends in "?"
 *    - Allows the value to be the specified type OR undefined.
 *    e.g. "num?" allows numbers and undefined.
 *
 * @param {string} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {Object} checkers An object listing checkers for a Blork isntance.
 * @returns {function|undefined} The checker that was lazily created, or undefined if a checker could not be created.
 */
function lazyCreateChecker(type, checkers) {
	// AND checkers (two string checkers joined with "&")
	if (type.indexOf("&") > 0) {
		// Split type into list of types.
		const andTypes = type.split(R_AND);

		// Convert list of types into list of string checkers.
		const andCheckers = andTypes.map(t => getStringChecker(t, checkers));

		// Check each checker.
		const andChecker = value => {
			// Keep a list of errors.
			const errors = [];

			// Loop through AND types.
			for (const checker of andCheckers) {
				// Locate checker and get result from it.
				const result = checker(value);

				// If it returned a string error, add to list of errors.
				if (typeof result === "string") errors.push(result);
			}

			// Pass.
			return errors.length ? errors.implode(" and ") : 1;
		};

		// Add the AND checker to the list of checkers now it has been created.
		checkers[type] = andChecker;
		return andChecker;
	}

	// OR checkers (two string checkers joined with "|")
	if (type.indexOf("|") > 0) {
		// Split type into list of types.
		const orTypes = type.split(R_OR);

		// Convert list of types into list of string checkers.
		const orCheckers = orTypes.map(t => getStringChecker(t, checkers));

		// Check each checker.
		const orChecker = value => {
			// Keep a list of errors.
			const errors = [];

			// Loop through OR types.
			for (const checker of orCheckers) {
				// Locate checker and get result from it.
				const result = checker(value);

				// If it returns a string error, add to list of errors.
				if (typeof result === "string") errors.push(result);
				else return result;
			}

			// Return combined error.
			// e.g. "Must be string, or number, or null"
			return errors.join(" or ");
		};

		// Add the OR checker to the list of checkers now it has been created.
		checkers[type] = orChecker;
		return orChecker;
	}

	// Optional value (ends with '?'), e.g. "num?"
	if (type.indexOf("?") > 0) {
		// Find non optional checker (strip '?').
		const nonOptionalChecker = getStringChecker(type.replace(R_OPTIONAL, ""), checkers);

		// Create an optional checker for this optional type.
		// Returns 0 if undefined, or passes through to the normal checker.
		const optionalChecker = v => (v === undefined ? 0 : nonOptionalChecker(v));

		// Add the optionalChecker to the list and return it.
		checkers[type] = optionalChecker;
		return optionalChecker;
	}
}

/**
 * Internal check for function types, e.g. Boolean
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {Function} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} err Type of error that gets thrown if values don't match types.
 * @param {Object} checkers An object listing checkers for a Blork isntance.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function checkFunction(value, type, name, err, checkers) {
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
	throw new err(format(result, value, name));
}

/**
 * Internal check for array types, e.g. [Boolean]
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {Array} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} err Type of error that gets thrown if values don't match types.
 * @param {Object} checkers An object listing checkers for a Blork isntance.
 * @param {Array} typeStack The stack of parent types to track infinite loops.
 * @param {Array} valueStack The stack of parent values to track infinite loops.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function checkArray(value, type, name, err, checkers, typeStack, valueStack) {
	// Value must be an array (reuse the checker logic too.
	checkInternal(value, "array", name, err, checkers, typeStack, valueStack);

	// Prevent infinite loops.
	if (valueStack.indexOf(value) >= 0) return 1;
	if (typeStack.indexOf(type) >= 0)
		throw new BlorkError(format("Blork type must not contain circular references", value, name));
	typeStack.push(type);
	valueStack.push(value);

	// Vars.
	const prefix = name.length ? name : "Array";
	let pass = 0;

	// Tuple array or normal array.
	if (type.length === 1) {
		// Normal array: Loop through items and check they match type[0]
		const l = value.length;
		for (let i = 0; i < l; i++)
			if (checkInternal(value[i], type[0], `${prefix}[${i}]`, err, checkers, typeStack, valueStack)) pass++;
	} else {
		// Tuple array: Loop through types and match each with a value recursively.
		const l = type.length;
		for (let i = 0; i < l; i++)
			if (checkInternal(value[i], type[i], `${prefix}[${i}]`, err, checkers, typeStack, valueStack)) pass++;

		// No excess items in a tuple.
		if (value.length > l) throw new err(format(`Too many array items (expected ${l})`, value.length, prefix));
	}

	// Pass.
	typeStack.pop();
	valueStack.pop();
	return pass;
}

/**
 * Internal check for object types, e.g. { bool: Boolean }
 *
 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
 * @param {Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
 * @param {Error} err Type of error that gets thrown if values don't match types.
 * @param {Object} checkers An object listing checkers for a Blork isntance.
 * @param {Array} typeStack The stack of parent types to track infinite loops.
 * @param {Array} valueStack The stack of parent values to track infinite loops.
 *
 * @return {integer} Returns the number of values that passed their checks.
 * @throws {BlorkError} An error describing what went wrong (usually an error object).
 *
 * @internal
 */
function checkObject(value, type, name, err, checkers, typeStack, valueStack) {
	// Value must be an object (reuse the checker logic too.
	checkInternal(value, "object", name, err, checkers, typeStack, valueStack);

	// Prevent infinite loops.
	if (valueStack.indexOf(value) >= 0) return 1;
	if (typeStack.indexOf(type) >= 0)
		throw new BlorkError(format("Blork type must not contain circular references", value, name));
	typeStack.push(type);
	valueStack.push(value);

	// Vars.
	let pass = 0;
	const typeKeys = Object.keys(type);

	// Loop through each item in the types object.
	// No need to ignore the ANY key as Object.keys() doesn't get Symbol keys.
	for (let i = 0; i < typeKeys.length; i++) {
		const key = typeKeys[i];
		const prefix = name ? `${name}[${key}]` : key;
		if (checkInternal(value[key], type[key], prefix, err, checkers, typeStack, valueStack)) pass++;
	}

	// Is there an ANY key?
	if (type.hasOwnProperty(ANY)) {
		// Vars.
		const valueKeys = Object.keys(value);

		// Check that we actually need to do this loop by comparing the lengths.
		if (valueKeys.length > typeKeys.length) {
			// Make a list of the excess keys (that are in valueKeys but not in typeKeys).
			const excessKeys = valueKeys.filter(v => typeKeys.indexOf(v) === -1);

			// Loop through all excess keys.
			for (let i = 0; i < excessKeys.length; i++) {
				// Vars.
				const key = excessKeys[i];
				const prefix = name ? `${name}[${key}]` : key;

				// Check all excess keys against the ANY type.
				if (checkInternal(value[key], type[ANY], prefix, err, checkers, typeStack, valueStack)) pass++;
			}
		}
	}

	// Pass.
	typeStack.pop();
	valueStack.pop();
	return pass;
}

// Exports.
module.exports = check;
