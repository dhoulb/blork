/**
 * Blork! Internal check functions
 * Internal functions that actually do checking against types.
 *
 * @author Dave Houlbrooke <dave@shax.com
 */
import { CheckerReturns, Types, TypesArray, TypesObject, ErrorConstructor } from './types';
import { BlorkError } from './errors';
import { format } from './helpers';
import { checkers } from './checkers';

/**
 * Internal check.
 *
 * @param value A single value (or object/array with values) to check against the type(s).
 * @param type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param name Name of the value (prefixed to error messages to assist debugging).
 * @param errorConstructor Type of error that gets thrown if values don't match types.
 *
 * @return Returns the number of values that passed their checks.
 * @throws An error describing what went wrong (usually an error object).
 *
 * @internal
 */
export function internalCheck(value: any, type: Types, name: string, err: ErrorConstructor) { // tslint:disable-line:no-any

	// Found.
	if (typeof type === 'string') return internalCheckString(value, type, name, err);
	if (type instanceof Function) return internalCheckFunction(value, type, name, err);
	if (type instanceof Array) return internalCheckArray(value, type, name, err);
	if (type instanceof Object) return internalCheckObject(value, type, name, err);

	// Not found.
	throw new BlorkError(format('Blork type must be a string, function, array, or object', type));

}

/**
 * Internal check for string types, e.g. 'bool'
 *
 * @param value A single value (or object/array with values) to check against the type(s).
 * @param type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param name Name of the value (prefixed to error messages to assist debugging).
 * @param errorConstructor Type of error that gets thrown if values don't match types.
 *
 * @return Returns the number of values that passed their checks.
 * @throws An error describing what went wrong (usually an error object).
 *
 * @internal
 */
export function internalCheckString(value: any, type: string, name: string, err: ErrorConstructor) { // tslint:disable-line:no-any

	// Find checker in list of checkers.
	let checker = checkers[type];

	// Checker didn't exist.
	if (!checker) {

		// Optional value (ends with '?')
		if (type.length > 0 && type[type.length - 1] === '?') {

			// Find checker without '?'.
			checker = checkers[type.slice(0, -1)];

			// Undefined.
			if (checker && value === undefined) return 0;

		}

		// Unknown checker.
		if (!checker) throw new BlorkError(`Blork type '${type}' does not exist`);

	}

	// Check, and error if it fails.
	const result = checker(value);

	// Error if it returned string.
	if (typeof result === 'string') throw new err(format(result, value, name));
	// Success if it returned anything else.
	return 1;

}

/**
 * Internal check for function types, e.g. Boolean
 *
 * @param value A single value (or object/array with values) to check against the type(s).
 * @param type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param name Name of the value (prefixed to error messages to assist debugging).
 * @param errorConstructor Type of error that gets thrown if values don't match types.
 *
 * @return Returns the number of values that passed their checks.
 * @throws An error describing what went wrong (usually an error object).
 *
 * @internal
 */
export function internalCheckFunction(value: any, type: (() => void), name: string, err: ErrorConstructor) { // tslint:disable-line:no-any

	// Vars.
	let result: CheckerReturns = true;

	// Switch for type.
	switch (type) {

		// Built-in types.
		case Boolean: result = checkers.bool(value); break;
		case Number: result = checkers.num(value); break;
		case String: result = checkers.str(value); break;
		case Object: result = checkers.obj(value); break;

		// Other types do an instanceof check.
		default: if (!(value instanceof type)) result = `Must be instance of ${(type.name || 'specified object')}`;

	}

	// Success if it returned true,
	if (result === true) return 1;

	// Error if it returned string.
	throw new err(format(result, value, name));

}

/**
 * Internal check for array types, e.g. [Boolean]
 *
 * @param value A single value (or object/array with values) to check against the type(s).
 * @param type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param name Name of the value (prefixed to error messages to assist debugging).
 * @param errorConstructor Type of error that gets thrown if values don't match types.
 *
 * @return Returns the number of values that passed their checks.
 * @throws An error describing what went wrong (usually an error object).
 *
 * @internal
 */
export function internalCheckArray(value: any, type: TypesArray, name: string, err: ErrorConstructor) { // tslint:disable-line:no-any

	// Value must be an array.
	if (value instanceof Array) {

		// Vars.
		const prefix = name.length ? name : 'Array';
		let pass = 0;

		// Tuple array or normal array.
		if (type.length === 1) {

			// Normal array: Loop through items and check they match type[0]
			const l = value.length;
			for (let i = 0; i < l; i++) if (internalCheck(value[i], type[0], `${prefix}[${i}]`, err)) pass++;

		} else {

			// Tuple array: Loop through types and match each with a value recursively.
			const l = type.length;
			for (let i = 0; i < l; i++) if (internalCheck(value[i], type[i], `${prefix}[${i}]`, err)) pass++;

			// No excess items in a tuple.
			if (value.length > l) throw new err(format(`Too many array items (expected ${l})`, value.length, prefix));

		}

		// Success!
		return pass;

	} else throw new err(format('Must be an array', value, name));

}

/**
 * Internal check for object types, e.g. { bool: Boolean }
 *
 * @param value A single value (or object/array with values) to check against the type(s).
 * @param type A single stringy type reference (e.g. 'str'), functional shorthand type reference (e.g. `String`), or an object/array with list of types (e.g. `{name:'str'}` or `['str', 'num']`).
 * @param name Name of the value (prefixed to error messages to assist debugging).
 * @param errorConstructor Type of error that gets thrown if values don't match types.
 *
 * @return Returns the number of values that passed their checks.
 * @throws An error describing what went wrong (usually an error object).
 *
 * @internal
 */
export function internalCheckObject(value: any, type: TypesObject, name: string, err: ErrorConstructor) { // tslint:disable-line:no-any

	// Value must be an object.
	if (typeof value !== 'object' || value === null) throw new err(format('Must be an object', value, name));

	// Vars.
	let pass = 0;

	// Recurse into each type.
	// tslint:disable:no-unsafe-any
	for (const key in type) if (internalCheck(value[key], type[key], name ? `${name}[${key}]` : key, err)) pass++;
	// tslint:enable:no-unsafe-any

	// Success!
	return pass;

}
