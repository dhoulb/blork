const BlorkError = require("../lib/errors/BlorkError");
const { check } = require("../lib/exports");

// Tests.
describe("exports.check() object types", () => {
	test("Throw TypeError if value is not object", () => {
		expect(() => check(123, { "1": Number })).toThrow(TypeError);
	});
	test("Throw TypeError when value is not plain object", () => {
		const obj = new class Dog {}();
		expect(() => check(obj, "object")).toThrow(TypeError);
	});
	test("Object literal types pass correctly", () => {
		expect(check({ a: "a", b: 1 }, { a: "str", b: Number })).toBe(undefined);
		expect(check({ a: "a", b: undefined }, { a: "str", b: "num?" })).toBe(undefined); // Objects don't count undefined optional values.
	});
	test("Object literal types fail correctly", () => {
		expect(() => check({ a: "notnumberparam" }, { a: Number })).toThrow(TypeError);
		expect(() => check({ a: "notnumberparam" }, { a: Number })).toThrow(/Must be finite number/);
		expect(() => check({ a: "notnumberparam" }, { a: Number })).toThrow(/notnumberparam/);
		// Must contain name of parameter.
		expect(() => check({ myparam: "notnumberparam" }, { myparam: Number })).toThrow(/myparam/);
		expect(() => check({ myparam: { mysubparam: "notnumberparam" } }, { myparam: { mysubparam: Number } })).toThrow(
			/mysubparam/
		);
	});
	test("Deep object literal types pass correctly", () => {
		expect(check({ a: "a", b: { bb: 22, bc: 23 } }, { a: "str", b: { bb: Number, bc: Number } })).toBe(undefined);
		expect(check({ a: "a", b: { bb: 22 } }, { a: "str", b: { bb: Number, bc: "num?" } })).toBe(undefined);
	});
	test("Object literal types ignore extra parameters", () => {
		expect(check({ a: "a", z: "extraparam" }, { a: String })).toBe(undefined); // Objects ignore extra params.
	});
	test("Object literal types with _any property pass correctly", () => {
		expect(check({ a: 1, b: 1, c: 1 }, { a: "num", _any: "num" })).toBe(undefined);
		expect(check({ a: "abc", b: "abc", c: "abc" }, { a: "str", _any: "str" })).toBe(undefined);
		expect(check({ a: 1, b: 2, c: undefined }, { a: "num", _any: "num?" })).toBe(undefined);
	});
	test("Object literal types with _any property pass correctly when _any isn't used", () => {
		expect(check({ a: "abc" }, { a: "str", _any: "str" })).toBe(undefined);
	});
	test("Using undefined as any ", () => {
		expect(check({ a: "abc" }, { a: "str", _any: "str" })).toBe(undefined);
	});
	test("Object literal types with _any property fail correctly", () => {
		expect(() => check({ a: 1, b: 2, c: "c" }, { a: "num", _any: "num" })).toThrow(TypeError);
	});
	test("Deep object literal types with _any property pass correctly", () => {
		expect(check({ a: "a", b: { bb: 22, bc: 23 } }, { a: "str", b: { _any: "num" } })).toBe(undefined);
	});
	test("No infinite loop when value contains circular references", () => {
		const value = {};
		value.c = value;
		expect(check(value, { c: { c: Object } })).toBe(undefined);
	});
	test("No infinite loop when value contains deep circular references", () => {
		const value = { c: { c: { c: {} } } };
		value.c.c.c.c = value;
		expect(check(value, { c: { c: { c: { c: { c: Object } } } } })).toBe(undefined);
	});
	test("Throw BlorkError when type contains circular references", () => {
		const type = {};
		type.c = type;
		expect(() => check({ c: { c: {} } }, type)).toThrow(BlorkError);
		expect(() => check({ c: { c: {} } }, type)).toThrow(/circular references/);
	});
	test("Throw BlorkError when type contains deep circular references", () => {
		const type = { c: { c: { c: {} } } };
		type.c = type;
		expect(() => check({ c: { c: { c: { c: { c: true } } } } }, type)).toThrow(BlorkError);
		expect(() => check({ c: { c: { c: { c: { c: true } } } } }, type)).toThrow(/circular references/);
	});
});
