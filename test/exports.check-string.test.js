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
		test("Correct error message", () => {
			expect(() => check(true, "string?")).toThrow(/Must be string or empty/);
			expect(() => check("abc", "boolean?")).toThrow(/Must be boolean or empty/);
			expect(() => check([true], "string?[]")).toThrow(/Must be plain array containing \(string or empty\)/);
			expect(() => check([true], "(str | int)?")).toThrow(/Must be \(string or integer\) or empty/);
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
		test("Correct error message", () => {
			expect(() => check("abc", "!string")).toThrow(/Must be anything except string/);
			expect(() => check(true, "!boolean")).toThrow(/Must be anything except boolean/);
			expect(() => check("abc", "!str+")).toThrow(/Must be anything except non-empty string/);
			expect(() => check(123, "!(int | str)")).toThrow(/Must be anything except \(integer or string\)/);
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
		test("Correct error message", () => {
			expect(() => check(true, "str+")).toThrow(/Must be non-empty string/);
			expect(() => check([], "arr+")).toThrow(/Must be non-empty plain array/);
		});
	});
	describe("Size types", () => {
		describe("Exact size types", () => {
			test("Size types pass correctly", () => {
				expect(check("a", "string{1}")).toBe(undefined);
				expect(check("aaaa", "lower{4}")).toBe(undefined);
				expect(check("AAAAA", "upper{5}")).toBe(undefined);
				expect(check({ a: 1, b: 2 }, "obj{2}")).toBe(undefined);
				expect(check([1, "b", true], "array{3}")).toBe(undefined);
				expect(check(new Map([[1, 1], [2, 2]]), "map{2}")).toBe(undefined);
				expect(check(new Set([1, 2, "c", 4]), "set{4}")).toBe(undefined);
				expect(check(123, "number{123}")).toBe(undefined);
			});
			test("Size types fail correctly", () => {
				expect(() => check("", "string{1}")).toThrow(TypeError);
				expect(() => check("aa", "string{1}")).toThrow(TypeError);
				expect(() => check("aaa", "lower{4}")).toThrow(TypeError);
				expect(() => check("aaaaa", "lower{4}")).toThrow(TypeError);
				expect(() => check("AAAA", "lower{4}")).toThrow(TypeError);
				expect(() => check({ a: 1 }, "obj{2}")).toThrow(TypeError);
				expect(() => check({ a: 1, b: 2, c: 3 }, "obj{2}")).toThrow(TypeError);
				expect(() => check([1, "b"], "array{3}")).toThrow(TypeError);
				expect(() => check([1, "b", 3, 4], "array{3}")).toThrow(TypeError);
				expect(() => check(new Map([[1, 1]]), "map{2}")).toThrow(TypeError);
				expect(() => check(new Map([[1, 1], [2, 2], [3, 3]]), "map{2}")).toThrow(TypeError);
				expect(() => check(new Set([1, 2, 3]), "set{4}")).toThrow(TypeError);
				expect(() => check(new Set([1, 2, 3, 4, 5]), "set{4}")).toThrow(TypeError);
				expect(() => check(122, "number{123}")).toThrow(TypeError);
				expect(() => check(124, "number{123}")).toThrow(TypeError);
			});
			test("Correct error message", () => {
				expect(() => check("a", "str{10}")).toThrow(/Must be string with size 10/);
				expect(() => check(1, "int{12}")).toThrow(/Must be integer with size 12/);
			});
		});
		describe("Minimum size types", () => {
			test("Size types pass correctly", () => {
				expect(check("a", "string{1,}")).toBe(undefined);
				expect(check("aa", "string{1,}")).toBe(undefined);
				expect(check("aaaaaaaa", "lower{4,}")).toBe(undefined);
				expect(check("AAAAA", "upper{5,}")).toBe(undefined);
				expect(check({ a: 1, b: 2, c: 3 }, "obj{2,}")).toBe(undefined);
				expect(check([1, "b", true, 4], "array{3,}")).toBe(undefined);
				expect(check(new Map([[1, 1], [2, 2]]), "map{1,}")).toBe(undefined);
				expect(check(new Set([1, 2, "c", 4]), "set{4,}")).toBe(undefined);
				expect(check(124, "number{123,}")).toBe(undefined);
			});
			test("Size types fail correctly", () => {
				expect(() => check("", "string{1,}")).toThrow(TypeError);
				expect(() => check("aaa", "lower{4,}")).toThrow(TypeError);
				expect(() => check("AAAAA", "lower{4,}")).toThrow(TypeError);
				expect(() => check({ a: 1 }, "obj{2,}")).toThrow(TypeError);
				expect(() => check([1, "b"], "array{3,}")).toThrow(TypeError);
				expect(() => check(new Map([]), "map{1,}")).toThrow(TypeError);
				expect(() => check(new Set([1, 2]), "set{4,}")).toThrow(TypeError);
				expect(() => check(122, "number{123,}")).toThrow(TypeError);
			});
			test("Correct error message", () => {
				expect(() => check("a", "str{10,}")).toThrow(/Must be string with minimum size 10/);
				expect(() => check(1, "int{12,}")).toThrow(/Must be integer with minimum size 12/);
			});
		});
		describe("Maximum size types", () => {
			test("Size types pass correctly", () => {
				expect(check("a", "string{,2}")).toBe(undefined);
				expect(check("aa", "string{,2}")).toBe(undefined);
				expect(check("aaaaaaaa", "lower{,12}")).toBe(undefined);
				expect(check("AAAAA", "upper{,5}")).toBe(undefined);
				expect(check({ a: 1, b: 2, c: 3 }, "obj{,3}")).toBe(undefined);
				expect(check([1, "b", true, 4], "array{,4}")).toBe(undefined);
				expect(check(new Map([[1, 1], [2, 2]]), "map{,2}")).toBe(undefined);
				expect(check(new Set([1, 2, "c", 4]), "set{,4}")).toBe(undefined);
				expect(check(124, "number{,124}")).toBe(undefined);
			});
			test("Size types fail correctly", () => {
				expect(() => check("aa", "string{,1}")).toThrow(TypeError);
				expect(() => check("aaaaa", "lower{,4}")).toThrow(TypeError);
				expect(() => check("AAAA", "lower{,4}")).toThrow(TypeError);
				expect(() => check({ a: 1, b: 2, c: 3 }, "obj{,2}")).toThrow(TypeError);
				expect(() => check([1, "b", 3, 4], "array{,3}")).toThrow(TypeError);
				expect(() => check(new Map([["a", 1]]), "map{,0}")).toThrow(TypeError);
				expect(() => check(new Set([1, 2, 3, 4, 5]), "set{,4}")).toThrow(TypeError);
				expect(() => check(122, "number{,121}")).toThrow(TypeError);
			});
			test("Correct error message", () => {
				expect(() => check("abcdefgh", "str{,6}")).toThrow(/Must be string with maximum size 6/);
				expect(() => check(123456789, "int{,12}")).toThrow(/Must be integer with maximum size 12/);
			});
		});
		describe("Minimum and maximum size types", () => {
			test("Size types pass correctly", () => {
				expect(check("a", "string{1,2}")).toBe(undefined);
				expect(check("aa", "string{1,2}")).toBe(undefined);
				expect(check("aaaaa", "lower{4,6}")).toBe(undefined);
				expect(check("AAAAA", "upper{5,6}")).toBe(undefined);
				expect(check({ a: 1, b: 2, c: 3 }, "obj{2,6}")).toBe(undefined);
				expect(check([1, "b", true, 4], "array{3,6}")).toBe(undefined);
				expect(check(new Map([[1, 1], [2, 2]]), "map{1,6}")).toBe(undefined);
				expect(check(new Set([1, 2, "c", 4]), "set{4,6}")).toBe(undefined);
				expect(check(124, "number{123,125}")).toBe(undefined);
			});
			test("Size types fail correctly", () => {
				expect(() => check("", "string{1,2}")).toThrow(TypeError);
				expect(() => check("aaa", "string{1,2}")).toThrow(TypeError);
				expect(() => check("aaa", "lower{4,6}")).toThrow(TypeError);
				expect(() => check("AAAAA", "lower{4,6}")).toThrow(TypeError);
				expect(() => check({ a: 1 }, "obj{2,3}")).toThrow(TypeError);
				expect(() => check({ a: 1, b: 2, c: 3, d: 4 }, "obj{2,3}")).toThrow(TypeError);
				expect(() => check([1, "b"], "array{3,4}")).toThrow(TypeError);
				expect(() => check([1, "b", 3, 4, 5], "array{3,4}")).toThrow(TypeError);
				expect(() => check(new Map([["a", 2]]), "map{2,3}")).toThrow(TypeError);
				expect(() => check(new Map([["a", 2], ["b", 3], ["c", 4], ["d", 5]]), "map{2,3}")).toThrow(TypeError);
				expect(() => check(new Set([1]), "set{2,3}")).toThrow(TypeError);
				expect(() => check(new Set([1, 2, 3, 4]), "set{2,3}")).toThrow(TypeError);
				expect(() => check(122, "number{123,125}")).toThrow(TypeError);
				expect(() => check(126, "number{123,125}")).toThrow(TypeError);
			});
			test("Correct error message", () => {
				expect(() => check("abcdefgh", "str{3,6}")).toThrow(/Must be string with size between 3 and 6/);
				expect(() => check(1, "int{2,12}")).toThrow(/Must be integer with size between 2 and 12/);
			});
		});
		test("Other values (boolean, symbol) are not valid", () => {
			expect(() => check(true, "boolean{1,1}")).toThrow(TypeError);
		});
		test("Not valid without at least minimum or maximum", () => {
			expect(() => check(126, "number{}")).toThrow(BlorkError);
			expect(() => check(126, "number{,}")).toThrow(BlorkError);
			expect(() => check(126, "number{a,}")).toThrow(BlorkError);
			expect(() => check(126, "number{,b}")).toThrow(BlorkError);
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
		test("Correct error message", () => {
			expect(() => check(true, "str[]")).toThrow(/Must be plain array containing string/);
			expect(() => check([], "str[]+")).toThrow(/Must be non-empty plain array containing string/);
			expect(() => check([], "str[]+|null")).toThrow(/Must be \(non-empty plain array containing string\) or null/);
			expect(() => check(["a", "b", ""], "str+[]")).toThrow(/Must be plain array containing non-empty string/);
			expect(() => check(["a", "b", ""], "(str+|arr+)[]")).toThrow(/Must be plain array containing \(\(non-empty string\) or \(non-empty plain array\)\)/);
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
		test("Correct error message", () => {
			expect(() => check(true, "[num, str]")).toThrow(/Must be plain array tuple containing finite number, string/);
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
		test("Correct error message", () => {
			expect(() => check(true, "{int}")).toThrow(/Must be plain object containing integer/);
			expect(() => check({ "ABC": true }, "{ upper: int }")).toThrow(/Must be plain object with UPPERCASE string keys containing integer/);
			expect(() => check({ "ABC": true }, "{ upper: int | str }")).toThrow(/Must be plain object with UPPERCASE string keys containing \(integer or string\)/);
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
			expect(() => check(Symbol(), "number|string")).toThrow(/Must be finite number or string/);
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
		test("Correct error message", () => {
			expect(() => check(1, "string & string | string")).toThrow(/Must be string and \(string or string\)/);
			expect(() => check(1, "string | string & string")).toThrow(/Must be \(string or string\) and string/);
			expect(() => check(1, "{ string } | null")).toThrow(/Must be \(plain object containing string\) or null/);
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
		test('Correct error message', () => {
			expect(() => check(true, "(str | num)")).toThrow(/Must be string or finite number/);
			expect(() => check(true, "(str & upper) | (num & int)")).toThrow(/Must be \(string and UPPERCASE string\) or \(finite number and integer\)/);
			expect(() => check([1, "a", true], "(str | num)[]")).toThrow(/Must be plain array containing \(string or finite number\)/);
			expect(() => check([1, "a", true], "!(str | num)[]")).toThrow(/Must be plain array containing anything except \(string or finite number\)/);
			expect(() => check([1, "a", true], "(!str | num)[]")).toThrow(/Must be plain array containing \(\(anything except string\) or finite number\)/);
		});
		test('Grouping parentheses cannot be nested', () => {
			expect(() => check(true, "((string))")).toThrow(BlorkError);
			expect(() => check(true, "((string))")).toThrow(/nested/);
			expect(() => check(true, "(num | (string))")).toThrow(BlorkError);
			expect(() => check(true, "(num | (string) | num)")).toThrow(BlorkError);
		});
	});
});
