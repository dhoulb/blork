const { check } = require("../../lib/exports");

describe("Combined types", () => {
	test("OR combined types pass correctly", () => {
		expect(check(1, "number|string")).toBe(undefined);
		expect(check("a", "number|string")).toBe(undefined);
		expect(check("ABC", "string | lower+")).toBe(undefined);
		expect(check(null, "string | number | null")).toBe(undefined);
	});
	test("OR combined types fail correctly", () => {
		expect(() => check(true, "number|string")).toThrow(TypeError);
		expect(() => check(Symbol(), "number|string")).toThrow(TypeError);
		expect(() => check(Symbol(), "number|string")).toThrow(/Must be finite number or string/);
	});
});
