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
});
