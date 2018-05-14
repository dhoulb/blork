const ValueError = require("../lib/errors/ValueError");
const BlorkError = require("../lib/errors/BlorkError");
const { check, add } = require("../lib/exports");

// Tests.
describe("exports.add()", () => {
	test("Add and run a custom checker (no description)", () => {
		// Define a checker called 'a11218'.
		expect(add("a11218", v => typeof v === "string")).toBeUndefined();

		// Check a passing value.
		expect(check("abc", "a11218")).toBe(undefined);

		// Check a failing value.
		expect(() => check(123, "a11218")).toThrow(TypeError);
		expect(() => check(123, "a11218")).toThrow(/a11218/); // Must contain name.
	});
	test("Add and run a custom checker (with description)", () => {
		// Define a checker called 'e618e0'.
		expect(add("e618e0", v => typeof v === "string", "e618e0")).toBeUndefined();

		// Check a passing value.
		expect(check("abc", "e618e0")).toBe(undefined);

		// Check a failing value.
		expect(() => check(123, "e618e0")).toThrow(TypeError);
		expect(() => check(123, "e618e0")).toThrow(/e618e0/); // Must contain description.
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

		// Define a checker called 't01393'.
		expect(add("t01393", v => typeof v === "string", "824b7c", IsNullError)).toBeUndefined();

		// Check a passing value.
		expect(check("abc", "t01393")).toBe(undefined);

		// Check a failing value.
		expect(() => check(123, "t01393")).toThrow(IsNullError);
		expect(() => check(123, "t01393")).toThrow(/824b7c/); // Must contain description.
	});
	test("Throw BlorkError if name is not kebab-case string", () => {
		const func = () => {};
		expect(() => add(123, func, "func")).toThrow(BlorkError);
		expect(() => add("", func, "func")).toThrow(BlorkError);
		expect(() => add("name_name", func, "func")).toThrow(BlorkError);
		expect(() => add("UPPER", func, "func")).toThrow(BlorkError);
		expect(() => add("UPPER", func, "func")).toThrow(/add\(\):/);
		expect(() => add("UPPER", func, "func")).toThrow(/name:/);
		expect(() => add("UPPER", func, "func")).toThrow(/kebab-case/);
		expect(() => add("UPPER", func, "func")).toThrow(/"UPPER"/);
	});
	test("Throw BlorkError if passing a non-function", () => {
		expect(() => add("dc63b8", true)).toThrow(BlorkError);
		expect(() => add("dc63b8", true)).toThrow(/add\(\):/);
		expect(() => add("dc63b8", true)).toThrow(/checker:/);
		expect(() => add("dc63b8", true)).toThrow(/function/);
		expect(() => add("dc63b8", true)).toThrow(/true/);
	});
	test("Throw BlorkError if same name as existing", () => {
		const func = () => {};
		add("b89441", func, "samename");
		expect(() => add("b89441", func)).toThrow(BlorkError);
		expect(() => add("b89441", func)).toThrow(/add\(\):/);
		expect(() => add("b89441", func)).toThrow(/name:/);
		expect(() => add("b89441", func)).toThrow(/exists/);
		expect(() => add("b89441", func)).toThrow(/"b89441"/);
	});
});
