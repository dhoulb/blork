const ValueError = require("../lib/ValueError");
const BlorkError = require("../lib/BlorkError");
const { check, add } = require("../lib/exports");

// Tests.
describe("add()", () => {
	test("Add and run a custom checker (no description)", () => {
		// Define a checker called '11218c'.
		expect(add("11218c", v => typeof v === "string")).toBeUndefined();

		// Check a passing value.
		expect(check("abc", "11218c")).toBe(undefined);

		// Check a failing value.
		expect(() => check(123, "11218c")).toThrow(TypeError);
		expect(() => check(123, "11218c")).toThrow(/11218c/); // Must contain name.
	});
	test("Add and run a custom checker (with description)", () => {
		// Define a checker called '618e0e'.
		expect(add("618e0e", v => typeof v === "string", "a43829")).toBeUndefined();

		// Check a passing value.
		expect(check("abc", "618e0e")).toBe(undefined);

		// Check a failing value.
		expect(() => check(123, "618e0e")).toThrow(TypeError);
		expect(() => check(123, "618e0e")).toThrow(/a43829/); // Must contain description.
	});
	test("Add and run a custom checker (with custom Error)", () => {
		// Create a custom error.
		class IsBooleanError extends Error {}

		// Define a checker called 'eee400'.
		expect(add("eee400", v => typeof v === "string", "4c685f", IsBooleanError)).toBeUndefined();

		// Check a passing value.
		expect(check("abc", "eee400")).toBe(undefined);

		// Check a failing value.
		expect(() => check(123, "eee400")).toThrow(IsBooleanError);
		expect(() => check(123, "eee400")).toThrow(/4c685f/); // Must contain description.
	});
	test("Add and run a custom checker (with custom ValueError)", () => {
		// Create a custom error.
		class IsNullError extends ValueError {}

		// Define a checker called '013e93'.
		expect(add("013e93", v => typeof v === "string", "824b7c", IsNullError)).toBeUndefined();

		// Check a passing value.
		expect(check("abc", "013e93")).toBe(undefined);

		// Check a failing value.
		expect(() => check(123, "013e93")).toThrow(IsNullError);
		expect(() => check(123, "013e93")).toThrow(/824b7c/); // Must contain description.
	});
	test("Throw BlorkError if not non-empty lowercase string", () => {
		const func = () => {};
		expect(() => add(123, func, "func")).toThrow(BlorkError);
		expect(() => add("", func, "func")).toThrow(BlorkError);
		expect(() => add("UPPER", func, "func")).toThrow(BlorkError);
	});
	test("Throw BlorkError if passing a non-function", () => {
		expect(() => add("test.checker.nonfunction", true)).toThrow(BlorkError);
	});
	test("Throw BlorkError if same name as existing", () => {
		const func = () => {};
		add("test.checker.samename", func, "samename");
		expect(() => add("test.checker.samename", func)).toThrow(BlorkError);
	});
});
