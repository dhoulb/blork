const { args, BlorkError, ValueError } = require("../lib/exports");

// Tests.
describe("exports.args()", () => {
	describe("args, arguments", () => {
		test("Return correctly when argument checks pass", () => {
			const argsObj = { "0": "a", "1": 123, "2": true, length: 3 };
			expect(args(argsObj, [String, Number, Boolean])).toBe(undefined);
			const argsArr = ["a", 123, true];
			expect(args(argsArr, [String, Number, Boolean])).toBe(undefined);
		});
		test("Return correctly when arguments are optional", () => {
			const argsObj = { "0": "a", "1": 123, length: 2 };
			expect(args(argsObj, ["str", "num", "bool?"])).toBe(undefined);
			const argsArr = ["a", 123];
			expect(args(argsArr, ["str", "num", "bool?"])).toBe(undefined);
		});
		test("Throw TypeError when argument checks fail", () => {
			const argsObj = { "0": "a", length: 3 };
			expect(() => args(argsObj, [Number])).toThrow(TypeError);
		});
		test("Throw TypeError when too many arguments", () => {
			const argsObj = { "0": true, "1": true, "2": true, length: 3 };
			expect(() => args(argsObj, [Boolean, Boolean])).toThrow(TypeError);
			expect(() => args(argsObj, [Boolean, Boolean])).toThrow(/3/i);
		});
		test("Throw BlorkError if passing non-arguments-like object", () => {
			expect(() => args({}, [Number])).toThrow(BlorkError);
			expect(() => args({}, [Number])).toThrow(/args\(\):/);
			expect(() => args({}, [Number])).toThrow(/arraylike/);
			expect(() => args({}, [Number])).toThrow(/\{\}/);
		});
		test("Throw BlorkError if types is not array", () => {
			expect(() => args({ "0": "abc", length: 1 }, { length: 0 })).toThrow(BlorkError);
		});
		test("Arguments object check works correctly", () => {
			(function() {
				expect(args(arguments, ["str", "num", "bool"])).toBe(undefined);
			})("abc", 123, true);
		});
	});
	describe("prefix", () => {
		test("Error prefix defaults to `arguments`", () => {
			const argsObj = { "0": true, "1": true, "2": true, length: 3 };
			// Still includes "expect(): " because we use the stack to calculate the function prefix
			expect(() => args(argsObj, [Boolean, Boolean])).toThrow(/^expect\(\): arguments:/);
			expect(() => args(argsObj, [String, String, String])).toThrow(/^expect\(\): arguments\[0\]:/);
		});
		test("Error prefix can be altered by setting prefix argument", () => {
			const argsObj = { "0": true, "1": true, "2": true, length: 3 };
			// Still includes "expect(): " because we use the stack to calculate the function prefix
			expect(() => args(argsObj, [Boolean, Boolean], "myprefix")).toThrow(/^expect\(\): myprefix:/);
			expect(() => args(argsObj, [String, String, String], "myprefix")).toThrow(/^expect\(\): myprefix\[0\]:/);
		});
	});
	describe("error", () => {
		test("Error class defaults to ValueError", () => {
			const argsObj = { "0": true, "1": true, "2": true, length: 3 };
			expect(() => args(argsObj, [Boolean, Boolean], "a")).toThrow(ValueError);
			expect(() => args(argsObj, [String, String, String], "a")).toThrow(ValueError);
		});
		test("Error class can be altered by setting error argument", () => {
			class MyError extends Error {}
			const argsObj = { "0": true, "1": true, "2": true, length: 3 };
			expect(() => args(argsObj, [Boolean, Boolean], "a", MyError)).toThrow(MyError);
			expect(() => args(argsObj, [String, String, String], "a", MyError)).toThrow(MyError);
		});
	});
});
