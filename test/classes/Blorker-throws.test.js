const ValueError = require("../../lib/errors/ValueError");
const BlorkError = require("../../lib/errors/BlorkError");
const { check, throws } = require("../../lib/exports");

// Tests.
describe("exports.throws()", () => {
	test("Set a custom error object and check it throws", () => {
		// Define a custom error.
		class MyError extends Error {}

		// Set it as the custom error.
		expect(throws(MyError)).toBeUndefined();

		// Fail a check and make sure it throws the custom error (not TypeError).
		expect(() => check(false, "true", "myValue")).toThrow(MyError);
		expect(() => check(false, "true", "myValue")).toThrow(/myValue: Must be true \(received false\)/);
	});
	test("Set a custom error object (that extends ValueError) and check it throws", () => {
		// Define a custom error.
		class MyValueError extends ValueError {}

		// Set it as the custom error.
		expect(throws(MyValueError)).toBeUndefined();

		// Fail a check and make sure it throws the custom error (not TypeError).
		expect(() => check(false, "true", "myValue")).toThrow(MyValueError);
		expect(() => check(false, "true", "myValue")).toThrow(ValueError);
		expect(() => check(false, "true", "myValue")).toThrow(/myValue: Must be true \(received false\)/);
	});
	test("Throw BlorkError if passing a non-function", () => {
		expect(() => throws(false)).toThrow(BlorkError);
		expect(() => throws({})).toThrow(BlorkError);
		expect(() => throws(123)).toThrow(BlorkError);
		expect(() => throws(123)).toThrow("throws():");
		expect(() => throws(123)).toThrow("error:");
		expect(() => throws(123)).toThrow("function");
		expect(() => throws(123)).toThrow("123");
	});
});
