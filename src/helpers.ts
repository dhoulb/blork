/**
 * Blork! Helper functions
 * @author Dave Houlbrooke <dave@shax.com
 */

// Vars.
const UNDEF = Symbol();

/**
 * Neatly convert any value into a string for debugging.
 *
 * @param value The value to convert to a string.
 * @return The value after it has been converted to a string.
 */
export function debug(value: any) { // tslint:disable-line:no-any

	if (value === null) return 'null';
	if (value === undefined) return 'undefined';
	if (value === true) return 'true';
	if (value === false) return 'false';
	if (typeof value === 'string') {
		const max = 20;
		return JSON.stringify(value.length > max ? `${value.substr(0, max)}…` : value);
	}
	if (typeof value === 'number') return value.toString(); // E.g. 123 or 456.789
	if (typeof value === 'symbol') return value.toString(); // E.g. Symbol(foo)
	if (value instanceof Function) {
		// tslint:disable:no-unsafe-any
		if (value.name.length > 0) return `function ${value.name}()`;
		// tslint:enable:no-unsafe-any
		return 'anonymous function';
	}
	if (value instanceof Array) return value.length > 0 ? `${value.constructor.name} with ${value.length} items` : `empty ${value.constructor.name}`;
	if (value instanceof Object) {
		// tslint:disable:no-unsafe-any
		if (value.constructor instanceof Function && value.constructor.name.length > 0) {
			if (value.constructor === Object) {
				const l = Object.keys(value).length;
				return l > 0 ? `Object with ${l} props` : 'empty Object';
			}
			return `instance of ${value.constructor.name}`;
		}
		// tslint:enable:no-unsafe-any
		return 'instance of anonymous class';
	}
	return 'unknown value';

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
