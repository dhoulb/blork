/**
 * Blork! Built-in checkers
 * List of built-in checkers indexed by string type name. Some checkers have duplicate names.
 *
 * @author Dave Houlbrooke <dave@shax.com
 */
import { CheckerFunction } from './types';

// Checker functions.
// tslint:disable:no-any no-unsafe-any
export const checkers: { [key: string]: CheckerFunction } = {
	'null': (v: any) => v === null || 'Must be null',
	'undefined': (v: any) => v === undefined || 'Must be undefined',
	'defined': (v: any) => v !== undefined || 'Must be defined',
	'boolean': (v: any) => v === true || v === false || 'Must be true or false',
	'true': (v: any) => v === true || 'Must be true',
	'false': (v: any) => v === false || 'Must be false',
	'truthy': (v: any) => !!v || 'Must be truthy',
	'falsy': (v: any) => !v || 'Must be falsy',
	'number': (v: any) => typeof v === 'number' || 'Must be a number',
	'integer': (v: any) => (typeof v === 'number' && Number.isInteger(v) && v >= Number.MIN_SAFE_INTEGER && v <= Number.MAX_SAFE_INTEGER) || 'Must be an integer',
	'natural': (v: any) => (typeof v === 'number' && Number.isInteger(v) && v > 0 && v <= Number.MAX_SAFE_INTEGER) || 'Must be a natural number, e.g. 1, 2, 3',
	'whole': (v: any) => (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER) || 'Must be a whole number, e.g. 0, 1, 2, 3',
	'finite': (v: any) => (typeof v === 'number' && Number.isFinite(v)) || 'Must be a finite number',
	'string': (v: any) => typeof v === 'string' || 'Must be a string',
	'string+': (v: any) => (typeof v === 'string' && v.length > 0) || 'Must be a non-empty string',
	'lowercase': (v: any) => (typeof v === 'string' && v === v.toLowerCase()) || 'Must be a lowercase string',
	'lowercase+': (v: any) => (typeof v === 'string' && v.length > 0 && v === v.toLowerCase()) || 'Must be a non-empty lowercase string',
	'uppercase': (v: any) => (typeof v === 'string' && v === v.toUpperCase()) || 'Must be an uppercase string',
	'uppercase+': (v: any) => (typeof v === 'string' && v.length > 0 && v === v.toUpperCase()) || 'Must be a non-empty uppercase string',
	'function': (v: any) => v instanceof Function || 'Must be a function',
	'object': (v: any) => (typeof v === 'object' && v !== null) || 'Must be an object',
	'object+': (v: any) => (typeof v === 'object' && v !== null && Object.keys(v).length > 0) || 'Must be an object with one or more enumerable properties',
	'iterable': (v: any) => (typeof v === 'object' && v !== null && typeof v[Symbol.iterator] === 'function') || 'Must be an iterable object', // tslint:disable-line:no-any
	'array': (v: any) => v instanceof Array || 'Must be an array',
	'array+': (v: any) => (v instanceof Array && v.length > 0) || 'Must be a non-empty array',
	'map': (v: any) => v instanceof Map || 'Must be a map',
	'map+': (v: any) => (v instanceof Map && v.size > 0) || 'Must be a map',
	'weakmap': (v: any) => v instanceof WeakMap || 'Must be a weak map',
	'set': (v: any) => v instanceof Set || 'Must be a set',
	'set+': (v: any) => (v instanceof Set && v.size > 0) || 'Must be a non-empty set',
	'weakset': (v: any) => v instanceof WeakSet || 'Must be a weak set',
	'arguments': (v: any) => (typeof v === 'object' && v !== null && v.hasOwnProperty('length') && typeof v.length === 'number') || 'Must be an arguments object',
	'promise': (v: any) => v instanceof Promise || 'Must be a promise',
	'date': (v: any) => v instanceof Date || 'Must be a date',
	'future': (v: any) => (v instanceof Date && v.getTime() > Date.now()) || 'Must be a date in the future',
	'past': (v: any) => (v instanceof Date && v.getTime() < Date.now()) || 'Must be a date in the past',
};
// tslint:enable:no-any no-unsafe-any

// Checker alternates.
checkers.void = checkers.undefined;
checkers.undef = checkers.undefined;
checkers.def = checkers.defined;
checkers.bool = checkers.boolean;
checkers.num = checkers.number;
checkers.int = checkers.integer;
checkers.str = checkers.string;
checkers['str+'] = checkers['string+'];
checkers.lower = checkers.lowercase;
checkers['lower+'] = checkers['lowercase+'];
checkers.upper = checkers.uppercase;
checkers['upper+'] = checkers['uppercase+'];
checkers.func = checkers.function;
checkers.obj = checkers.object;
checkers['obj+'] = checkers['object+'];
checkers.arr = checkers.array;
checkers['arr+'] = checkers['array+'];
checkers.args = checkers.arguments;
