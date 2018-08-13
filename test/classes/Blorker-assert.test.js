const { assert, BlorkError, ValueError } = require("../../lib/exports");

// Tests.
describe("Blorker.assert()", () => {
	describe("assertion, description", () => {
		test("Do nothing if assertion is true", () => {
			expect(() => assert(true, "be assertively true")).not.toThrow();
		});
		test("Throw BlorkError if assertion is false", () => {
			expect(() => assert(false, "be assertively true")).toThrow(ValueError);
			expect(() => assert(false, "be assertively true")).toThrow(/Must be assertively true/);
		});
		test("Throw BlorkError if description is not string", () => {
			expect(() => assert(true, 123)).toThrow(BlorkError);
			expect(() => assert(true, true)).toThrow(BlorkError);
		});
		test("Error doesn't include `(received etc)`", () => {
			expect(() => assert(false, "be assertively true")).toThrow(ValueError);
			expect(() => assert(false, "be assertively true")).not.toThrow(/received/);
		});
	});
	describe("prefix", () => {
		test("Error prefix defaults to no prefix", () => {
			// Still includes "expect(): " because we use the stack to calculate the function prefix
			expect(() => assert(false, "be assertively true")).toThrow(/^expect\(\): Must/);
		});
		test("Error prefix can be altered by setting prefix argument", () => {
			// Still includes "expect(): " because we use the stack to calculate the function prefix
			expect(() => assert(false, "be assertively true", "myprefix")).toThrow(/^expect\(\): myprefix/);
		});
	});
	describe("error", () => {
		test("Error class defaults to ValueError", () => {
			expect(() => assert(false, "be assertively true", "a")).toThrow(ValueError);
			expect(() => assert(false, "be assertively true", "a")).toThrow(ValueError);
		});
		test("Error class can be altered by setting error argument", () => {
			class MyError extends Error {}
			expect(() => assert(false, "be assertively true", "a", MyError)).toThrow(MyError);
			expect(() => assert(false, "be assertively true", "a", MyError)).toThrow(MyError);
		});
	});
});
