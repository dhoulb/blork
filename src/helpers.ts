import { CheckerFunction } from './types';

/**
 * Neatly convert any value into a string for debugging.
 *
 * @param {mixed} value The value to convert to a string.
 * @return {string} The value after it has been converted to a string.
 */
export function debug(value: any)
{
	switch (value)
	{
		case null: return 'null';
		case undefined: return 'undefined';
		case true: return 'true';
		case false: return 'false';
		default: switch (typeof value)
		{
			case 'string': return JSON.stringify(value.length > 20 ? value.substr(0, 20) + '…' : value); // e.g. "You can \"quote me\" on that"
			case 'number': return value.toString(); // e.g. 123 or 456.789
			case 'function': return value.name ? 'function ' + value.name + '()' : 'anonymous function';
			case 'object': switch (value.constructor)
			{
				case Object: const l = Object.entries(value).length; l ? 'object {} with ' + l + ' props' : 'empty object';
				case Array: return value.length ? 'Array with ' + value.length + ' items' : 'empty array';
				case Map: case Set: return value.size ? 'empty ' + value.constructor.name : value.constructor.name + ' with ' + value.size + ' items';
				default: return value.constructor.name ? 'instance of ' + value.constructor.name : 'instance of anonymous class';
			}
		}
	}
}

// Format an error message.
// Optionally with a prefix and a variable to debug.
export function format(message:string, value:any, prefix?:string):string
{
	// Something like 'prefix must be string (received 123)
	return (prefix ? prefix + ': ' : '') + message + (typeof value !== undefined ? ' (received ' + debug(value) + ')' : '');
}