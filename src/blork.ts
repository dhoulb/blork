/**
 * Blork! Main file
 *
 * Exports functions for other modules to access.
 * Exported functions must validate their arguments (we don't know how they'll be used).
 *
 * @author Dave Houlbrooke <dave@shax.com
 */
import { CheckerFunction, ArgumentsObject, Types, TypesArray, ErrorConstructor } from './types';
import { internalCheck, internalCheckString } from './internal';
import { checkers } from './checkers';
import { format } from './helpers';
import { BlorkError } from './errors';

// Vars.
let errorConstructor: ErrorConstructor = TypeError;

/**
 * Check values against types.
 * Throws an error if a value doesn't match a specified type.
 *
 * @param values A single value (or object/array with values) to check against the type(s).
 * @param type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param prefix='' Prefix for error messages, to assist debugging.
 *
 * @return Returns the number of values that passed their checks.
 * @throws An error describing what went wrong (usually an error object).
 */
export function check(value: any, type: Types, prefix = '') { // tslint:disable-line:no-any

	// Check args.
	internalCheck(prefix, 'string', 'arguments[2]', BlorkError);

	// Check the value against the type.
	return internalCheck(value, type, prefix, errorConstructor);

}

/**
 * Check function arguments against types.
 * Same as check() but slightly friendlier
 *
 * @param argsObj The entire arguments object from the function call. Must have a .length property.
 * @param types A set of types corresponding to the argument.
 *
 * @return Returns the number of values that passed their checks.
 * @throws An error describing what went wrong (usually an error object).
 */
export function args(argsObj: ArgumentsObject, types: TypesArray) {

	// Check args.
	internalCheckString(argsObj, 'args', 'arguments[0]', BlorkError);
	internalCheckString(types, 'array', 'arguments[1]', BlorkError);

	// Vars.
	const l = types.length;
	let pass = 0;

	// Recurse into each type.
	for (let i = 0; i < l; i++) if (internalCheck(argsObj[i], types[i], `arguments[${i}]`, errorConstructor)) pass++;

	// No excess arguments.
	if (argsObj.length > l) { throw new errorConstructor(format(`Too many arguments (expected ${l})`, argsObj.length, 'arguments')); }

	// Success.
	return pass;

}

/**
 * Add a new custom checker.
 *
 * Checker function should take in a value, check it and return either `true` (success) or a string error (e.g. `Must be a whole number`).
 * This format is chosen because it allows buttery constructions like `check.add(const str = v => (typeof v === 'string' || 'must be string');
 *
 * @param name The type reference for the checker.
 * @param checker A checker function: Takes a single argument (value), tests it, and returns either true (success) or an error message string in the 'Must be X' format.
 */
export function add(name: string, checker: CheckerFunction) {

	// Check args.
	internalCheckString(name, 'lower+', 'arguments[0]', BlorkError);
	internalCheckString(checker, 'function', 'arguments[1]', BlorkError);

	// Don't double up.
	if (checkers[name]) { throw new BlorkError(`Blork type '${name}' already exists`); }

	// Save the checker.
	checkers[name] = checker;

}

/**
 * Set the error any failed checks should throw.
 * @param err The error constructor to use for
 */
export function throws(err: ErrorConstructor) {

	// Check args.
	internalCheckString(err, 'function', 'arguments[0]', BlorkError);

	// Save errorConstructor.
	errorConstructor = err;

}
