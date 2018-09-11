const { check } = require("../../lib/exports");

describe("Tuple types", () => {
	test("Tuple types pass correctly", () => {
		expect(check(["abc"], "[str]")).toBe(undefined);
		expect(check([123], "[num]")).toBe(undefined);
		expect(check([123, "abc", true], "[num, str, bool]")).toBe(undefined);
	});
	test("Tuple types fail correctly", () => {
		expect(() => check([123, 123, false], "[num, num, num]")).toThrow(TypeError);
		expect(() => check([123, 123], "[num, num, num]")).toThrow(TypeError); // Too few.
		expect(() => check([123, 123, 123, 123], "[num, num, num]")).toThrow(TypeError); // Too many.
		expect(() => check(true, "[num]")).toThrow(TypeError); // Not an array.
	});
	test("Correct error message", () => {
		expect(() => check(true, "[num, str]")).toThrow(/Must be plain array tuple like \[finite number, string\]/);
	});
});
