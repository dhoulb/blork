/**
 * Blork!
 * Mini non-static type checking in Javascript.
 *
 * @author Dave Houlbrooke <dave@shax.com
 */
import { CheckerFunction, ArgumentsObject, TypesArray, TypesObject, ErrorConstructor } from './types';
import { checkers } from './checkers';
import { format } from './helpers';
import { BlorkError } from './errors';

// Vars.
let errorConstructor:ErrorConstructor = TypeError;

// Public functions.

	/**
	 * Check values against types.
	 * Throws an error if a value doesn't match a specified type.
	 *
	 * @param {mixed|object} value A single value (or object/array with values) to check against the type(s).
	 * @param {string|object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} prefix='' Prefix for error messages, to assist debugging.
	 *
	 * @return {integer} Returns the number of values that passed their checks.
	 * @throws {mixed} An error describing what went wrong (usually an error object).
	 */
	export function check(value:any, type:any, prefix:string = '')
	{
		// Check args.
		safe(prefix, 'string', 'arguments[2]', BlorkError);

		// Check the value against the type.
		return safe(value, type, prefix, errorConstructor);
	}

	/**
	 * Check function arguments against types.
	 * Same as check() but slightly friendlier
	 *
	 * @param {object} args The entire arguments object from the function call. Must have a .length property.
	 * @param {array} types A set of types corresponding to the argument.
	 *
	 * @return {integer} Returns the number of values that passed their checks.
	 * @throws {mixed} An error describing what went wrong (usually an error object).
	 */
	export function args(args:ArgumentsObject, types:TypesArray)
	{
		// Check args.
		safe(args, 'args', 'arguments[0]', BlorkError);
		safe(types, 'array', 'arguments[1]', BlorkError);

		// Vars.
		let pass = 0;
		const l = types.length;

		// Loop through types and recurse into each.
		for (let i = 0; i < l; i++) if (safe(args[i], types[i], 'arguments[' + i + ']', errorConstructor)) pass++;

		// No excess arguments.
		if (args.length > l) throw new errorConstructor(format('Must not have more than ' + l + ' arguments', args.length, 'arguments'));

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
	export function add(name:string, checker:CheckerFunction)
	{
		// Check args.
		safe(name, 'lower+', 'arguments[0]', BlorkError);
		safe(checker, 'function', 'arguments[1]', BlorkError);

		// Don't double up.
		if (checkers[name]) throw new BlorkError("Checker '" + name + " already exists");

		// Save the checker.
		checkers[name] = checker;
	}

	/**
	 * Set the error any failed checks should throw.
	 *
	 * @param {function} err The error constructor to use for
	 * @return {void}
	 */
	export function throws(err:ErrorConstructor)
	{
		// Check args.
		safe(err, 'function', 'arguments[0]', BlorkError);

		// Save errorConstructor.
		errorConstructor = err;
	}

// Internal.

	/**
	 * Internal check.
	 * Called safe because it's only used internally, so arguments aren't typechecked.
	 *
	 * @param {mixed|object} value A single value (or object/array with values) to check against the type(s).
	 * @param {string|object} type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
	 * @param {string} name Name of the value (prefixed to error messages to assist debugging).
	 * @param {function} errorConstructor Type of error that gets thrown if values don't match types.
	 *
	 * @return {integer} Returns the number of values that passed their checks.
	 * @throws {mixed} An error describing what went wrong (usually an error object).
	 *
	 * @internal
	 */
	function safe(value:any, type:string|Function|TypesArray|TypesObject, name:string, errorConstructor:ErrorConstructor)
	{
		// If it's a plain object or plain array, we're checking a set of values.
		if (typeof type === 'string')
		{
			// Find checker in list of checkers.
			let checker = checkers[type];
			if (!checker)
			{
				// Optional value (ends with '?')
				if (type.length && type[type.length - 1] === '?')
				{
					// Find checker without '?'.
					checker = checkers[type.slice(0, -1)];

					// Undefined.
					if (checker && value === undefined) return 0;
				}

				// Unknown checker.
				if (!checker) throw new BlorkError("Checker '" + type + "' does not exist");
			}

			// Check, and error if it fails.
			const result = checker(value);

			// Success if it returned true, Error if it returned string.
			if (result === true) return 1;
			else if (typeof result === 'string') throw new errorConstructor(format(result, value, name));
			else throw new BlorkError(format("Checker '" + type + "' did not return true or string", result));
		}
		else if (type instanceof Function)
		{
			// Vars.
			let result:string|true = true;

			// Switch for type.
			switch (type)
			{
				// Built-in types.
				case Boolean: result = checkers.bool(value); break;
				case Number:  result = checkers.num(value);  break;
				case String:  result = checkers.str(value);  break;
				case Object:  result = checkers.obj(value);  break;

				// Other types do an instanceof check.
				default: if (!(value instanceof type)) result = 'Must be instance of ' + (type.name || 'specified object');
			}

			// Success if it returned true, Error if it returned string.
			if (typeof result === 'string') throw new errorConstructor(format(result, value, name));
			else return 1; // We trust our builtin checkers not to return anything else, so assume success.
		}
		else if (type instanceof Array)
		{
			// Value must be an array.
			safe(value, 'array', name, errorConstructor);

			// Vars.
			if (!name.length) name = 'Array';
			let pass = 0;

			// Tuple array or normal array.
			if (type.length === 1)
			{
				// Normal array: Loop through items and check they match type[0]
				const l = value.length;
				for (let i = 0; i < l; i++) if (safe(value[i], type[0], name + '[' + i + ']', errorConstructor)) pass++;
			}
			else
			{
				// Tuple array: Loop through types and match each with a value recursively.
				const l = type.length;
				for (let i = 0; i < l; i++) if (safe(value[i], type[i], name + '[' + i + ']', errorConstructor)) pass++;

				// No excess items in a tuple.
				if (value.length > l) throw new errorConstructor(format('Must not have more than ' + l + ' array items', value.length, name));
			}

			// Success!
			return pass;
		}
		else if (type instanceof Object)
		{
			// Value must be an object.
			safe(value, 'object', name, errorConstructor);

			// Vars.
			let pass = 0;

			// Loop through types and recurse into each.
			for (const key in type) if (safe(value[key], type[key], (name ? name + '[' + key + ']' : key), errorConstructor)) pass++;

			// Success!
			return pass;
		}
		else throw new BlorkError(format('Checker type must be a string, function, array, or object', type));
	}