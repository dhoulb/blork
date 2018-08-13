/* eslint-disable prettier/prettier */
const isEmpty = require("./isEmpty");
const isCircular = require("./isCircular");
const isJSONable = require("./isJSONable");

// Regexes.
const R_ALPHANUMERIC = /^[a-zA-Z0-9]+$/;
const R_ALPHABETIC = /^[a-zA-Z]+$/;
const R_NUMERIC = /^[0-9]+$/;
const R_UPPER = /^[A-Z]+$/;
const R_LOWER = /^[a-z]+$/;
const R_CAMEL = /^[a-z][a-zA-Z0-9]*$/;
const R_PASCAL = /^[A-Z][a-zA-Z0-9]*$/;
const R_SNAKE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;
const R_SCREAMING = /^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$/;
const R_KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const R_TRAIN = /^[A-Z][a-zA-Z0-9]*(-[A-Z0-9][a-zA-Z0-9]+)*$/;

// Checkers.
function isNull(v) { return v === null; }
function isUndefined(v) { return v === undefined; }
function isDefined(v) { return v !== undefined; }
function isBoolean(v) { return v === true || v === false; }
function isTrue(v) { return v === true; }
function isFalse(v) { return v === false; }
function isTruthy(v) { return !!v; }
function isFalsy(v) { return !v; }
function isZero(v) { return v === 0; }
function isOne(v) { return v === 1; }
function isNaN(v) { return Number.isNaN(v); }
function isFiniteNumber(v) { return Number.isFinite(v); }
function isPositiveNumber(v) { return Number.isFinite(v) && v >= 0; }
function isNegativeNumber(v) { return Number.isFinite(v) && v <= 0; }
function isInteger(v) { return Number.isInteger(v) && v >= Number.MIN_SAFE_INTEGER && v <= Number.MAX_SAFE_INTEGER; }
function isPositiveInteger(v) { return Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER; }
function isNegativeInteger(v) { return Number.isInteger(v) && v >= Number.MIN_SAFE_INTEGER && v <= 0; }
function isString(v) { return typeof v === "string"; }
function isAlphanumeric(v) { return typeof v === "string" && R_ALPHANUMERIC.test(v); }
function isAlphabetic(v) { return typeof v === "string" && R_ALPHABETIC.test(v); }
function isNumeric(v) { return typeof v === "string" && R_NUMERIC.test(v); }
function isLower(v) { return typeof v === "string" && R_LOWER.test(v); }
function isUpper(v) { return typeof v === "string" && R_UPPER.test(v); }
function isCamel(v) { return typeof v === "string" && R_CAMEL.test(v); }
function isPascal(v) { return typeof v === "string" && R_PASCAL.test(v); }
function isSnake(v) { return typeof v === "string" && R_SNAKE.test(v); }
function isScreaming(v) { return typeof v === "string" && R_SCREAMING.test(v); }
function isKebab(v) { return typeof v === "string" && R_KEBAB.test(v); }
function isTrain(v) { return typeof v === "string" && R_TRAIN.test(v); }
function isPrimitive(v) { return v === undefined || v === null || typeof v === "boolean" || typeof v === "string" || Number.isFinite(v); }
function isFunction(v) { return typeof v === "function"; }
function isObject(v) { return typeof v === "object" && v !== null; }
function isPlainObject(v) { return typeof v === "object" && v !== null && Object.getPrototypeOf(v).constructor === Object; }
function isIterable(v) { return typeof v === "object" && v !== null && typeof v[Symbol.iterator] === "function"; }
function isPlainArray(v) { return v instanceof Array && Object.getPrototypeOf(v).constructor === Array; }
function isArraylike(v) { return typeof v === "object" && v !== null && v.hasOwnProperty("length") && typeof v.length === "number" && Number.isInteger(v.length) && v.length >= 0 && v.length <= Number.MAX_SAFE_INTEGER; }
function isDate(v) { return v instanceof Date; }
function isFutureDate(v) { return v instanceof Date && v.getTime() > Date.now(); }
function isPastDate(v) { return v instanceof Date && v.getTime() < Date.now(); }
function isMap(v) { return v instanceof Map; }
function isWeakMap(v) { return v instanceof WeakMap; }
function isSet(v) { return v instanceof Set; }
function isWeakSet(v) { return v instanceof WeakSet; }
function isPromise(v) { return v instanceof Promise; }
function isRegExp(v) { return v instanceof RegExp; }
function isSymbol(v) { return typeof v === "symbol"; }
function isAny() { return true; }

