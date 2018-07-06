const ValueError = require("../errors/ValueError");
const BlorkError = require("../errors/BlorkError");
const format = require("../functions/format");
const modifiers = require("../modifiers");
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
		throwError(checker.error || error, `Must be ${checker.desc}`, value, prefix);
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
	 */
	constructor(checkers) {
		// Default error message to use.
		this._error = ValueError;

		// Clone the input of checkers to this._checkers.
		this._checkers = Object.assign({}, checkers);

		// Bind find (we use this a few times without this context).
		this._find = this._find.bind(this);
	}

	/**
	 * Return a specific checker.
	 *
	 * @param {string|Function|Array|Object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @return {function} The specified checker or undefined if it doesn't exist.
	 */
	checker(type) {
		// Check args.
		runChecker(this._checkers.string, type, "checker(): type", BlorkError);

		// Return the checker.
		const checker = this._checkers[type] || this._lazyCreateChecker(type) || false;
		if (checker) return checker;

		// Not found.
		throwError(BlorkError, "Checker not found", type, "checker(): type");
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
	assert(assertion, description, prefix, error) {
		// Check args.
		runChecker(this._checkers.string, description, "check(): description", BlorkError);
		if (prefix) runChecker(this._checkers.string, prefix, "check(): prefix", BlorkError);
		if (error) runChecker(this._checkers.function, error, "check(): error", BlorkError);

		// Enforce assertion.
		if (!assertion) throwError(error || this._error, `Must ${description}`, EMPTY, prefix || "");
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
	check(value, type, prefix, error) {
		// Check args.
		if (prefix) runChecker(this._checkers.string, prefix, "check(): prefix", BlorkError);
		if (error) runChecker(this._checkers.function, error, "check(): error", BlorkError);

		// Check the value against the type.
		this._check(value, type, prefix || "", error || this._error);
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
	args(args, types, prefix, error) {
		// Check args.
		runChecker(this._checkers.args, args, "args(): args", BlorkError);
		runChecker(this._checkers.array, types, "args(): types", BlorkError);
		if (prefix) runChecker(this._checkers.string, prefix, "add(): prefix", BlorkError);
		if (error) runChecker(this._checkers.function, error, "add(): error", BlorkError);

		// Recurse into each type.
		types.forEach((t, i) => this._check(args[i], t, `${prefix || "arguments"}[${i}]`, error || this._error));

		// No excess arguments.
		if (args.length > types.length)
			throwError(error || this._error, `Must have ${types.length} arguments`, args.length, prefix || "arguments");
	}

	/**
	 * Add a new custom checker.
	 *
	 * Checker function should take in a value, check it and return `true` (success) or `false` (fail).
	 * This format is chosen because it allows buttery constructions like `check.add(const str = v => (typeof v === 'string' || 'must be string');
	 *
	 * @param {string} name The type reference for the checker in kebab-case format.
	 * @param {function} checker A checker function: Takes a single argument (value), tests it, and returns either true (success) or an error message string in the 'Must be X' format.
	 * @param {string} description A description of the type of value that's valid. Must fit the phrase `Must be ${description}`, e.g. "positive number" or "unique string". Defaults to name.
	 * @param {Error} error=undefined A custom error that applies only to this custom checker.
	 * @return {void}
	 */
	add(name, checker, description, error) {
		// Check args.
		runChecker(this._checkers.kebab, name, "add(): name", BlorkError);
		runChecker(this._checkers.function, checker, "add(): checker", BlorkError);
		if (description) runChecker(this._checkers.string, description, "add(): description", BlorkError);
		if (error) runChecker(this._checkers.function, error, "add(): error", BlorkError);

		// Don't double up.
		if (this._checkers[name]) throwError(BlorkError, "Blork type already exists", name, "add(): name");

		// Save the checker and save desc to it.
		this._checkers[name] = checker;
		checker.desc = description || name;
		if (error) checker.error = error;
	}

	/**
	 * Set the error any failed checks should throw.
	 * @param {Error} error The error constructor to use, e.g. `TypeError` or `MyCustomError`
	 * @return {void}
	 */
	throws(error) {
		// Check args.
		runChecker(this._checkers.function, error, "throws(): error", BlorkError);

		// Save err.
		this._error = error;
	}

	/**
	 * Define object properties that are locked to their specific Blork types.
	 *
	 * The properties are readable, but only writable with values matching the initial type.
	 * This allows you to define objects with properties of guaranteed types.
	 *
	 * @param {object} object The object to define the property on.
	 * @param {object} props The new locked-down props to define on the property.
	 * @returns {void}
	 */
	props(object, props) {
		// Check args.
		runChecker(this._checkers.objectlike, object, "props(): object", BlorkError);
		runChecker(this._checkers.object, props, "props(): props", BlorkError);

		// Loop through every property in props.
		Object.entries(props).forEach(([key, value]) => {
			// Figure out the type from the value.
			const type =
				value instanceof Object
					? // Object types do an 'instanceof' check, so must be an instance of the same object.
						Object.getPrototypeOf(value).constructor
					: // All other values use typeof value, e.g. "string", "number", "boolean", "symbol".
						typeof value;

			// Define the property.
			Object.defineProperty(object, key, {
				configurable: false,
				enumerable: true,

				// Return the current value.
				get: () => value,

				// Arrow function so that this refers to the _outer_ this.
				set: v => {
					// Figure out prefix.
					// Either ".myProp" or "MyRandomClass.myProp"
					const constructor = Object.getPrototypeOf(object).constructor.name;
					const prefix = `${constructor.name}.${key}`;

					// Check the value.
					this._check(v, type, prefix, this._error);

					// Update the value.
					value = v;
				}
			});
		});

		// Return object (for chaining etc).
		return object;
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
		else throwError(BlorkError, "Blork type does not exist", type);
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
	 * @returns {function|undefined} The checker that was lazily created, or undefined if a checker could not be created.
	 */
	_lazyCreateChecker(type) {
		// Loop through modifiers.
		for (const i in modifiers) {
			// Test the type against the modifier's regex.
			const matches = type.match(modifiers[i].regex);

			// Did the regex match?
			if (matches) {
				// Yes! Call the modifier's callback to (lazily) create the type.
				this._checkers[type] = modifiers[i].callback(matches, this._find);
				return this._checkers[type]; // And return it.
			}
		}
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
	_check(value, type, prefix, error, stack) {
		// Found.
		if (typeof type === "string") runChecker(this._find(type), value, prefix, error);
		else if (type === true) runChecker(this._checkers.true, value, prefix, error);
		else if (type === false) runChecker(this._checkers.false, value, prefix, error);
		else if (type === null) runChecker(this._checkers.null, value, prefix, error);
		else if (type === undefined) runChecker(this._checkers.undefined, value, prefix, error);
		else if (type === Boolean) runChecker(this._checkers.boolean, value, prefix, error);
		else if (type === Number) runChecker(this._checkers.number, value, prefix, error);
		else if (type === String) runChecker(this._checkers.string, value, prefix, error);
		else if (type instanceof Function) {
			// Functions do an instanceof check.
			if (!(value instanceof type))
				throwError(this._error, `Must be instance of ${type.name || "anonymous class"}`, value, prefix);
		} else if (type instanceof Array) {
			// Pass to checkArray.
			this._checkArray(value, type, prefix, error, stack);
		} else if (type instanceof Object) {
			// Pass to checkObject.
			this._checkObject(value, type, prefix, error, stack);
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
	_checkArray(value, type, prefix, error, stack) {
		// Value itself must be an array (check using the array checker).
		runChecker(this._checkers.array, value, prefix, error);

		// Prevent infinite loops.
		if (stack) {
			// Type can't have circular references.
			if (stack.indexOf(type) >= 0)
				throwError(BlorkError, "Blork type must not contain circular references", type);

			// Value can have circular references, but don't keep checking it over and over.
			if (stack.indexOf(value) >= 0) return;

			// Push type and value into the stack.
			stack = [...stack, type, value];
		} else {
			// First loop. Start a stack.
			stack = [type, value];
		}

		// Tuple array or normal array.
		if (type.length === 1) {
			// Normal array
			// Loop through items and check they match type[0]
			value.forEach((v, i) => this._check(v, type[0], `${prefix}[${i}]`, error, stack));
		} else {
			// Tuple array
			// Loop through types and match each with a value recursively.
			type.forEach((t, i) => this._check(value[i], t, `${prefix}[${i}]`, error, stack));

			// No excess items in a tuple.
			if (value.length > type.length) throwError(error, `Must have ${type.length} items`, value.length, prefix);
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
	_checkObject(value, type, prefix, error, stack) {
		// CLASS type key.
		const objectType = type[CLASS];
		if (objectType) {
			// Must be plain checker.
			this._check(value, objectType, prefix, error, stack);
		} else {
			// Must be plain checker.
			runChecker(this._checkers.object, value, prefix, error);
		}

		// Prevent infinite loops.
		if (stack) {
			// Type can't have circular references.
			if (stack.indexOf(type) >= 0)
				throwError(BlorkError, "Blork type must not contain circular references", type);

			// Value can have circular references, but don't keep checking it over and over.
			if (stack.indexOf(value) >= 0) return;

			// Push type and value into the stack.
			stack = [...stack, type, value];
		} else {
			// First loop. Kick off a stack.
			stack = [type, value];
		}

		// Vars.
		const typeKeys = Object.keys(type);

		// Loop through each item in the types object.
		typeKeys.forEach(key => {
			// Check that the value matches the specified key.
			this._check(value[key], type[key], `${prefix}.${key}`, error, stack);
		});

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
				valueKeys.filter(v => !~typeKeys.indexOf(v)).forEach(key => {
					// If there's a KEYS type, check the key against that.
					if (keysType) this._check(key, keysType, `${prefix}.${key}: Key`, error, stack);

					// Check the value against the VALUES type.
					if (valuesType) this._check(value[key], valuesType, `${prefix}.${key}`, error, stack);
				});
			}
		}
	}
}

// Exports.
module.exports = Blorker;
