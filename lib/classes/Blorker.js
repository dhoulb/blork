const ValueError = require("../errors/ValueError");
const BlorkError = require("../errors/BlorkError");
const modify = require("../helpers/modify");
const format = require("../helpers/format");
const { CLASS, KEYS, VALUES, EMPTY } = require("../constants");

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
		throwError(checker.error || error, `${checker.prefix || "Must be"} ${checker.desc}`, value, prefix);
}

/**
 * Throw an error.
 * Passes arguments to the error differently if it's a ValueError.
 *
 * @param {Error} error The error to throw.
 * @param {string} message The message for the error.
 * @param {mixed} value The incorrect value to show debugged in the error.
 * @param {string} prefix A prefix to show at the start of the message.
 * @returns {void}
 */
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
	 * @param {object} modifiers An array containing one or more modifiers.
	 */
	constructor(checkers, modifiers) {
		// Default error message to use.
		this.error = ValueError;

		// Clone the input of checkers to this.checkers.
		this.checkers = Object.assign({}, checkers);

		// Clone the input of modifiers to this.modifiers.
		this.modifiers = modifiers;

		// Bind some things.
		this.find = this.find.bind(this);
		this.Blorker$checker = this.Blorker$checker.bind(this);
		this.Blorker$assert = this.Blorker$assert.bind(this);
		this.Blorker$check = this.Blorker$check.bind(this);
		this.Blorker$args = this.Blorker$args.bind(this);
		this.Blorker$add = this.Blorker$add.bind(this);
		this.Blorker$throws = this.Blorker$throws.bind(this);

		// Freeze.
		Object.freeze(this.modifiers);
		Object.seal(this);
	}

	/**
	 * Return a specific checker.
	 *
	 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @return {function} The specified checker or undefined if it doesn't exist.
	 */
	Blorker$checker(type) {
		// Check args.
		runChecker(this.checkers.string, type, "checker(): type", BlorkError);

		// Check.
		return this.find(type);
	}

	/**
	 * Assert that a statement is true.
	 *
	 * @param {boolean} assertion A boolean assertion. (true if the assertion passed, false if not).
	 * @param {string} description="" A description of the positive assertion. Must fit the phrase `Must ${description}`, e.g. "be unique" or "be equal to dog".
	 * @param {string} prefix='' Prefix for error messages, to assist debugging.
	 * @param {Error} error=void Error type to throw if something goes wrong (defaults to default error).
	 * @return {void}
	 */
	Blorker$assert(assertion, description, prefix, error) {
		// Check args.
		runChecker(this.checkers.string, description, "assert(): description", BlorkError);
		if (prefix) runChecker(this.checkers.string, prefix, "assert(): prefix", BlorkError);
		if (error) runChecker(this.checkers.function, error, "assert(): error", BlorkError);

		// Enforce assertion.
		if (!assertion) throwError(error || this.error, `Must ${description}`, EMPTY, prefix || "");
	}

	/**
	 * Check values against types.
	 * Throws an error if a value doesn't match a specified type.
	 *
	 * @param {mixed} value A single value (or object/array with multiple values) to check against the type(s).
	 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} prefix="" Prefix for error messages, to assist debugging.
	 * @param {Error} error=void Error type to throw if something goes wrong (defaults to default error).
	 * @return {void}
	 * @throws An error describing what went wrong (usually an error object).
	 */
	Blorker$check(value, type, prefix, error) {
		// Check args.
		if (prefix) runChecker(this.checkers.string, prefix, "check(): prefix", BlorkError);
		if (error) runChecker(this.checkers.function, error, "check(): error", BlorkError);

		// Check the value against the type.
		this.check(value, type, prefix || "", error || this.error);
	}

	/**
	 * Check function arguments against types.
	 * Same as check() but slightly friendlier and easier to use.
	 *
	 * @param {object} args The entire arguments object from the function call. Must have a .length property.
	 * @param {array} types A set of types corresponding to the argument.
	 * @param {string} prefix Prefix for error messages, to assist debugging. Defaults to "arguments"
	 * @param {Error} error=void Error type to throw if something goes wrong (defaults to default error).
	 * @return {void}
	 * @throws An error describing what went wrong (usually an error object).
	 */
	Blorker$args(args, types, prefix, error) {
		// Check args.
		runChecker(this.checkers.args, args, "args(): args", BlorkError);
		runChecker(this.checkers.array, types, "args(): types", BlorkError);
		if (prefix) runChecker(this.checkers.string, prefix, "args(): prefix", BlorkError);
		if (error) runChecker(this.checkers.function, error, "args(): error", BlorkError);

		// Recurse into each type.
		for (let i = 0; i < types.length; i++) {
			this.check(args[i], types[i], `${prefix || "arguments"}[${i}]`, error || this.error);
		}

		// No excess arguments.
		if (args.length > types.length)
			throwError(error || this.error, `Must have ${types.length} arguments`, args.length, prefix || "arguments");
	}

	/**
	 * Add a new custom checker.
	 *
	 * Checker function should take in a value, check it and return `true` (success) or `false` (fail).
	 * This format is chosen because it allows buttery constructions like `check.add(const str = v => typeof v === 'string', 'string');
	 *
	 * @param {string} name The type reference for the checker in kebab-case format.
	 * @param {function} checker A checker function: Takes a single argument (value), tests it, and returns either true (success) or an error message string in the 'Must be X' format.
	 * @param {string} description A description of the type of value that's valid. Must fit the phrase `Must be ${description}`, e.g. "positive number" or "unique string". Defaults to name.
	 * @param {Error} error=undefined A custom error that applies only to this custom checker.
	 * @return {void}
	 */
	Blorker$add(name, checker, description, error) {
		// Check args.
		runChecker(this.checkers.kebab, name, "add(): name", BlorkError);
		runChecker(this.checkers.function, checker, "add(): checker", BlorkError);
		if (description) runChecker(this.checkers.string, description, "add(): description", BlorkError);
		if (error) runChecker(this.checkers.function, error, "add(): error", BlorkError);

		// Don't double up.
		if (this.checkers[name]) throwError(BlorkError, "Blork type already exists", name, "add(): name");

		// Save the checker and save desc to it.
		this.checkers[name] = checker;
		checker.desc = description || name;
		if (error) checker.error = error;
	}

	/**
	 * Set the error any failed checks should throw.
	 * @param {Error} error The error constructor to use, e.g. `TypeError` or `MyCustomError`
	 * @return {void}
	 */
	Blorker$throws(error) {
		// Check args.
		runChecker(this.checkers.function, error, "throws(): error", BlorkError);

		// Save err.
		this.error = error;
	}

	/**
	 * Internal find a checker.
	 *
	 * @param {string} type A single stringy type reference (e.g. 'str').
	 * @return {function} The found checker function.
	 */
	find(type) {
		// Return the checker.
		if (this.checkers[type]) return this.checkers[type];

		// Try to create the checker.
		this.checkers[type] = modify(this.modifiers, type, this.find);
		if (this.checkers[type]) return this.checkers[type];

		// Not found.
		throwError(BlorkError, "Checker not found", type);
	}

	/**
	 * Internal check function.
	 * Actually does the checking!
	 *
	 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
	 * @param {mixed} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} prefix Prefix for error messages to assist debugging.
	 * @param {Error} error The error that's thrown if the check doesn't pass.
	 * @param {Array} stack Protect against infinite loops.
	 * @return {void}
	 *
	 * @internal
	 */
	check(value, type, prefix, error, stack) {
		// Found.
		if (typeof type === "string") {
			// Use find() to locate (or create) a corresponding checker and run it.
			return runChecker(this.find(type), value, prefix, error);
		} else if (type === true) {
			// Use true.
			return runChecker(this.checkers.true, value, prefix, error);
		} else if (type === false) {
			// Use false.
			return runChecker(this.checkers.false, value, prefix, error);
		} else if (type === null) {
			// Use null.
			return runChecker(this.checkers.null, value, prefix, error);
		} else if (type === undefined) {
			// Use undefined.
			return runChecker(this.checkers.undefined, value, prefix, error);
		} else if (type === Boolean) {
			// Use boolean.
			return runChecker(this.checkers.boolean, value, prefix, error);
		} else if (type === Number) {
			// Use number.
			return runChecker(this.checkers.number, value, prefix, error);
		} else if (type === String) {
			// Use string.
			return runChecker(this.checkers.string, value, prefix, error);
		} else if (type instanceof Function) {
			// Functions do an instanceof check.
			if (!(value instanceof type))
				throwError(this.error, `Must be instance of ${type.name || "anonymous class"}`, value, prefix);
		} else if (type instanceof Array) {
			// Pass to checkArray.
			return this.checkArray(value, type, prefix, error, stack);
		} else if (type instanceof Object) {
			// Pass to checkObject.
			return this.checkObject(value, type, prefix, error, stack);
		} else {
			// Not found.
			throwError(BlorkError, "Blork type must be a string, function, array, or object", type);
		}
	}

	/**
	 * Internal check for array types, e.g. [Boolean]
	 *
	 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
	 * @param {Array} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} prefix Prefix for error messages to assist debugging.
	 * @param {Error} error The error that's thrown if the check doesn't pass.
	 * @param {Array} stack Protect against infinite loops.
	 * @return {void}
	 *
	 * @internal
	 */
	checkArray(value, type, prefix, error, stack) {
		// Value itself must be an array (check using the array checker).
		runChecker(this.checkers.array, value, prefix, error);

		// Prevent infinite loops.
		if (stack) {
			// Type can't have circular references.
			if (stack.indexOf(type) >= 0)
				throwError(BlorkError, "Blork array type must not contain circular references", type);

			// Value can have circular references, but don't keep checking it over and over.
			if (stack.indexOf(value) >= 0) return;

			// Push type and value into the stack.
			stack.push(type);
			stack.push(value);
		} else {
			// First loop. Start a stack.
			stack = [type, value];
		}

		// Tuple array or normal array.
		if (type.length === 1) {
			// Normal array
			// Loop through items and check they match type[0]
			for (let i = 0, l = value.length; i < l; i++)
				this.check(value[i], type[0], `${prefix}[${i}]`, error, stack);
		} else if (type.length > 1) {
			// Tuple array (more than
			// Loop through types and match each with a value recursively.
			for (let i = 0, l = type.length; i < l; i++) this.check(value[i], type[i], `${prefix}[${i}]`, error, stack);

			// No excess items in a tuple.
			if (value.length > type.length) throwError(error, `Must have ${type.length} items`, value.length, prefix);
		} else {
			// Must have at least one item.
			throwError(BlorkError, `Blork array type must have one or more items`, value.length, prefix);
		}
	}

	/**
	 * Internal check for object types, e.g. { bool: Boolean }
	 *
	 * @param {mixed} value A single value (or object/array with values) to check against the type(s).
	 * @param {Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} prefix Prefix for error messages to assist debugging.
	 * @param {Error} error The error that's thrown if the check doesn't pass.
	 * @param {Array} stack Protect against infinite loops.
	 * @return {void}
	 *
	 * @internal
	 */
	checkObject(value, type, prefix, error, stack) {
		// CLASS type key.
		const objectType = type[CLASS];
		if (objectType) {
			// Must be plain checker.
			this.check(value, objectType, prefix, error, stack);
		} else {
			// Must be plain checker.
			runChecker(this.checkers.object, value, prefix, error);
		}

		// Prevent infinite loops.
		if (stack) {
			// Type can't have circular references.
			if (stack.indexOf(type) >= 0)
				throwError(BlorkError, "Blork object type must not contain circular references", type);

			// Value can have circular references, but don't keep checking it over and over.
			if (stack.indexOf(value) >= 0) return;

			// Push type and value into the stack.
			stack.push(type);
			stack.push(value);
		} else {
			// First loop. Kick off a stack.
			stack = [type, value];
		}

		// Loop through each key in the types object (must match exactly).
		const typeKeys = Object.keys(type);
		for (let i = 0, l = typeKeys.length; i < l; i++) {
			// Vars.
			const key = typeKeys[i];

			// Check that the value matches the specified key.
			this.check(value[key], type[key], `${prefix}.${key}`, error, stack);
		}

		// Get the KEYS and VALUES types.
		// KEYS is used to check all keys against a checker, e.g. checking that keys are camelCase.
		// VALUES is used to check that excess values on the object match a specified type.
		const keysType = type[KEYS];
		const valuesType = type[VALUES];

		// Is there an KEYS or VALUES type?
		if (keysType || valuesType) {
			// Vars.
			const valueKeys = Object.keys(value);

			// Check that we ACTUALLY need to do this loop by comparing the lengths.
			if (valueKeys.length > typeKeys.length) {
				// Loop through excess keys (that are in valueKeys but not in typeKeys).
				for (let i = 0, l = valueKeys.length; i < l; i++) {
					// Vars.
					const key = valueKeys[i];

					// Ignore ones in type.
					if (!type.hasOwnProperty(key)) {
						// If there's a KEYS type, check the key against that.
						if (keysType) this.check(key, keysType, `${prefix}.${key}: Key`, error, stack);

						// Check the value against the VALUES type.
						if (valuesType) this.check(value[key], valuesType, `${prefix}.${key}`, error, stack);
					}
				}
			}
		}
	}
}

// Exports.
module.exports = Blorker;
