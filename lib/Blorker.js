// @flow
const ValueError = require("./ValueError");
const BlorkError = require("./BlorkError");
const format = require("./format");
const { ANY } = require("./constants");

// Vars.
const R_AND = /\s*&+\s*/;
const R_OR = /\s*\|+\s*/;
const R_OPTIONAL = /\?/;

/**
 * Check a value with a specified checker.
 * Fast, but doesn't work with nested objects or arrays.
 *
 * @param {function} checker The checker to check.
 * @param {mixed} value The value to check.
 * @param {string} prefix A prefix for the error message.
 * @param {Error} error The error to throw if the checker fails (used if the checker doesn't have a custom Error).
 * @return {void}
 */
function runChecker(checker, value, prefix, error) {
	// Check the value. If we fail, throw.
	if (!checker(value))
		// Throw either checker.error or error with standardised message.
		throwError(checker.error || error, `Must be ${checker.desc}`, value, prefix);
}

// Throw an error.
// Pass in arguments differently if it's a ValueError.
function throwError(error, message, value, prefix) {
	// Treat ValueError errors differently.
	if (error.prototype instanceof ValueError)
		// If it's a ValueError, pass in the correct arguments and throw it.
		throw new error(message, value, prefix);
	else
		// Otherwise preformat the error and throw it.
		throw new error(format(message, value, prefix));
}

/**
 * Blorker class.
 * Holds a set of checkers with string keys and provides helper lookup functions.
 */
class Blorker {
	/**
	 * Constructor.
	 * @param {object} checkers An object like { checkerType: checkerFunc }
	 */
	constructor(checkers) {
		// Default error message to use.
		this._error = ValueError;

		// Clone the input of checkers to this._checkers.
		this._checkers = Object.assign({}, checkers);

		// Storage to prevent infinite loops.
		this._stack = [];
		this._stack = [];

		// Binding (we pass these to map() so it needs a reference to this).
		this._find = this._find.bind(this);
	}

	/**
	 * Check values against types.
	 * Throws an error if a value doesn't match a specified type.
	 *
	 * @param {mixed} value A single value (or object/array with multiple values) to check against the type(s).
	 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} prefix='' Prefix for error messages, to assist debugging.
	 * @return {void}
	 * @throws An error describing what went wrong (usually an error object).
	 */
	check(value, type, prefix = "") {
		// Check args.
		runChecker(this._checkers.string, prefix, "arguments[2]", BlorkError);

		// Reset loop protection.
		this._stack = false;

		// Check the value against the type.
		this._check(value, type, prefix);
	}

	/**
	 * Check function arguments against types.
	 * Same as check() but slightly friendlier and easier to use.
	 *
	 * @param {object} argsobj The entire arguments object from the function call. Must have a .length property.
	 * @param {array} types A set of types corresponding to the argument.
	 * @return {void}
	 * @throws An error describing what went wrong (usually an error object).
	 */
	args(argsobj, types) {
		// Check args.
		runChecker(this._checkers.args, argsobj, "arguments[0]", BlorkError);
		runChecker(this._checkers.array, types, "arguments[1]", BlorkError);

		// Reset loop protection.
		this._stack = false;

		// Vars.
		const l = types.length;

		// Recurse into each type.
		for (let i = 0; i < l; i++) this._check(argsobj[i], types[i], `arguments[${i}]`);

		// No excess arguments.
		if (argsobj.length > l)
			throwError(this._error, `Too many arguments (expected ${l})`, argsobj.length, "arguments");
	}

	/**
	 * Add a new custom checker.
	 *
	 * Checker function should take in a value, check it and return `true` (success) or `false` (fail).
	 * This format is chosen because it allows buttery constructions like `check.add(const str = v => (typeof v === 'string' || 'must be string');
	 *
	 * @param {string} name The type reference for the checker.
	 * @param {function} checker A checker function: Takes a single argument (value), tests it, and returns either true (success) or an error message string in the 'Must be X' format.
	 * @param {string} desc="" A description of the type of value that's valid for this checker, e.g. "positive number" or "unique string". Defaults to same value as name.
	 * @param {Error} err=undefined A custom error that applies only to this custom checker.
	 * @return {void}
	 */
	add(name, checker, desc = "", err) {
		// Check args.
		runChecker(this._checkers["lower+"], name, "arguments[0]", BlorkError);
		runChecker(this._checkers.function, checker, "arguments[1]", BlorkError);
		runChecker(this._checkers.string, desc, "arguments[2]", BlorkError);
		if (err) runChecker(this._checkers.function, err, "arguments[3]", BlorkError);

		// Don't double up.
		if (this._checkers[name]) throw new BlorkError(`Blork type already exists`, name);

		// Save the checker and save desc to it.
		this._checkers[name] = checker;
		checker.desc = desc || name;
		if (err) checker.error = err;
	}

