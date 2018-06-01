const BlorkError = require("../lib/errors/BlorkError");
const { check } = require("../lib/exports");

// Tests.
/* eslint-disable prettier/prettier */
describe("exports.check() string types", () => {
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
	describe("Optional types", () => {
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
		test("Optional types have correct error message", () => {
			expect(() => check(true, "string?")).toThrow(/Must be string or empty/);
			expect(() => check("abc", "boolean?")).toThrow(/Must be true or false or empty/);
		});
	});
	describe("Invert types", () => {
		test("Invert types pass correctly", () => {
			expect(check("abc", "!number")).toBe(undefined);
			expect(check(123, "!string")).toBe(undefined);
			expect(check([], "!object")).toBe(undefined);
			expect(check(NaN, "!number")).toBe(undefined);
			expect(check(123, "!string")).toBe(undefined);
			expect(check({}, "!array")).toBe(undefined);
		});
		test("Invert types fail correctly", () => {
			expect(() => check("abc", "!string")).toThrow(TypeError);
			expect(() => check(123, "!num")).toThrow(TypeError);
			expect(() => check({}, "!object")).toThrow(TypeError);
		});
		test("Invert types have correct error message", () => {
			expect(() => check("abc", "!string")).toThrow(/Must be anything except string/);
			expect(() => check(true, "!boolean")).toThrow(/Must be anything except true or false/);
		});
	});
	describe("Non-empty types", () => {
		test("Non-empty types pass correctly", () => {
			expect(check("a", "string+")).toBe(undefined);
			expect(check("a", "str+")).toBe(undefined);
			expect(check("a", "lower+")).toBe(undefined);
			expect(check("A", "upper+")).toBe(undefined);
			expect(check({ a: 1 }, "object+")).toBe(undefined);
			expect(check({ a: 1 }, "obj+")).toBe(undefined);
			expect(check([1], "array+")).toBe(undefined);
			expect(check([1], "arr+")).toBe(undefined);
			expect(check(new Map([[1, 1]]), "map+")).toBe(undefined);
			expect(check(new Set([1]), "set+")).toBe(undefined);
			expect(check(true, "bool+")).toBe(undefined); // Not relevant.
			expect(check(123, "number+")).toBe(undefined); // Not relevant.
		});
		test("Non-empty types fail correctly", () => {
			expect(() => check("", "string+")).toThrow(TypeError);
			expect(() => check("", "str+")).toThrow(TypeError);
			expect(() => check("A", "lower+")).toThrow(TypeError);
			expect(() => check("a", "upper+")).toThrow(TypeError);
			expect(() => check({}, "object+")).toThrow(TypeError);
			expect(() => check({}, "obj+")).toThrow(TypeError);
			expect(() => check([], "array+")).toThrow(TypeError);
			expect(() => check([], "arr+")).toThrow(TypeError);
			expect(() => check(new Map(), "map+")).toThrow(TypeError);
			expect(() => check(new Set(), "set+")).toThrow(TypeError);
			expect(() => check(false, "bool+")).toThrow(TypeError); // Not relevant.
			expect(() => check(0, "number+")).toThrow(TypeError); // Not relevant.
		});
	});
	describe("Array types", () => {
		test("Array types pass correctly", () => {
			expect(check([1, 2, 3], "num[]")).toBe(undefined);
			expect(check(["a", "b"], "lower[]")).toBe(undefined);
			expect(check([true, false], "bool[]")).toBe(undefined);
		});
		test("Array types fail correctly", () => {
			expect(() => check(true, "num[]")).toThrow(TypeError);
			expect(() => check(false, "num[]")).toThrow(TypeError);
			expect(() => check([1, 2, "c"], "num[]")).toThrow(TypeError);
			expect(() => check(["a", "b", 3], "str[]")).toThrow(TypeError);
			expect(() => check([], "str[]+")).toThrow(TypeError);
			expect(() => check(["a", "b", ""], "str+[]")).toThrow(TypeError);
		});
		test("Array types have correct error message", () => {
			expect(() => check(true, "str[]")).toThrow(/Must be plain array containing: string/);
			expect(() => check([], "str[]+")).toThrow(/Must be non-empty plain array containing: string/);
			expect(() => check(["a", "b", ""], "str+[]")).toThrow(/Must be plain array containing: non-empty string/);
		});
	});
	describe("Tuple types", () => {
		test('Tuple types pass correctly', () => {
			expect(check(["abc"], "[str]")).toBe(undefined);
			expect(check([123], "[num]")).toBe(undefined);
			expect(check([123, "abc", true], "[num, str, bool]")).toBe(undefined);
		});
		test('Tuple types fail correctly', () => {
			expect(() => check([123, 123, false], "[num, num, num]")).toThrow(TypeError);
			expect(() => check([123, 123], "[num, num, num]")).toThrow(TypeError); // Too few.
			expect(() => check([123, 123, 123, 123], "[num, num, num]")).toThrow(TypeError); // Too many.
			expect(() => check(true, "[num]")).toThrow(TypeError); // Not an array.
		});
	});
	describe("Object types", () => {
		test("Object types pass correctly", () => {
			expect(check({ a: 1, b: 2, c: 3 }, "{num}")).toBe(undefined);
			expect(check({ a: "A", b: "A" }, "{ upper }")).toBe(undefined);
			expect(check({ aaAA: true, bbBB: false }, "{ camel: bool }")).toBe(undefined);
			expect(check({ "aa-aa": true, "bb-bb": false }, "{ slug: bool }")).toBe(undefined);
			expect(check({ a: 123, b: false }, "{ bool | num }")).toBe(undefined);
			expect(check({ aaa: 123, BBB: false }, "{ lower|upper: bool|num }")).toBe(undefined);
		});
		test("Object types fail correctly", () => {
			expect(() => check(true, "{num}")).toThrow(TypeError);
			expect(() => check(false, "{num}")).toThrow(TypeError);
			expect(() => check([1, 2, 3], "{ num }")).toThrow(TypeError);
			expect(() => check({ aaAA: true, bbBB: false }, "{ kebab: bool }")).toThrow(TypeError);
			expect(() => check({ "aa-aa": true, "bb-bb": false }, "{ camel: bool }")).toThrow(TypeError);
		});
		test("Object types have correct error message", () => {
			expect(() => check(true, "{int}")).toThrow(/Must be plain object containing: integer/);
			expect(() => check({ "ABC": true }, "{ upper: int }")).toThrow(/Must be plain object with UPPERCASE string keys containing: integer/);
		});
	});
	describe("Combined types", () => {
		test("AND combined types pass correctly", () => {
			expect(check(1, "number & integer")).toBe(undefined);
			expect(check(1, "num & +int")).toBe(undefined);
			expect(check("abc", "str & lower+")).toBe(undefined);
			expect(check("ABC", "str & upper+")).toBe(undefined);
		});
		test("AND combined types fail correctly", () => {
			expect(() => check("a", "number & string")).toThrow(TypeError);
			expect(() => check("a", "number & string")).toThrow(/Must be finite number and string/);
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
			expect(() => check(1, "string & string | string")).toThrow(/string and string or string/);
			expect(() => check(1, "string | string & string")).toThrow(/string or string and string/);
		});
	});
	describe('Grouped types', () => {
		test('Grouped types pass correctly', () => {
			expect(check("a", "(str | num)")).toBe(undefined);
			expect(check(123, "(str | num)")).toBe(undefined);
			expect(check("A", "(str & upper) | (num & int)")).toBe(undefined);
			expect(check(123, "(str & upper) | (num & int)")).toBe(undefined);
			expect(check([1, "a"], "(str | num)[]")).toBe(undefined);
			expect(check({ a: 1, b: "b" }, "{(str|num)}")).toBe(undefined);
			expect(check({ a: 1, b: "b" }, "({str|num})")).toBe(undefined);
		});
		test('Grouped types fail correctly', () => {
			expect(() => check(true, "(str | num)")).toThrow(TypeError);
			expect(() => check(true, "(str & upper) | (num & int)")).toThrow(TypeError);
			expect(() => check([1, "a", true], "(str | num)[]")).toThrow(TypeError);
		});
		test('Grouped types have correct error message', () => {
			expect(() => check(true, "(str | num)")).toThrow(/string or finite number/);
			expect(() => check(true, "(str & upper) | (num & int)")).toThrow(/Must be string and UPPERCASE string or finite number and integer/);
			expect(() => check([1, "a", true], "(str | num)[]")).toThrow(/Must be plain array containing: string or finite number/);
			expect(() => check([1, "a", true], "!(str | num)[]")).toThrow(/Must be plain array containing: anything except string or finite number/);
		});
		test('Grouping parentheses cannot be nested', () => {
			expect(() => check(true, "((string))")).toThrow(BlorkError);
			expect(() => check(true, "((string))")).toThrow(/nested/);
			expect(() => check(true, "(num | (string))")).toThrow(BlorkError);
			expect(() => check(true, "(num | (string) | num)")).toThrow(BlorkError);
		});
	});
});
