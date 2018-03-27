const BlorkError = require("../lib/BlorkError");
const { check, add } = require("../lib/exports");

// Tests.
describe("add()", () => {
	test("Add and run a custom checker (with description)", () => {
		// Define a checker called 'isstring'.
		expect(add("isstring", v => typeof v === "string", "valid test checker")).toBeUndefined();

		// Check a passing value.
		expect(check("abc", "isstring")).toBe(undefined);

		// Check a failing value.
		expect(() => check(123, "isstring")).toThrow(TypeError);
		expect(() => check(123, "isstring")).toThrow(/valid test checker/); // Must contain description.
	});
	test("Add and run a custom checker (no description)", () => {
		// Define a checker called 'isnumber'.
		expect(add("isnumber", v => typeof v === "number")).toBeUndefined();

		// Check a passing value.
		expect(check(123, "isnumber")).toBe(undefined);

		// Check a failing value.
		expect(() => check("abc", "isnumber")).toThrow(TypeError);
		expect(() => check("abc", "isnumber")).toThrow(/isnumber/); // Must contain name.
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
