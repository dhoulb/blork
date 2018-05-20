const checkers = require("../lib/checkers");
const { check } = require("../lib/exports");

// Vars.
const circular = [];
circular[0] = circular;

// Tests.
describe("checkers", () => {
	test("Every checker passes correctly", () => {
		// Mock check() so we can check we tested everything.
		const called = [];
		function mockCheck(v, k) {
			called.push(k);
			return check(v, k);
		}

		// Primitives.
		expect(mockCheck(null, "primitive")).toBe(undefined);
		expect(mockCheck(null, "null")).toBe(undefined);
		expect(mockCheck(undefined, "undefined")).toBe(undefined);
		expect(mockCheck(undefined, "void")).toBe(undefined);
		expect(mockCheck(undefined, "undef")).toBe(undefined);
		expect(mockCheck(true, "defined")).toBe(undefined);
		expect(mockCheck(true, "def")).toBe(undefined);

		// Booleans.
		expect(mockCheck(true, "boolean")).toBe(undefined);
		expect(mockCheck(true, "bool")).toBe(undefined);
		expect(mockCheck(true, "true")).toBe(undefined);
		expect(mockCheck(false, "false")).toBe(undefined);
		expect(mockCheck(true, "truthy")).toBe(undefined);
		expect(mockCheck(false, "falsy")).toBe(undefined);

		// Numbers.
		expect(mockCheck(0, "zero")).toBe(undefined);
		expect(mockCheck(1, "one")).toBe(undefined);
		expect(mockCheck(NaN, "nan")).toBe(undefined);
		expect(mockCheck(1.5, "number")).toBe(undefined);
		expect(mockCheck(1.5, "num")).toBe(undefined);
		expect(mockCheck(1.5, "+number")).toBe(undefined);
		expect(mockCheck(0.5, "+num")).toBe(undefined);
		expect(mockCheck(-1.5, "-number")).toBe(undefined);
		expect(mockCheck(-1.5, "-num")).toBe(undefined);
		expect(mockCheck(1, "integer")).toBe(undefined);
		expect(mockCheck(1, "int")).toBe(undefined);
		expect(mockCheck(1, "+integer")).toBe(undefined);
		expect(mockCheck(1, "+int")).toBe(undefined);
		expect(mockCheck(-1, "-integer")).toBe(undefined);
		expect(mockCheck(-1, "-int")).toBe(undefined);

		// Strings.
		expect(mockCheck("a", "string")).toBe(undefined);
		expect(mockCheck("a", "str")).toBe(undefined);
		expect(mockCheck("abc123", "alphanumeric")).toBe(undefined);
		expect(mockCheck("abc", "alphabetic")).toBe(undefined);
		expect(mockCheck("123", "numeric")).toBe(undefined);
		expect(mockCheck("myvar", "lower")).toBe(undefined);
		expect(mockCheck("MYVAR", "upper")).toBe(undefined);
		expect(mockCheck("myVar", "camel")).toBe(undefined);
		expect(mockCheck("MyVar", "pascal")).toBe(undefined);
		expect(mockCheck("my_var", "snake")).toBe(undefined);
		expect(mockCheck("MY_VAR", "screaming")).toBe(undefined);
		expect(mockCheck("my-var", "kebab")).toBe(undefined);
		expect(mockCheck("my-var", "slug")).toBe(undefined);
		expect(mockCheck("My-Var", "train")).toBe(undefined);

		// Objects.
		expect(mockCheck(function() {}, "function")).toBe(undefined);
		expect(mockCheck(function() {}, "func")).toBe(undefined);
		expect(mockCheck({}, "object")).toBe(undefined);
		expect(mockCheck({ a: 1 }, "obj")).toBe(undefined);
		expect(mockCheck({}, "objectlike")).toBe(undefined);
		expect(mockCheck({ [Symbol.iterator]: () => {} }, "iterable")).toBe(undefined);
		expect(mockCheck(circular, "circular")).toBe(undefined);
		expect(mockCheck([], "array")).toBe(undefined);
		expect(mockCheck([], "arr")).toBe(undefined);
		expect(mockCheck({ "0": "abc", length: 1 }, "arraylike")).toBe(undefined);
		expect(mockCheck(arguments, "arguments")).toBe(undefined);
		expect(mockCheck(arguments, "args")).toBe(undefined);
		expect(mockCheck(new Date(), "date")).toBe(undefined);
		expect(mockCheck(new Date(2080, 0, 1), "future")).toBe(undefined);
		expect(mockCheck(new Date(1980, 0, 1), "past")).toBe(undefined);
		expect(mockCheck(new Map(), "map")).toBe(undefined);
		expect(mockCheck(new WeakMap(), "weakmap")).toBe(undefined);
		expect(mockCheck(new Set(), "set")).toBe(undefined);
		expect(mockCheck(new WeakSet(), "weakset")).toBe(undefined);
		expect(mockCheck(Promise.resolve(), "promise")).toBe(undefined);
		expect(mockCheck(/[abc]+/g, "regexp")).toBe(undefined);
		expect(mockCheck(/[abc]+/g, "regex")).toBe(undefined);
		expect(mockCheck(Symbol(), "symbol")).toBe(undefined);

		// Other.
		expect(mockCheck([], "empty")).toBe(undefined);
		expect(mockCheck(false, "any")).toBe(undefined);
		expect(mockCheck("abc", "mixed")).toBe(undefined);
		expect(mockCheck({ num: 123, str: "abc" }, "json")).toBe(undefined);
		expect(mockCheck({ num: 123, str: "abc" }, "jsonable")).toBe(undefined);

		// Check we called every checker.
		// Done in this awkward way so we get an error that helps us find the one we're missing.
		const checkerNames = Object.keys(checkers);
		checkerNames.forEach(name => expect(called).toContain(name));
		called.forEach(name => expect(checkerNames).toContain(name));
		expect(called.length).toBe(checkerNames.length);
	});
	test("Every named type fails correctly", () => {
		// Mock check() so we can check we tested everything.
		const called = [];
		function mockCheck(v, k) {
			called.push(k);
			return check(v, k);
		}

		// Primatives..
		expect(() => mockCheck(Symbol(), "primitive")).toThrow(TypeError);
		expect(() => mockCheck(0, "null")).toThrow(TypeError);
		expect(() => mockCheck(null, "undefined")).toThrow(TypeError);
		expect(() => mockCheck(null, "void")).toThrow(TypeError);
		expect(() => mockCheck(null, "undef")).toThrow(TypeError);
		expect(() => mockCheck(undefined, "defined")).toThrow(TypeError);
		expect(() => mockCheck(undefined, "def")).toThrow(TypeError);

		// Booleans.
		expect(() => mockCheck(9, "boolean")).toThrow(TypeError);
		expect(() => mockCheck(9, "bool")).toThrow(TypeError);
		expect(() => mockCheck(1, "true")).toThrow(TypeError);
		expect(() => mockCheck(9, "false")).toThrow(TypeError);
		expect(() => mockCheck(0, "truthy")).toThrow(TypeError);
		expect(() => mockCheck(1, "falsy")).toThrow(TypeError);

		// Numbers.
		expect(() => mockCheck(1, "zero")).toThrow(TypeError);
		expect(() => mockCheck(0, "one")).toThrow(TypeError);
		expect(() => mockCheck(1, "nan")).toThrow(TypeError);
		expect(() => mockCheck("1", "number")).toThrow(TypeError);
		expect(() => mockCheck("1", "num")).toThrow(TypeError);
		expect(() => mockCheck("1", "+number")).toThrow(TypeError);
		expect(() => mockCheck("1", "+num")).toThrow(TypeError);
		expect(() => mockCheck("1", "-number")).toThrow(TypeError);
		expect(() => mockCheck("1", "-num")).toThrow(TypeError);
		expect(() => mockCheck(1.5, "integer")).toThrow(TypeError);
		expect(() => mockCheck(1.5, "int")).toThrow(TypeError);
		expect(() => mockCheck(-1, "+integer")).toThrow(TypeError);
		expect(() => mockCheck(-1, "+int")).toThrow(TypeError);
		expect(() => mockCheck(1, "-integer")).toThrow(TypeError);
		expect(() => mockCheck(1, "-int")).toThrow(TypeError);

		// Strings.
		expect(() => mockCheck(1, "string")).toThrow(TypeError);
		expect(() => mockCheck(1, "str")).toThrow(TypeError);
		expect(() => mockCheck("-", "alphanumeric")).toThrow(TypeError);
		expect(() => mockCheck("1", "alphabetic")).toThrow(TypeError);
		expect(() => mockCheck("A", "numeric")).toThrow(TypeError);
		expect(() => mockCheck("A", "lower")).toThrow(TypeError);
		expect(() => mockCheck("a", "upper")).toThrow(TypeError);
		expect(() => mockCheck("my-var", "camel")).toThrow(TypeError);
		expect(() => mockCheck("my-var", "pascal")).toThrow(TypeError);
		expect(() => mockCheck("MY_VAR", "snake")).toThrow(TypeError);
		expect(() => mockCheck("MY-VAR", "screaming")).toThrow(TypeError);
		expect(() => mockCheck("MY-VAR", "kebab")).toThrow(TypeError);
		expect(() => mockCheck("my-VAR", "slug")).toThrow(TypeError);
		expect(() => mockCheck("my-var", "train")).toThrow(TypeError);

		// Objects.
		expect(() => mockCheck({}, "function")).toThrow(TypeError);
		expect(() => mockCheck({}, "func")).toThrow(TypeError);
		expect(() => mockCheck(1, "object")).toThrow(TypeError);
		expect(() => mockCheck(1, "obj")).toThrow(TypeError);
		expect(() => mockCheck("a", "objectlike")).toThrow(TypeError);
		expect(() => mockCheck({}, "iterable")).toThrow(TypeError);
		expect(() => mockCheck([], "circular")).toThrow(TypeError);
		expect(() => mockCheck({}, "array")).toThrow(TypeError);
		expect(() => mockCheck({}, "arr")).toThrow(TypeError);
		expect(() => mockCheck({}, "arraylike")).toThrow(TypeError);
		expect(() => mockCheck({}, "arguments")).toThrow(TypeError);
		expect(() => mockCheck({}, "args")).toThrow(TypeError);
		expect(() => mockCheck("2016", "date")).toThrow(TypeError);
		expect(() => mockCheck(new Date(1080, 0, 1), "future")).toThrow(TypeError);
		expect(() => mockCheck(new Date(2980, 0, 1), "past")).toThrow(TypeError);
		expect(() => mockCheck([], "map")).toThrow(TypeError);
		expect(() => mockCheck([], "weakmap")).toThrow(TypeError);
		expect(() => mockCheck([], "set")).toThrow(TypeError);
		expect(() => mockCheck([], "weakset")).toThrow(TypeError);
		expect(() => mockCheck(true, "promise")).toThrow(TypeError);
		expect(() => mockCheck("/[abc]+/g", "regexp")).toThrow(TypeError);
		expect(() => mockCheck("/[abc]+/g", "regex")).toThrow(TypeError);
		expect(() => mockCheck("symbol", "symbol")).toThrow(TypeError);

		// Other.
		expect(() => mockCheck([1], "empty")).toThrow(TypeError);
		expect(mockCheck(false, "any")).toBe(undefined);
		expect(mockCheck("abc", "mixed")).toBe(undefined);
		expect(() => mockCheck(undefined, "json")).toThrow(TypeError);
		expect(() => mockCheck({ a: undefined }, "jsonable")).toThrow(TypeError);

		// Check we called every checker.
		// Done in this awkward way so we get an error that helps us find the one we're missing.
		const checkerNames = Object.keys(checkers);
		checkerNames.forEach(name => expect(called).toContain(name));
		called.forEach(name => expect(checkerNames).toContain(name));
		expect(called.length).toBe(checkerNames.length);
	});
});
