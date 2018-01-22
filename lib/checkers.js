"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkers = {
    'null': (v) => v === null || 'Must be null',
    'undefined': (v) => v === undefined || 'Must be undefined',
    'defined': (v) => v !== undefined || 'Must be defined',
    'boolean': (v) => v === true || v === false || 'Must be true or false',
    'true': (v) => v === true || 'Must be true',
    'false': (v) => v === false || 'Must be false',
    'truthy': (v) => !!v || 'Must be truthy',
    'falsy': (v) => !v || 'Must be falsy',
    'number': (v) => typeof v === 'number' && Number.isFinite(v) || 'Must be a finite number',
    'number+': (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0) || 'Must be a positive finite number',
    'number-': (v) => (typeof v === 'number' && Number.isFinite(v) && v <= 0) || 'Must be a negative finite number',
    'integer': (v) => (typeof v === 'number' && Number.isInteger(v) && v >= Number.MIN_SAFE_INTEGER && v <= Number.MAX_SAFE_INTEGER) || 'Must be an integer',
    'integer+': (v) => (typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER) || 'Must be a positive integer',
    'integer-': (v) => (typeof v === 'number' && Number.isInteger(v) && v >= Number.MIN_SAFE_INTEGER && v <= 0) || 'Must be a negative integer',
    'string': (v) => typeof v === 'string' || 'Must be a string',
    'string+': (v) => (typeof v === 'string' && v.length > 0) || 'Must be a non-empty string',
    'lowercase': (v) => (typeof v === 'string' && v === v.toLowerCase()) || 'Must be a lowercase string',
    'lowercase+': (v) => (typeof v === 'string' && v.length > 0 && v === v.toLowerCase()) || 'Must be a non-empty lowercase string',
    'uppercase': (v) => (typeof v === 'string' && v === v.toUpperCase()) || 'Must be an uppercase string',
    'uppercase+': (v) => (typeof v === 'string' && v.length > 0 && v === v.toUpperCase()) || 'Must be a non-empty uppercase string',
    'function': (v) => v instanceof Function || 'Must be a function',
    'object': (v) => (typeof v === 'object' && v !== null && v.constructor === Object) || 'Must be a plain object',
    'object+': (v) => (typeof v === 'object' && v !== null && v.constructor === Object && Object.keys(v).length > 0) || 'Must be a plain object with one or more enumerable properties',
    'objectlike': (v) => (typeof v === 'object' && v !== null) || 'Must be an object',
    'iterable': (v) => (typeof v === 'object' && v !== null && typeof v[Symbol.iterator] === 'function') || 'Must be an iterable object',
    'array': (v) => (v instanceof Array && v.constructor === Array) || 'Must be a plain array',
    'array+': (v) => (v instanceof Array && v.constructor === Array && v.length > 0) || 'Must be a plain non-empty array',
    'arraylike': (v) => (typeof v === 'object' && v !== null && v.hasOwnProperty('length') && typeof v.length === 'number' && v.length > 0 && v.length <= Number.MAX_SAFE_INTEGER) || 'Must be a plain array',
    'map': (v) => (v instanceof Map && v.constructor === Map) || 'Must be a map',
    'map+': (v) => (v instanceof Map && v.constructor === Map && v.size > 0) || 'Must be a map',
    'weakmap': (v) => (v instanceof WeakMap && v.constructor === WeakMap) || 'Must be a weak map',
    'set': (v) => (v instanceof Set && v.constructor === Set) || 'Must be a set',
    'set+': (v) => (v instanceof Set && v.constructor === Set && v.size > 0) || 'Must be a non-empty set',
    'weakset': (v) => (v instanceof WeakSet && v.constructor === WeakSet) || 'Must be a weak set',
    'promise': (v) => v instanceof Promise || 'Must be a promise',
    'date': (v) => v instanceof Date || 'Must be a date',
    'future': (v) => (v instanceof Date && v.getTime() > Date.now()) || 'Must be a date in the future',
    'past': (v) => (v instanceof Date && v.getTime() < Date.now()) || 'Must be a date in the past',
};
exports.checkers.void = exports.checkers.undefined;
exports.checkers.undef = exports.checkers.undefined;
exports.checkers.def = exports.checkers.defined;
exports.checkers.bool = exports.checkers.boolean;
exports.checkers.num = exports.checkers.number;
exports.checkers['num+'] = exports.checkers['number+'];
exports.checkers['num-'] = exports.checkers['number-'];
exports.checkers.int = exports.checkers.integer;
exports.checkers['int+'] = exports.checkers['integer+'];
exports.checkers['int-'] = exports.checkers['integer-'];
exports.checkers.str = exports.checkers.string;
exports.checkers['str+'] = exports.checkers['string+'];
exports.checkers.lower = exports.checkers.lowercase;
exports.checkers['lower+'] = exports.checkers['lowercase+'];
exports.checkers.upper = exports.checkers.uppercase;
exports.checkers['upper+'] = exports.checkers['uppercase+'];
exports.checkers.func = exports.checkers.function;
exports.checkers.obj = exports.checkers.object;
exports.checkers['obj+'] = exports.checkers['object+'];
exports.checkers.arr = exports.checkers.array;
exports.checkers['arr+'] = exports.checkers['array+'];
exports.checkers.arguments = exports.checkers.arraylike;
exports.checkers.args = exports.checkers.arraylike;
//# sourceMappingURL=checkers.js.map