	/**
	 * Set the error any failed checks should throw.
	 * @param {Error} error The error constructor to use, e.g. `TypeError` or `MyCustomError`
	 * @return {void}
	 */
	throws(error) {
		// Check args.
		runChecker(this._checkers.function, error, "arguments[0]", BlorkError, this);

		// Save err.
		this._error = error;
	}

	/**
	 * Find the checker corresponding to a string.
	 *
	 * @param {string} type The checker string e.g. "num" or "string".
	 * @returns {function} The checker function corresponding to the string.
	 * @throws {BlorkError} An error describing what went wrong (usually an error object).
	 */
	_find(type) {
		// Locate checker or lazy initiate checkers.
		const checker = this._checkers[type] || this._lazyCreateChecker(type) || false;

		// Return the checker if found, or error.
		if (checker) return checker;
		else throw new BlorkError(`Blork type does not exist`, type);
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
	 * @param {Blorker} checkers An object listing checkers for a Blork isntance.
	 * @returns {function|undefined} The checker that was lazily created, or undefined if a checker could not be created.
	 */
	_lazyCreateChecker(type) {
		// AND checkers (two string checkers joined with "&")
		if (type.indexOf("&") > 0) {
			// Split type and get corresponding checker for each.
			const andCheckers = type.split(R_AND).map(this._find);

			// Check each checker.
			const andChecker = value => {
				// Loop through and call each checker.
				for (const checker of andCheckers) if (!checker(value)) return false; // Fail.
				return true; // Otherwise pass.
			};

			// Description message joins the descriptions for the checkers.
			andChecker.desc = andCheckers.map(checker => checker.desc).join(" and ");

			// Add the AND checker to the list of checkers now it has been created.
			this._checkers[type] = andChecker;
			return andChecker;
		}

		// OR checkers (two string checkers joined with "|")
		if (type.indexOf("|") > 0) {
			// Split type and get corresponding checker for each.
			const orCheckers = type.split(R_OR).map(this._find);

			// Check each checker.
			const orChecker = value => {
				// Loop through and call each checker.
				for (const checker of orCheckers) if (checker(value)) return true; // Pass.
				return false; // Otherwise fail.
			};

			// Description message joins the descriptions for the checkers.
			orChecker.desc = orCheckers.map(checker => checker.desc).join(" or ");

			// Add the OR checker to the list of checkers now it has been created.
			this._checkers[type] = orChecker;
			return orChecker;
		}

		// Optional value (ends with '?'), e.g. "num?"
		if (type.indexOf("?") > 0) {
			// Find non optional checker (strip '?').
			const nonOptionalChecker = this._find(type.replace(R_OPTIONAL, ""));

			// Create an optional checker for this optional type.
			// Returns 0 if undefined, or passes through to the normal checker.
			const optionalChecker = v => (v === undefined ? true : nonOptionalChecker(v));

			// Description message joins the descriptions for the checkers.
			optionalChecker.desc = `${nonOptionalChecker.desc} or empty`;

			// Add the optionalChecker to the list and return it.
			this._checkers[type] = optionalChecker;
			return optionalChecker;
		}
	}

	/**
	 * Internal check function.
	 * Actually does the checking!
	 *
	 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
	 * @param {mixed} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
	 * @param {array} typeStack=[] A stack of parent types to detect infinite loops.
	 * @param {array} valueStack=[] A stack of parent values to detect infinite loops.
	 * @return {void}
	 *
	 * @internal
	 */
	_check(value, type, name) {
		// Found.
		if (typeof type === "string") runChecker(this._find(type), value, name, this._error);
		else if (type === true) runChecker(this._checkers.true, value, name, this._error);
		else if (type === false) runChecker(this._checkers.false, value, name, this._error);
		else if (type === null) runChecker(this._checkers.null, value, name, this._error);
		else if (type === undefined) runChecker(this._checkers.undefined, value, name, this._error);
		else if (type === Boolean) runChecker(this._checkers.boolean, value, name, this._error);
		else if (type === Number) runChecker(this._checkers.number, value, name, this._error);
		else if (type === String) runChecker(this._checkers.string, value, name, this._error);
		else if (type instanceof Function) {
			// Functions do an instanceof check.
			if (!(value instanceof type))
				throwError(this._error, `Must be instance of ${type.name || "anonymous class"}`, value, name);
		} else if (type instanceof Array) {
			// Pass to checkArray.
			this._checkArray(value, type, name);
		} else if (type instanceof Object) {
			// Pass to checkObject.
			this._checkObject(value, type, name);
		} else {
			// Not found.
			throw new BlorkError("Blork type must be a string, function, array, or object", type);
		}
	}

	/**
	 * Internal check for array types, e.g. [Boolean]
	 *
	 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
	 * @param {Array} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
	 *
	 * @return {integer} Returns the number of values that passed their checks.
	 * @throws {BlorkError} An error describing what went wrong (usually an error object).
	 *
	 * @internal
	 */
	_checkArray(value, type, name) {
		// Value itself must be an array (check using the array checker).
		runChecker(this._checkers.array, value, name, this._error);

		// Prevent infinite loops.
		if (this._stack) {
			if (this._stack.indexOf(type) >= 0)
				throw new BlorkError("Blork type must not contain circular references", value, name);
			if (this._stack.indexOf(value) >= 0) return;
			this._stack.push(type);
			this._stack.push(value);
		} else this._stack = [type, value];

		// Vars.
		const prefix = name.length ? name : "Array";

		// Tuple array or normal array.
		if (type.length === 1) {
			// Normal array
			// Loop through items and check they match type[0]
			const length = value.length;
			for (let i = 0; i < length; i++) this._check(value[i], type[0], `${prefix}[${i}]`);
		} else {
			// Tuple array
			// Loop through types and match each with a value recursively.
			const length = type.length;
			for (let i = 0; i < length; i++) this._check(value[i], type[i], `${prefix}[${i}]`);

			// No excess items in a tuple.
			if (value.length > length) throwError(this._error, `Must have ${length} items`, value.length, prefix);
		}

		// Pass.
		this._stack.pop();
		this._stack.pop();
	}

	/**
	 * Internal check for object types, e.g. { bool: Boolean }
	 *
	 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
	 * @param {Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
	 *
	 * @return {integer} Returns the number of values that passed their checks.
	 * @throws {BlorkError} An error describing what went wrong (usually an error object).
	 *
	 * @internal
	 */
	_checkObject(value, type, name) {
		// Value itself must be an object (check using the object checker).
		runChecker(this._checkers.object, value, name, this._error);

		// Prevent infinite loops.
		if (this._stack) {
			if (this._stack.indexOf(type) >= 0)
				throw new BlorkError("Blork type must not contain circular references", value, name);
			if (this._stack.indexOf(value) >= 0) return;
			this._stack.push(type);
			this._stack.push(value);
		} else this._stack = [type, value];

		// Vars.
		const typeKeys = Object.keys(type);

		// Loop through each item in the types object.
		// No need to ignore the ANY key as Object.keys() doesn't get Symbol keys.
		for (let i = 0; i < typeKeys.length; i++) {
			const key = typeKeys[i];
			const prefix = name ? `${name}[${key}]` : key;
			this._check(value[key], type[key], prefix);
		}

		// Is there an ANY key?
		if (type.hasOwnProperty(ANY)) {
			// Vars.
			const valueKeys = Object.keys(value);

			// Check that we actually need to do this loop by comparing the lengths.
			if (valueKeys.length > typeKeys.length) {
				// Make a list of the excess keys (that are in valueKeys but not in typeKeys).
				const excessKeys = valueKeys.filter(v => typeKeys.indexOf(v) === -1);

				// Loop through all excess keys and check against the ANY key.
				for (let i = 0; i < excessKeys.length; i++) {
					const key = excessKeys[i];
					const prefix = name ? `${name}[${key}]` : key;
					this._check(value[key], type[ANY], prefix);
				}
			}
		}

		// Pass.
		this._stack.pop();
		this._stack.pop();
	}
}

// Exports.
module.exports = Blorker;
