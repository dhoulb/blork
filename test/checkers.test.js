const checkers = require("../lib/checkers");
const { check } = require("../lib/exports");

// Tests.
describe("checkers", () => {
	test("Every checker passes correctly", () => {
		expect.assertions(Object.keys(checkers).length);

		// Primatives.
		expect(check(null, "null")).toBe(1);
		expect(check(undefined, "undefined")).toBe(1);
		expect(check(undefined, "void")).toBe(1);
		expect(check(undefined, "undef")).toBe(1);
		expect(check(true, "defined")).toBe(1);
		expect(check(true, "def")).toBe(1);
		expect(check(true, "boolean")).toBe(1);
		expect(check(true, "bool")).toBe(1);
		expect(check(true, "true")).toBe(1);
		expect(check(false, "false")).toBe(1);
		expect(check(true, "truthy")).toBe(1);
		expect(check(false, "falsy")).toBe(1);

		// Numbers.
		expect(check(1.5, "number")).toBe(1);
		expect(check(1.5, "num")).toBe(1);
		expect(check(1.5, "number+")).toBe(1);
		expect(check(0.5, "num+")).toBe(1);
		expect(check(-1.5, "number-")).toBe(1);
		expect(check(-1.5, "num-")).toBe(1);
		expect(check(1, "integer")).toBe(1);
		expect(check(1, "int")).toBe(1);
		expect(check(1, "integer+")).toBe(1);
		expect(check(1, "int+")).toBe(1);
		expect(check(-1, "integer-")).toBe(1);
		expect(check(-1, "int-")).toBe(1);

		// Strings.
		expect(check("a", "string")).toBe(1);
		expect(check("a", "str")).toBe(1);
		expect(check("a", "string+")).toBe(1);
		expect(check("a", "str+")).toBe(1);
		expect(check("a", "lowercase")).toBe(1);
		expect(check("a", "lower")).toBe(1);
		expect(check("a", "lowercase+")).toBe(1);
		expect(check("a", "lower+")).toBe(1);
		expect(check("A", "uppercase")).toBe(1);
		expect(check("A", "upper")).toBe(1);
		expect(check("A", "uppercase+")).toBe(1);
		expect(check("A", "upper+")).toBe(1);

		// Functions.
		expect(check(function() {}, "function")).toBe(1);
		expect(check(function() {}, "func")).toBe(1);

		// Objects.
		expect(check({}, "object")).toBe(1);
		expect(check({ a: 1 }, "obj")).toBe(1);
		expect(check({ a: 1 }, "object+")).toBe(1);
		expect(check({ a: 1 }, "obj+")).toBe(1);
		expect(check({}, "objectlike")).toBe(1);
		expect(check({ [Symbol.iterator]: () => {} }, "iterable")).toBe(1);

		// Arrays.
		expect(check([], "array")).toBe(1);
		expect(check([], "arr")).toBe(1);
		expect(check([1], "array+")).toBe(1);
		expect(check([1], "arr+")).toBe(1);
		expect(check({ "0": "abc", length: 1 }, "arraylike")).toBe(1);
		expect(check(arguments, "arguments")).toBe(1);
		expect(check(arguments, "args")).toBe(1);

		// Dates.
		expect(check(new Date(), "date")).toBe(1);
		expect(check(new Date(2080, 0, 1), "date+")).toBe(1);
		expect(check(new Date(2080, 0, 1), "future")).toBe(1);
		expect(check(new Date(1980, 0, 1), "date-")).toBe(1);
		expect(check(new Date(1980, 0, 1), "past")).toBe(1);

		// Other.
		expect(check(new Map(), "map")).toBe(1);
		expect(check(new Map([[1, 1]]), "map+")).toBe(1);
		expect(check(new WeakMap(), "weakmap")).toBe(1);
		expect(check(new Set(), "set")).toBe(1);
		expect(check(new Set([1]), "set+")).toBe(1);
		expect(check(new WeakSet(), "weakset")).toBe(1);
		expect(check(Promise.resolve(), "promise")).toBe(1);
		expect(check(/[abc]+/g, "regexp")).toBe(1);
		expect(check(/[abc]+/g, "regex")).toBe(1);
		expect(check(false, "any")).toBe(1);
		expect(check("abc", "mixed")).toBe(1);
	});
	test("Every named type fails correctly", () => {
		expect.assertions(Object.keys(checkers).length);

		// Primatives..
		expect(() => check(0, "null")).toThrow(TypeError);
		expect(() => check(null, "undefined")).toThrow(TypeError);
		expect(() => check(null, "void")).toThrow(TypeError);
		expect(() => check(null, "undef")).toThrow(TypeError);
		expect(() => check(undefined, "defined")).toThrow(TypeError);
		expect(() => check(undefined, "def")).toThrow(TypeError);
		expect(() => check(9, "boolean")).toThrow(TypeError);
		expect(() => check(9, "bool")).toThrow(TypeError);
		expect(() => check(1, "true")).toThrow(TypeError);
		expect(() => check(9, "false")).toThrow(TypeError);
		expect(() => check(0, "truthy")).toThrow(TypeError);
		expect(() => check(1, "falsy")).toThrow(TypeError);

		// Numbers.
		expect(() => check("1", "number")).toThrow(TypeError);
		expect(() => check("1", "num")).toThrow(TypeError);
		expect(() => check(-1, "number+")).toThrow(TypeError);
		expect(() => check(-1, "num+")).toThrow(TypeError);
		expect(() => check(1, "number-")).toThrow(TypeError);
		expect(() => check(1, "num-")).toThrow(TypeError);
		expect(() => check(1.5, "integer")).toThrow(TypeError);
		expect(() => check(1.5, "int")).toThrow(TypeError);
		expect(() => check(1.5, "integer+")).toThrow(TypeError);
		expect(() => check(2.5, "int+")).toThrow(TypeError);
		expect(() => check(-1.5, "integer-")).toThrow(TypeError);
		expect(() => check(-2.5, "int-")).toThrow(TypeError);

		// Strings.
		expect(() => check(1, "string")).toThrow(TypeError);
		expect(() => check(1, "str")).toThrow(TypeError);
		expect(() => check("", "string+")).toThrow(TypeError);
		expect(() => check("", "str+")).toThrow(TypeError);
		expect(() => check("A", "lowercase")).toThrow(TypeError);
		expect(() => check("A", "lower")).toThrow(TypeError);
		expect(() => check("A", "lowercase+")).toThrow(TypeError);
		expect(() => check("A", "lower+")).toThrow(TypeError);
		expect(() => check("a", "uppercase")).toThrow(TypeError);
		expect(() => check("a", "upper")).toThrow(TypeError);
		expect(() => check("a", "uppercase+")).toThrow(TypeError);
		expect(() => check("a", "upper+")).toThrow(TypeError);

		// Functions.
		expect(() => check({}, "function")).toThrow(TypeError);
		expect(() => check({}, "func")).toThrow(TypeError);

		// Objects.
		expect(() => check(1, "object")).toThrow(TypeError);
		expect(() => check(1, "obj")).toThrow(TypeError);
		expect(() => check({}, "object+")).toThrow(TypeError);
		expect(() => check({}, "obj+")).toThrow(TypeError);
		expect(() => check("a", "objectlike")).toThrow(TypeError);
		expect(() => check({}, "iterable")).toThrow(TypeError);

		// Arrays.
		expect(() => check({}, "array")).toThrow(TypeError);
		expect(() => check({}, "arr")).toThrow(TypeError);
		expect(() => check({}, "array+")).toThrow(TypeError);
		expect(() => check({}, "arr+")).toThrow(TypeError);
		expect(() => check({}, "arraylike")).toThrow(TypeError);
		expect(() => check({}, "arguments")).toThrow(TypeError);
		expect(() => check({}, "args")).toThrow(TypeError);

		// Dates.
		expect(() => check("2016", "date")).toThrow(TypeError);
		expect(() => check(new Date(1080, 0, 1), "date+")).toThrow(TypeError);
		expect(() => check(new Date(1080, 0, 1), "future")).toThrow(TypeError);
		expect(() => check(new Date(2980, 0, 1), "date-")).toThrow(TypeError);
		expect(() => check(new Date(2980, 0, 1), "past")).toThrow(TypeError);

		// Other.
		expect(() => check([], "map")).toThrow(TypeError);
		expect(() => check(new Map(), "map+")).toThrow(TypeError);
		expect(() => check([], "weakmap")).toThrow(TypeError);
		expect(() => check([], "set")).toThrow(TypeError);
		expect(() => check(new Set(), "set+")).toThrow(TypeError);
		expect(() => check([], "weakset")).toThrow(TypeError);
		expect(() => check(true, "promise")).toThrow(TypeError);
		expect(() => check("/[abc]+/g", "regexp")).toThrow(TypeError);
		expect(() => check("/[abc]+/g", "regex")).toThrow(TypeError);
		expect(check(false, "any")).toBe(1);
		expect(check("abc", "mixed")).toBe(1);
	});
});
describe("array checker", () => {
	test("Works with empty arrays", () => {
		expect(check([1, 2, 3], "array")).toBe(1);
	});
	test("Works with non-empty arrays", () => {
		expect(check([1, 2, 3], "array")).toBe(1);
	});
	test("Fails for superclasses of Array", () => {
		class SuperArray extends Array {}
		expect(() => check(new SuperArray(), "array")).toThrow(TypeError);
	});
});
describe("arraylike/arguments checker", () => {
	test("Works with empty arguments objects", () => {
		(function() {
			expect(check(arguments, "arraylike")).toBe(1);
		})();
	});
	test("Works with non-empty arguments objects", () => {
		(function() {
			expect(check(arguments, "arraylike")).toBe(1);
		})("abc", "abc");
		(function() {
			expect(check(arguments, "arraylike")).toBe(1);
		})("abc", 123, false);
	});
	test("Works with arraylike objects", () => {
		expect(check({ length: 5 }, "arraylike")).toBe(1);
	});
	test("Fails if length is not positive integer", () => {
		expect(() => check({ length: 1.5 }, "arraylike")).toThrow(TypeError);
		expect(() => check({ length: -10 }, "arraylike")).toThrow(TypeError);
		expect(() => check({ length: Number.MAX_SAFE_INTEGER + 10 }, "arraylike")).toThrow(TypeError);
	});
});
describe("object checker", () => {
	test("Works with empty objects", () => {
		expect(check({}, "object")).toBe(1);
	});
	test("Works with non-empty objects", () => {
		expect(check({ a: 1, b: 2 }, "object")).toBe(1);
	});
	test("Fails for superclasses of object", () => {
		class SuperObject extends Object {}
		expect(() => check(new SuperObject(), "object")).toThrow(TypeError);
	});
});
describe("integer checkers", () => {
	test("Fails with floats", () => {
		expect(() => check(1.5, "integer")).toThrow(TypeError);
		expect(() => check(1.5, "integer-")).toThrow(TypeError);
		expect(() => check(1.5, "integer+")).toThrow(TypeError);
	});
	test("Works with zero integers", () => {
		expect(check(0, "integer")).toBe(1);
		expect(check(0, "integer+")).toBe(1);
		expect(check(0, "integer-")).toBe(1);
	});
	test("Works with highest allowed integers", () => {
		expect(check(Number.MAX_SAFE_INTEGER, "integer")).toBe(1);
		expect(check(Number.MAX_SAFE_INTEGER, "integer+")).toBe(1);
		expect(check(0, "integer-")).toBe(1);
	});
	test("Works with lowest allowed integers", () => {
		expect(check(Number.MIN_SAFE_INTEGER, "integer")).toBe(1);
		expect(check(Number.MIN_SAFE_INTEGER, "integer-")).toBe(1);
		expect(check(0, "integer+")).toBe(1);
	});
	test("Fails for numbers higher than allowed", () => {
		expect(() => check(Number.MAX_SAFE_INTEGER + 10, "integer")).toThrow(TypeError);
		expect(() => check(Number.MAX_SAFE_INTEGER + 10, "integer+")).toThrow(TypeError);
		expect(() => check(1, "integer-")).toThrow(TypeError);
	});
	test("Fails for numbers lower than allowed", () => {
		expect(() => check(Number.MIN_SAFE_INTEGER - 10, "integer")).toThrow(TypeError);
		expect(() => check(-1, "integer+")).toThrow(TypeError);
		expect(() => check(Number.MIN_SAFE_INTEGER - 10, "integer-")).toThrow(TypeError);
	});
});
