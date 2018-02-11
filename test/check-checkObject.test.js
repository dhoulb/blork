const BlorkError = require("../lib/BlorkError");
const { check, ANY } = require("../lib/exports");

// Tests.
describe("checkObject()", () => {
	test("Throw TypeError if value is not object", () => {
		expect(() => check(123, { "1": Number })).toThrow(TypeError);
	});
	test("Throw TypeError when value is not plain object", () => {
		const obj = new class Dog {}();
		expect(() => check(obj, "object")).toThrow(TypeError);
	});
	test("Object literal types pass correctly", () => {
		expect(check({ a: "a", b: 1 }, { a: "str", b: Number })).toBe(2);
		expect(check({ a: "a", b: undefined }, { a: "str", b: "num?" })).toBe(1); // Objects don't count undefined optional values.
	});
	test("Object literal types fail correctly", () => {
		expect(() => check({ a: "notnumberparam" }, { a: Number })).toThrow(TypeError);
	});
	test("Deep object literal types pass correctly", () => {
		expect(check({ a: "a", b: { bb: 22, bc: 23 } }, { a: "str", b: { bb: Number, bc: Number } })).toBe(2);
		expect(check({ a: "a", b: { bb: 22 } }, { a: "str", b: { bb: Number, bc: "num?" } })).toBe(2);
	});
	test("Object literal types ignore extra parameters", () => {
		expect(check({ a: "a", z: "extraparam" }, { a: String })).toBe(1); // Objects ignore extra params.
	});
	test("Object literal types with ANY property pass correctly", () => {
		expect(check({ a: 1, b: 1, c: 1 }, { a: "num", [ANY]: "num" })).toBe(3);
		expect(check({ a: "abc", b: "abc", c: "abc" }, { a: "str", [ANY]: "str" })).toBe(3);
		expect(check({ a: 1, b: 2, c: undefined }, { a: "num", [ANY]: "num?" })).toBe(2);
	});
	test("Object literal types with ANY property pass correctly when ANY isn't used", () => {
		expect(check({ a: "abc" }, { a: "str", [ANY]: "str" })).toBe(1);
	});
	test("Using undefined as any ", () => {
		expect(check({ a: "abc" }, { a: "str", [ANY]: "str" })).toBe(1);
	});
	test("Object literal types with ANY property fail correctly", () => {
		expect(() => check({ a: 1, b: 2, c: "c" }, { a: "num", [ANY]: "num" })).toThrow(TypeError);
	});
	test("Deep object literal types with ANY property pass correctly", () => {
		expect(check({ a: "a", b: { bb: 22, bc: 23 } }, { a: "str", b: { [ANY]: "num" } })).toBe(2);
	});
	test("Circular reference in value passes correctly", () => {
		const value = {};
		value.circular = value;
		expect(check(value, { circular: { circular: Object } })).toBe(1);
	});
	test("Throw BlorkError when type contains circular references", () => {
		const type = {};
		type.circular = type;
		expect(() => check({ circular: { circular: {} } }, type)).toThrow(BlorkError);
	});
});
