const { check, BlorkError, ValueError } = require("../../lib/exports");

// Tests.
describe("exports.check()", () => {
	describe("value, types", () => {
		test("Throw BlorkError if type is not object, function, string, or one of our known types", () => {
			expect(() => check(1, 123)).toThrow(BlorkError);
		});
		test("Literal types true, false, null, and undefined all work correctly", () => {
			expect(check(true, true)).toBe(undefined);
			expect(check(false, false)).toBe(undefined);
			expect(check(null, null)).toBe(undefined);
			expect(check(undefined, undefined)).toBe(undefined);
		});
		test("Do not throw error if passing string prefix", () => {
			expect(check(true, "bool", "myValue")).toBe(undefined);
			expect(check(true, Boolean, "myValue")).toBe(undefined);
			expect(check([true], ["bool"], "myValue")).toBe(undefined);
			expect(check({ bool: true }, { bool: "bool" }, "myValue")).toBe(undefined);
		});
		test("Throw BlorkError if passing non-string prefix", () => {
			expect(() => check(1, "bool", 123)).toThrow(BlorkError);
			expect(() => check(1, "bool", 123)).toThrow(/check\(\):/);
			expect(() => check(1, "bool", 123)).toThrow(/prefix:/);
			expect(() => check(1, "bool", 123)).toThrow(/string/);
			expect(() => check(1, "bool", 123)).toThrow(/123/);
		});
	});

	describe("prefix", () => {
		test("Error prefix defaults to no prefix", () => {
			// Still includes "expect(): " because we use the stack to calculate the function prefix
			expect(() => check(123, String)).toThrow(/^expect\(\): Must/);
		});
		test("Error prefix can be altered by setting prefix argument", () => {
			// Still includes "expect(): " because we use the stack to calculate the function prefix
			expect(() => check(123, String, "myprefix")).toThrow(/^expect\(\): myprefix/);
		});
	});
	describe("error", () => {
		test("Error class defaults to ValueError", () => {
			expect(() => check(true, false, "a")).toThrow(ValueError);
			expect(() => check(true, false, "a")).toThrow(ValueError);
		});
		test("Error class can be altered by setting error argument", () => {
			class MyError extends Error {}
			expect(() => check(true, false, "a", MyError)).toThrow(MyError);
			expect(() => check(true, false, "a", MyError)).toThrow(MyError);
		});
	});
});