// Descriptions.
isNull.desc = "null";
isUndefined.desc = "undefined";
isDefined.desc = "defined";
isBoolean.desc = "boolean";
isTrue.desc = "true";
isFalse.desc = "false";
isTruthy.desc = "truthy";
isFalsy.desc = "falsy";
isZero.desc = "zero";
isOne.desc = "one";
isNaN.desc = "NaN";
isFiniteNumber.desc = "finite number";
isPositiveNumber.desc = "positive finite number";
isNegativeNumber.desc = "negative finite number";
isInteger.desc = "integer";
isPositiveInteger.desc = "positive integer";
isNegativeInteger.desc = "negative integer";
isString.desc = "string";
isAlphanumeric.desc = "alphanumeric string";
isAlphabetic.desc = "alphabetic string";
isNumeric.desc = "numeric string";
isLower.desc = "lowercase string";
isUpper.desc = "UPPERCASE string";
isCamel.desc = "camelCase string";
isPascal.desc = "PascalCase string";
isSnake.desc = "snake_case string";
isScreaming.desc = "SCREAMING_SNAKE_CASE string";
isKebab.desc = "kebab-case string";
isTrain.desc = "Camel-Kebab-Case string";
isFunction.desc = "function"
isObject.desc = "object"
isPlainObject.desc = "plain object"
isIterable.desc = "iterable object"
isPlainArray.desc = "plain array"
isArraylike.desc = "arraylike object with a numeric length property"
isDate.desc = "date"
isFutureDate.desc = "date in the future"
isPastDate.desc = "date in the past"
isMap.desc = "map"
isWeakMap.desc = "weak map"
isSet.desc = "set"
isWeakSet.desc = "weak set"
isPromise.desc = "promise"
isRegExp.desc = "regular expression"
isSymbol.desc = "symbol"
isAny.desc = "any"

// Exports.
const checkers = {
	// Primitives.
	"primitive": isPrimitive,
	"null": isNull,
	"undefined": isUndefined,
	"void": isUndefined,
	"undef": isUndefined,
	"defined": isDefined,
	"def": isDefined,

	// Booleans.
	"boolean": isBoolean,
	"bool": isBoolean,
	"true": isTrue,
	"false": isFalse,
	"truthy": isTruthy,
	"falsy": isFalsy,

	// Numbers.
	"zero": isZero,
	"one": isOne,
	"nan": isNaN,
	"number": isFiniteNumber,
	"num": isFiniteNumber,
	"+number": isPositiveNumber,
	"+num": isPositiveNumber,
	"-number": isNegativeNumber,
	"-num": isNegativeNumber,
	"integer": isInteger,
	"int": isInteger,
	"+integer": isPositiveInteger,
	"+int": isPositiveInteger,
	"-integer": isNegativeInteger,
	"-int": isNegativeInteger,

	// Strings.
	"string": isString,
	"str": isString,
	"alphanumeric": isAlphanumeric,
	"alphabetic": isAlphabetic,
	"numeric": isNumeric,
	"lower": isLower,
	"upper": isUpper,
	"camel": isCamel,
	"pascal": isPascal,
	"snake": isSnake,
	"screaming": isScreaming,
	"kebab": isKebab,
	"slug": isKebab,
	"train": isTrain,

	// Objects.
	"function": isFunction,
	"func": isFunction,
	"objectlike": isObject,
	"object": isPlainObject,
	"obj": isPlainObject,
	"iterable": isIterable,
	"circular": isCircular,
	"array": isPlainArray,
	"arr": isPlainArray,
	"arraylike": isArraylike,
	"arguments": isArraylike,
	"args": isArraylike,
	"date": isDate,
	"future": isFutureDate,
	"past": isPastDate,
	"map": isMap,
	"weakmap": isWeakMap,
	"set": isSet,
	"weakset": isWeakSet,
	"promise": isPromise,
	"regex": isRegExp,
	"regexp": isRegExp,
	"symbol": isSymbol,

	// Other.
	"empty": isEmpty,
	"any": isAny,
	"mixed": isAny,
	"json": isJSONable,
	"jsonable": isJSONable,
};

// Exports.
module.exports = checkers;