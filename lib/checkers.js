/* eslint-disable prettier/prettier */
const isCircular = require("./checkers/isCircular");

// Checkers.
function isNull(v) { return v === null; }
function isUndefined(v) { return v === undefined; }
function isDefined(v) { return v !== undefined; }
function isBoolean(v) { return v === true || v === false; }
function isTrue(v) { return v === true; }
function isFalse(v) { return v === false; }
function isTruthy(v) { return !!v; }
function isFalsy(v) { return !v; }
function isNumber(v) { return typeof v === "number" && Number.isFinite(v); }
function isPositiveNumber(v) { return typeof v === "number" && Number.isFinite(v) && v >= 0; }
function isNegativeNumber(v) { return typeof v === "number" && Number.isFinite(v) && v <= 0; }
function isInteger(v) { return typeof v === "number" && Number.isInteger(v) && v >= Number.MIN_SAFE_INTEGER && v <= Number.MAX_SAFE_INTEGER; }
function isPositiveInteger(v) { return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER; }
function isNegativeInteger(v) { return typeof v === "number" && Number.isInteger(v) && v >= Number.MIN_SAFE_INTEGER && v <= 0; }
function isString(v) { return typeof v === "string"; }
function isNonEmptyString(v) { return typeof v === "string" && v.length > 0; }
function isLowerString(v) { return typeof v === "string" && v === v.toLowerCase(); }
function isNonEmptyLowerString(v) { return typeof v === "string" && v.length > 0 && v === v.toLowerCase(); }
function isUpperString(v) { return typeof v === "string" && v === v.toUpperCase(); }
function isNonEmptyUpperString(v) { return typeof v === "string" && v.length > 0 && v === v.toUpperCase(); }
function isFunction(v) { return typeof v === "function"; }
function isObject(v) { return typeof v === "object" && v !== null; }
function isPlainObject(v) { return v instanceof Object && v.constructor === Object; }
function isNonEmptyPlainObject(v) { return v instanceof Object && v.constructor === Object && Object.keys(v).length > 0; }
function isIterable(v) { return typeof v === "object" && typeof v[Symbol.iterator] === "function"; }
function isPlainArray(v) { return v instanceof Array && v.constructor === Array; }
function isNonEmptyPlainArray(v) { return v instanceof Array && v.constructor === Array && v.length > 0; }
function isArraylike(v) { return typeof v === "object" && v !== null && v.hasOwnProperty("length") && typeof v.length === "number" && Number.isInteger(v.length) && v.length >= 0 && v.length <= Number.MAX_SAFE_INTEGER; }
function isDate(v) { return v instanceof Date; }
function isFutureDate(v) { return v instanceof Date && v.getTime() > Date.now(); }
function isPastDate(v) { return v instanceof Date && v.getTime() < Date.now(); }
function isMap(v) { return v instanceof Map && v.constructor === Map; }
function isNonEmptyMap(v) { return v instanceof Map && v.constructor === Map && v.size > 0; }
function isWeakMap(v) { return v instanceof WeakMap && v.constructor === WeakMap; }
function isSet(v) { return v instanceof Set && v.constructor === Set; }
function isNonEmptySet(v) { return v instanceof Set && v.constructor === Set && v.size > 0; }
function isWeakSet(v) { return v instanceof WeakSet && v.constructor === WeakSet; }
function isPromise(v) { return v instanceof Promise; }
function isRegExp(v) { return v instanceof RegExp; }
function isAny() { return true; }

// Descriptions.
isNull.desc = "null"
isUndefined.desc = "undefined"
isDefined.desc = "defined"
isBoolean.desc = "true or false"
isTrue.desc = "true"
isFalse.desc = "false"
isTruthy.desc = "truthy"
isFalsy.desc = "falsy"
isNumber.desc = "finite number"
isPositiveNumber.desc = "positive finite number"
isNegativeNumber.desc = "negative finite number"
isInteger.desc = "integer"
isPositiveInteger.desc = "positive integer"
isNegativeInteger.desc = "negative integer"
isString.desc = "string"
isNonEmptyString.desc = "non-empty string"
isLowerString.desc = "lowercase string"
isNonEmptyLowerString.desc = "non-empty lowercase string"
isUpperString.desc = "uppercase string"
isNonEmptyUpperString.desc = "non-empty uppercase string"
isFunction.desc = "function"
isObject.desc = "object"
isPlainObject.desc = "plain object"
isNonEmptyPlainObject.desc = "plain object with one or more enumerable properties"
isIterable.desc = "iterable object"
isPlainArray.desc = "plain array"
isNonEmptyPlainArray.desc = "plain non-empty array"
isArraylike.desc = "arraylike object with a numeric length property"
isDate.desc = "date"
isFutureDate.desc = "date in the future"
isPastDate.desc = "date in the past"
isMap.desc = "map"
isNonEmptyMap.desc = "non-empty map"
isWeakMap.desc = "weak map"
isSet.desc = "set"
isNonEmptySet.desc = "non-empty set"
isWeakSet.desc = "weak set"
isPromise.desc = "promise"
isRegExp.desc = "regular expression"
isAny.desc = "any"

// Exports.
const checkers = {
	"null": isNull,
	"undefined": isUndefined, "void": isUndefined, "undef": isUndefined,
	"defined": isDefined, "def": isDefined,
	"boolean": isBoolean, "bool": isBoolean,
	"true": isTrue,
	"false": isFalse,
	"truthy": isTruthy,
	"falsy": isFalsy,
	"number": isNumber, "num": isNumber,
	"number+": isPositiveNumber, "num+": isPositiveNumber,
	"number-": isNegativeNumber, "num-": isNegativeNumber,
	"integer": isInteger, "int": isInteger,
	"integer+": isPositiveInteger, "int+": isPositiveInteger,
	"integer-": isNegativeInteger, "int-": isNegativeInteger,
	"string": isString, "str": isString,
	"string+": isNonEmptyString, "str+": isNonEmptyString,
	"lowercase": isLowerString, "lower": isLowerString,
	"lowercase+": isNonEmptyLowerString, "lower+": isNonEmptyLowerString,
	"uppercase": isUpperString, "upper": isUpperString,
	"uppercase+": isNonEmptyUpperString, "upper+": isNonEmptyUpperString,
	"function": isFunction, "func": isFunction,
	"objectlike": isObject,
	"object": isPlainObject, "obj": isPlainObject,
	"object+": isNonEmptyPlainObject, "obj+": isNonEmptyPlainObject,
	"iterable": isIterable,
	"array": isPlainArray, "arr": isPlainArray,
	"array+": isNonEmptyPlainArray, "arr+": isNonEmptyPlainArray,
	"arraylike": isArraylike, "arguments": isArraylike, "args": isArraylike,
	"date": isDate,
	"date+": isFutureDate,
	"future": isFutureDate,
	"date-": isPastDate, "past": isPastDate,
	"map": isMap,
	"map+": isNonEmptyMap,
	"weakmap": isWeakMap,
	"set": isSet,
	"set+": isNonEmptySet,
	"weakset": isWeakSet,
	"promise": isPromise,
	"regex": isRegExp, "regexp": isRegExp,
	"any": isAny, "mixed": isAny,
	"circular": isCircular,
};

// Exports.
module.exports = checkers;