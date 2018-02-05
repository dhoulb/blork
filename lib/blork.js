const internalCheck = require("./check");
const checkers = require("./checkers");
const format = require("./format");
const BlorkError = require("./BlorkError");

/**
 * Create a new instance of Blork.
 *
 * Allows new instances of args() and check() to exist.
 * Separate instances have their own independent throws() error class and list of additional checkers.
 *
 * @returns {object} An object that can be destructured into { check, args, add, throws } functions.
 */
module.exports = function blork() {
	// Vars.
	let errorConstructor = TypeError;

	/**
	 * Check values against types.
	 * Throws an error if a value doesn't match a specified type.
	 *
	 * @param {mixed} value A single value (or object/array with multiple values) to check against the type(s).
	 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} prefix='' Prefix for error messages, to assist debugging.
	 *
	 * @return {integer} Returns the number of values that passed their checks.
	 * @throws An error describing what went wrong (usually an error object).
	 */
	function check(value, type, prefix = "") {
		// Check args.
		if (typeof prefix !== "string") internalCheck(prefix, "str", "arguments[2]", BlorkError);

		// Check the value against the type.
		return internalCheck(value, type, prefix, errorConstructor);
	}

	/**
	 * Check function arguments against types.
	 * Same as check() but slightly friendlier and easier to use.
	 *
	 * @param {object} argsobj The entire arguments object from the function call. Must have a .length property.
	 * @param {array} types A set of types corresponding to the argument.
	 *
	 * @return {integer} Returns the number of values that passed their checks.
	 * @throws An error describing what went wrong (usually an error object).
	 */
	function args(argsobj, types) {
		// Check args.
		// Checked manually first for minor speed improvement.
		if (checkers.args(argsobj) !== true) internalCheck(argsobj, "args", "arguments[0]", BlorkError);
		if (!(types instanceof Array)) internalCheck(types, "array", "arguments[1]", BlorkError);

		// Vars.
		const l = types.length;
		let pass = 0;

		// Recurse into each type.
		for (let i = 0; i < l; i++)
			if (internalCheck(argsobj[i], types[i], `arguments[${i}]`, errorConstructor)) pass++;

		// No excess arguments.
		if (argsobj.length > l) {
			throw new errorConstructor(format(`Too many arguments (expected ${l})`, argsobj.length, "arguments"));
		}

		// Success.
		return pass;
	}

	/**
	 * Add a new custom checker.
	 *
	 * Checker function should take in a value, check it and return either `true` (success) or a string error (e.g. `Must be a whole number`).
	 * This format is chosen because it allows buttery constructions like `check.add(const str = v => (typeof v === 'string' || 'must be string');
	 *
	 * @param {string} name The type reference for the checker.
	 * @param {function} checker A checker function: Takes a single argument (value), tests it, and returns either true (success) or an error message string in the 'Must be X' format.
	 * @return {void}
	 */
	function add(name, checker) {
		// Check args.
		internalCheck(name, "lower+", "arguments[0]", BlorkError);
		internalCheck(checker, "function", "arguments[1]", BlorkError);

		// Don't double up.
		if (checkers[name]) throw new BlorkError(`Blork type '${name}' already exists`);

		// Save the checker.
		checkers[name] = checker;
	}

	/**
	 * Set the error any failed checks should throw.
	 * @param {Error} err The error constructor to use for
	 * @return {void}
	 */
	function throws(err) {
		// Check args.
		internalCheck(err, "function", "arguments[0]", BlorkError);

		// Save errorConstructor.
		errorConstructor = err;
	}

	// Returns.
	return { check, args, add, throws };
};
