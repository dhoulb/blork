const BlorkError = require("../lib/BlorkError");
const { check } = require("../lib/exports");

// Tests.
describe("checkString()", () => {
	test("String types pass correctly", () => {
		expect(check(1, "num")).toBe(1);
		expect(check(1, "number")).toBe(1);
		expect(check("a", "str")).toBe(1);
		expect(check("a", "string")).toBe(1);
	});
	test("Throw BlorkError if string type does not exist", () => {
		expect(() => check(1, "checkerthatdoesnotexist")).toThrow(BlorkError);
	});
	test("Optional types pass correctly", () => {
		expect(check(1, "number?")).toBe(1);
		expect(check("a", "string?")).toBe(1);
		expect(check({}, "object?")).toBe(1);
		expect(check(undefined, "number?")).toBe(0);
		expect(check(undefined, "string?")).toBe(0);
		expect(check(undefined, "object?")).toBe(0);
	});
	test("Optional types fail correctly", () => {
		expect(() => check("a", "number?")).toThrow(TypeError);
		expect(() => check(1, "string?")).toThrow(TypeError);
		expect(() => check(1, "object?")).toThrow(TypeError);
	});
	test("AND combined types pass correctly", () => {
		expect(check(1, "number & integer")).toBe(1);
		expect(check(1, "num & int+")).toBe(1);
		expect(check("abc", "str & lower+")).toBe(1);
		expect(check("ABC", "str & upper+")).toBe(1);
	});
	test("AND combined types fail correctly", () => {
		expect(() => check("a", "number")).toThrow(TypeError);
	});
	test("OR combined types pass correctly", () => {
		expect(check(1, "number|string")).toBe(1);
		expect(check("a", "number|string")).toBe(1);
		expect(check("ABC", "string | lower+")).toBe(1);
		expect(check(null, "string | number | null")).toBe(1);
	});
	test("OR combined types fail correctly", () => {
		expect(() => check(true, "number|string")).toThrow(TypeError);
		expect(() => check(Symbol(), "number|string")).toThrow(TypeError);
	});
	test("AND and OR combined types combine correctly", () => {
		// `&` has higher precedence than `|`
		expect(check("abc", "string & lower | upper")).toBe(1);
		expect(check("ABC", "string & lower | upper")).toBe(1);
		expect(() => check("ABCabc", "string & lower | upper")).toThrow(TypeError);
		expect(check("abc", "lower | upper & string")).toBe(1);
		expect(check("ABC", "lower | upper & string")).toBe(1);
		expect(() => check("ABCabc", "lower | upper & string")).toThrow(TypeError);
	});
});
