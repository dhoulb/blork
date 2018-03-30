const BlorkError = require("../lib/BlorkError");
const { check } = require("../lib/exports");

// Tests.
describe("checkString()", () => {
	test("String types pass correctly", () => {
		expect(check(1, "num")).toBe(undefined);
		expect(check(1, "number")).toBe(undefined);
		expect(check("a", "str")).toBe(undefined);
		expect(check("a", "string")).toBe(undefined);
	});
	test("Throw BlorkError if string type does not exist", () => {
		expect(() => check(1, "checkerthatdoesnotexist")).toThrow(BlorkError);
		// Must contain name of bad checker.
		expect(() => check(1, "checkerthatdoesnotexist")).toThrow(/checkerthatdoesnotexist/);
	});
	test("Optional types pass correctly", () => {
		expect(check(1, "number?")).toBe(undefined);
		expect(check("a", "string?")).toBe(undefined);
		expect(check({}, "object?")).toBe(undefined);
		expect(check(undefined, "number?")).toBe(undefined);
		expect(check(undefined, "string?")).toBe(undefined);
		expect(check(undefined, "object?")).toBe(undefined);
	});
	test("Optional types fail correctly", () => {
		expect(() => check("a", "number?")).toThrow(TypeError);
		expect(() => check(1, "string?")).toThrow(TypeError);
		expect(() => check(1, "object?")).toThrow(TypeError);
	});
	test("AND combined types pass correctly", () => {
		expect(check(1, "number & integer")).toBe(undefined);
		expect(check(1, "num & int+")).toBe(undefined);
		expect(check("abc", "str & lower+")).toBe(undefined);
		expect(check("ABC", "str & upper+")).toBe(undefined);
	});
	test("AND combined types fail correctly", () => {
		expect(() => check("a", "number & string")).toThrow(TypeError);
		expect(() => check("a", "number & string")).toThrow(/finite number and string/);
	});
	test("OR combined types pass correctly", () => {
		expect(check(1, "number|string")).toBe(undefined);
		expect(check("a", "number|string")).toBe(undefined);
		expect(check("ABC", "string | lower+")).toBe(undefined);
		expect(check(null, "string | number | null")).toBe(undefined);
	});
	test("OR combined types fail correctly", () => {
		expect(() => check(true, "number|string")).toThrow(TypeError);
		expect(() => check(Symbol(), "number|string")).toThrow(TypeError);
		expect(() => check(Symbol(), "number|string")).toThrow(/finite number or string/);
	});
	test("AND and OR combined types combine correctly", () => {
		// `&` has higher precedence than `|`
		expect(check("abc", "string & lower | upper")).toBe(undefined);
		expect(check("ABC", "string & lower | upper")).toBe(undefined);
		expect(() => check("ABCabc", "string & lower | upper")).toThrow(TypeError);
		expect(check("abc", "lower | upper & string")).toBe(undefined);
		expect(check("ABC", "lower | upper & string")).toBe(undefined);
		expect(() => check("ABCabc", "lower | upper & string")).toThrow(TypeError);
	});
	test("AND and OR combined types have correct error message", () => {
		expect(() => check("ABCabc", "string & lower | upper")).toThrow(
			/Must be string and lowercase string or uppercase string/
		);
		expect(() => check("ABCabc", "lower | upper & string")).toThrow(
			/Must be lowercase string or uppercase string and string/
		);
	});
	test("Optional types have correct error message", () => {
		expect(() => check(true, "string?")).toThrow(/Must be string or empty/);
		expect(() => check("abc", "boolean?")).toThrow(/Must be true or false or empty/);
	});
});
