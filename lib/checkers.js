"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkers = {
    'null': (v) => v === null || 'Must be null',
    'undefined': (v) => v === undefined || 'Must be undefined',
    'defined': (v) => v !== undefined || 'Must be defined',
    'boolean': (v) => (v === true || v === false) || 'Must be true or false',
    'true': (v) => v === true || 'Must be true',
    'false': (v) => v === false || 'Must be false',
    'truthy': (v) => !!v || 'Must be truthy',
    'falsy': (v) => !v || 'Must be falsy',
    'number': (v) => typeof v === 'number' || 'Must be number',
    'integer': (v) => Number.isInteger(v) && v >= Number.MIN_SAFE_INTEGER && v <= Number.MAX_SAFE_INTEGER || 'Must be an integer',
    'natural': (v) => Number.isInteger(v) && v > 0 && v <= Number.MAX_SAFE_INTEGER || 'Must be a natural number, e.g. 1, 2, 3',
    'whole': (v) => Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER || 'Must be a whole number, e.g. 0, 1, 2, 3',
    'finite': (v) => Number.isFinite(v) || 'Must be a finite number',
    'string': (v) => typeof v === 'string' || 'Must be a string',
    'string+': (v) => typeof v === 'string' && v.length > 0 || 'Must be a non-empty string',
    'lowercase': (v) => typeof v === 'string' && v === v.toLowerCase() || 'Must be a lowercase string',
    'lowercase+': (v) => typeof v === 'string' && v.length > 0 && v === v.toLowerCase() || 'Must be a non-empty lowercase string',
    'uppercase': (v) => typeof v === 'string' && v === v.toUpperCase() || 'Must be an uppercase string',
    'uppercase+': (v) => typeof v === 'string' && v.length > 0 && v === v.toUpperCase() || 'Must be a non-empty uppercase string',
    'function': (v) => v instanceof Function || 'Must be an function',
    'object': (v) => v instanceof Object || 'Must be an object',
    'object+': (v) => v instanceof Object && Object.keys(v).length > 0 || 'Must be an object with one or more enumerable properties',
    'iterable': (v) => v instanceof Object && typeof v[Symbol.iterator] === 'function' || 'Must be an iterable object',
    'array': (v) => v instanceof Array || 'Must be an array',
    'array+': (v) => v instanceof Array && v.length > 0 || 'Must be a non-empty array',
    'map': (v) => v instanceof Map || 'Must be a map',
    'map+': (v) => v instanceof Map && v.size > 0 || 'Must be a non-empty map',
    'weakmap': (v) => v instanceof WeakMap || 'Must be a weak map',
    'set': (v) => v instanceof Set || 'Must be a set',
    'set+': (v) => v instanceof Set && v.size > 0 || 'Must be a non-empty set',
    'weakset': (v) => v instanceof WeakSet || 'Must be a weak set',
    'arguments': (v) => v instanceof Object && typeof v.length === 'number' || 'Must be an arguments object',
    'promise': (v) => v instanceof Promise || 'Must be a promise',
    'date': (v) => v instanceof Date || 'Must be a date',
    'future': (v) => v instanceof Date && v.getTime() > Date.now() || 'Must be a date in the future',
    'past': (v) => v instanceof Date && v.getTime() < Date.now() || 'Must be a date in the past',
};
exports.checkers['void'] = exports.checkers['undefined'];
exports.checkers['undef'] = exports.checkers['undefined'];
exports.checkers['def'] = exports.checkers['defined'];
exports.checkers['bool'] = exports.checkers['boolean'];
exports.checkers['num'] = exports.checkers['number'];
exports.checkers['int'] = exports.checkers['integer'];
exports.checkers['str'] = exports.checkers['string'];
exports.checkers['str+'] = exports.checkers['string+'];
exports.checkers['lower'] = exports.checkers['lowercase'];
exports.checkers['lower+'] = exports.checkers['lowercase+'];
exports.checkers['upper'] = exports.checkers['uppercase'];
exports.checkers['upper+'] = exports.checkers['uppercase+'];
exports.checkers['func'] = exports.checkers['function'];
exports.checkers['obj'] = exports.checkers['object'];
exports.checkers['obj+'] = exports.checkers['object+'];
exports.checkers['arr'] = exports.checkers['array'];
exports.checkers['arr+'] = exports.checkers['array+'];
exports.checkers['args'] = exports.checkers['arguments'];
//# sourceMappingURL=checkers.js.map