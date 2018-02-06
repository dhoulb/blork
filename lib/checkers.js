// Primatives.
exports["null"] = v => v === null || "Must be null";
exports["undefined"] = exports["void"] = exports["undef"] = v => v === undefined || "Must be undefined";
exports["defined"] = exports["def"] = v => v !== undefined || "Must be defined";
exports["boolean"] = exports["bool"] = v => v === true || v === false || "Must be true or false";
exports["true"] = v => v === true || "Must be true";
exports["false"] = v => v === false || "Must be false";
exports["truthy"] = v => !!v || "Must be truthy";
exports["falsy"] = v => !v || "Must be falsy";

// Numbers.
exports["number"] = exports["num"] = v => (typeof v === "number" && Number.isFinite(v)) || "Must be a finite number";
exports["number+"] = exports["num+"] = v =>
	(typeof v === "number" && Number.isFinite(v) && v >= 0) || "Must be a positive finite number";
exports["number-"] = exports["num-"] = v =>
	(typeof v === "number" && Number.isFinite(v) && v <= 0) || "Must be a negative finite number";
exports["integer"] = exports["int"] = v =>
	(typeof v === "number" && Number.isInteger(v) && v >= Number.MIN_SAFE_INTEGER && v <= Number.MAX_SAFE_INTEGER) ||
	"Must be an integer";
exports["integer+"] = exports["int+"] = v =>
	(typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= Number.MAX_SAFE_INTEGER) ||
	"Must be a positive integer";
exports["integer-"] = exports["int-"] = v =>
	(typeof v === "number" && Number.isInteger(v) && v >= Number.MIN_SAFE_INTEGER && v <= 0) ||
	"Must be a negative integer";

// Strings.
exports["string"] = exports["str"] = v => typeof v === "string" || "Must be a string";
exports["string+"] = exports["str+"] = v => (typeof v === "string" && v.length > 0) || "Must be a non-empty string";
exports["lowercase"] = exports["lower"] = v =>
	(typeof v === "string" && v === v.toLowerCase()) || "Must be a lowercase string";
exports["lowercase+"] = exports["lower+"] = v =>
	(typeof v === "string" && v.length > 0 && v === v.toLowerCase()) || "Must be a non-empty lowercase string";
exports["uppercase"] = exports["upper"] = v =>
	(typeof v === "string" && v === v.toUpperCase()) || "Must be an uppercase string";
exports["uppercase+"] = exports["upper+"] = v =>
	(typeof v === "string" && v.length > 0 && v === v.toUpperCase()) || "Must be a non-empty uppercase string";

// Functions.
exports["function"] = exports["func"] = v => v instanceof Function || "Must be a function";

// Objects.
exports["object"] = exports["obj"] = v => (v instanceof Object && v.constructor === Object) || "Must be a plain object";
exports["object+"] = exports["obj+"] = v =>
	(v instanceof Object && v.constructor === Object && Object.keys(v).length > 0) ||
	"Must be a plain object with one or more enumerable properties";
exports["objectlike"] = v => v instanceof Object || "Must be an object";
exports["iterable"] = v =>
	(v instanceof Object && typeof v[Symbol.iterator] === "function") || "Must be an iterable object";

// Arrays.
exports["array"] = exports["arr"] = v => (v instanceof Array && v.constructor === Array) || "Must be a plain array";
exports["array+"] = exports["arr+"] = v =>
	(v instanceof Array && v.constructor === Array && v.length > 0) || "Must be a plain non-empty array";
exports["arraylike"] = exports["arguments"] = exports["args"] = v =>
	(v instanceof Object &&
		v.hasOwnProperty("length") &&
		typeof v.length === "number" &&
		v.length > 0 &&
		v.length <= Number.MAX_SAFE_INTEGER) ||
	"Must be an arraylike object with a numeric length property";

// Dates.
exports["date"] = v => v instanceof Date || "Must be a date";
exports["date+"] = exports["future"] = v =>
	(v instanceof Date && v.getTime() > Date.now()) || "Must be a date in the future";
exports["date-"] = exports["past"] = v =>
	(v instanceof Date && v.getTime() < Date.now()) || "Must be a date in the past";

// Other.
exports["map"] = v => (v instanceof Map && v.constructor === Map) || "Must be a map";
exports["map+"] = v => (v instanceof Map && v.constructor === Map && v.size > 0) || "Must be a map";
exports["weakmap"] = v => (v instanceof WeakMap && v.constructor === WeakMap) || "Must be a weak map";
exports["set"] = v => (v instanceof Set && v.constructor === Set) || "Must be a set";
exports["set+"] = v => (v instanceof Set && v.constructor === Set && v.size > 0) || "Must be a non-empty set";
exports["weakset"] = v => (v instanceof WeakSet && v.constructor === WeakSet) || "Must be a weak set";
exports["promise"] = v => v instanceof Promise || "Must be a promise";
exports["regex"] = exports["regexp"] = v => v instanceof RegExp || "Must be a regular expression";
exports["any"] = exports["mixed"] = () => true;
