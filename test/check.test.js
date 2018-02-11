const BlorkError = require("../lib/BlorkError");
const { check } = require("../lib/exports");

// Tests.
describe("check()", () => {
	test("Throw BlorkError if type is not object, function, string, or one of our known types", () => {
		expect(() => check(1, 123)).toThrow(BlorkError);
	});
	test("Literal types true, false, null, and undefined all work correctly", () => {
		expect(check(true, true)).toBe(1);
		expect(check(false, false)).toBe(1);
		expect(check(null, null)).toBe(1);
		expect(check(undefined, undefined)).toBe(1);
	});
	test("Do not throw error if passing string name", () => {
		expect(check(true, "bool", "myValue")).toBe(1);
		expect(check(true, Boolean, "myValue")).toBe(1);
		expect(check([true], ["bool"], "myValue")).toBe(1);
		expect(check({ bool: true }, { bool: "bool" }, "myValue")).toBe(1);
	});
	test("Throw BlorkError if passing non-string name", () => {
		expect(() => check(1, "bool", 123)).toThrow(BlorkError);
	});
});
