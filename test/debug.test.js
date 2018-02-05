const { debug } = require("../lib/exports");

// Tests.
describe("debug()", () => {
	test("Return correct debug string for strings", () => {
		expect(debug("abc")).toBe('"abc"');
		expect(debug('a"b"c')).toBe('"a\\"b\\"c"');
	});
	test("Return correct debug string for numbers", () => {
		expect(debug(123)).toBe("123");
		expect(debug(NaN)).toBe("NaN");
		expect(debug(Infinity)).toBe("Infinity");
		expect(debug(-Infinity)).toBe("-Infinity");
	});
	test("Return correct debug string for primatives", () => {
		expect(debug(null)).toBe("null");
		expect(debug(undefined)).toBe("undefined");
		expect(debug(true)).toBe("true");
		expect(debug(false)).toBe("false");
	});
	test("Return correct debug string for regular expressions", () => {
		expect(debug(/abc/)).toBe("/abc/");
	});
	test("Return correct debug string for objects", () => {
		expect(debug({})).toBe("{}");
		expect(debug({ a: 1 })).toBe(`{
	"a": 1
}`);
	});
	test("Return correct debug string for arrays", () => {
		expect(debug([])).toBe("[]");
		expect(debug([1, 2, 3])).toBe(`[
	1,
	2,
	3
]`);
	});
	test("Return correct debug string for functions", () => {
		expect(debug(function() {})).toBe("anonymous function");
		expect(debug(function dog() {})).toBe("dog()");
	});
	test("Return correct debug string for class instances", () => {
		expect(debug(new class MyClass {}())).toBe("instance of MyClass");
		expect(debug(new class {}())).toBe("instance of anonymous class");
	});
	test("Return correct debug string for errors", () => {
		expect(debug(TypeError("My error message"))).toBe('TypeError "My error message"');
		expect(debug(new TypeError("My error message"))).toBe('TypeError "My error message"');
	});
	test("Return correct debug string for symbols", () => {
		expect(debug(Symbol("abc"))).toBe("Symbol(abc)");
	});
});
