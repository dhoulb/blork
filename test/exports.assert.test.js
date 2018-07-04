const { assert, BlorkError, ValueError } = require("../lib/exports");

// Tests.
describe("exports.assert()", () => {
	describe("assertion, description", () => {
		test("Do nothing if assertion is true", () => {
			expect(() => assert(true, "assertively true")).not.toThrow();
		});
		test("Throw BlorkError if assertion is false", () => {
			expect(() => assert(false, "assertively true")).toThrow(ValueError);
			expect(() => assert(false, "assertively true")).toThrow(/Must be assertively true/);
		});
		test("Throw BlorkError if description is not string", () => {
			expect(() => assert(true, 123)).toThrow(BlorkError);
			expect(() => assert(true, true)).toThrow(BlorkError);
		});
	});
	describe("prefix", () => {
		test("Error prefix defaults to no prefix", () => {
			expect(() => assert(false, "assertively true")).toThrow(/^Must/);
		});
		test("Error prefix can be altered by setting prefix argument", () => {
			expect(() => assert(false, "assertively true", "myprefix")).toThrow(/^myprefix/);
		});
	});
	describe("error", () => {
		test("Error class defaults to ValueError", () => {
			expect(() => assert(false, "assertively true", "a")).toThrow(ValueError);
			expect(() => assert(false, "assertively true", "a")).toThrow(ValueError);
		});
		test("Error class can be altered by setting error argument", () => {
			class MyError extends Error {}
			expect(() => assert(false, "assertively true", "a", MyError)).toThrow(MyError);
			expect(() => assert(false, "assertively true", "a", MyError)).toThrow(MyError);
		});
	});
});
