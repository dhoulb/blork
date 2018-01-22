/**
 * Blork! Helper functions
 * @author Dave Houlbrooke <dave@shax.com
 */

// Vars.
const UNDEF = Symbol();

/**
 * Neatly convert any value into a string for debugging.
 * @param value The value to debug.
 * @return String representing the debugged value.
 * @internal
 */
export function debug(value: any) { // tslint:disable-line:no-any

	if (value === null) return 'null';
	else if (value === undefined) return 'undefined';
	else if (value === true) return 'true';
	else if (value === false) return 'false';
	else if (typeof value === 'number') return value.toString(); // E.g. 123 or 456.789
	else if (typeof value === 'symbol') return value.toString(); // E.g. Symbol(foo)
	else if (typeof value === 'string') return JSON.stringify(value);
	else return debugObject(value as object);

}

/**
 * Debug an object.
 * @param value The value to debug.
 * @return String representing the debugged value.
 * @internal
 */
function debugObject(value: object): string {

	// Function, e.g. myFunc()
	if (value instanceof Function) {

		// Named function.
		if (value.name.length > 0) return `${value.name}()`; // tslint:disable-line:no-unsafe-any

		// Unnamed function.
		return 'anonymous function';

	}

	// tslint:disable:no-unsafe-any
	if (value.constructor instanceof Function && value.constructor.name.length > 0) {

		// Error, e.g. TypeError "Must be a string"
		if (value instanceof Error) return `${value.constructor.name} ${debug(value.message)}`;

		// Date, e.g. 2011-10-05T14:48:00.000Z
		if (value instanceof Date) return value.toISOString();

		// Regular expression, e.g. /abc/
		if (value.constructor === RegExp) return value.toString();

		// Array, e.g. Array: [1,3,4]
		if (value.constructor === Array) return JSON.stringify(value, undefined, '\t');

		// Object, e.g. Object: {"a":123}
		if (value.constructor === Object) return JSON.stringify(value, undefined, '\t');

		// Other object with named constructor.
		return `instance of ${value.constructor.name}`;

	}
	// tslint:enable:no-unsafe-any

	// Other unnamed object.
	return 'instance of anonymous class';
}

/**
 * Format an error message.
 * Optionally with a prefix and a variable to debug.
 *
 * @param message Message describing what went wrong, e.g. "Must be a string"
 * @param value A value to debug shown at the end of the message, e.g. "Must be string (received 123)"
 * @param prefix=undefined An optional prefix for the message e.g. the function name or the name of the value, e.g. "name: Must be string (received 123)"
 * @returns The error message.
 */
export function format(message: string, value: any = UNDEF, prefix?: string) { // tslint:disable-line:no-any

	// Debug the value.
	const debugged = debug(value);

	// E.g. MyPrefix: Must be string (received 123)
	return (typeof prefix === 'string' && prefix.length > 0 ? `${prefix}: ` : '') + message + (value !== UNDEF ? ` (received ${debugged})` : '');

}
