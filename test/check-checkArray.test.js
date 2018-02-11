const BlorkError = require("../lib/BlorkError");
const { check } = require("../lib/exports");

// Tests.
describe("checkArray() value", () => {
	test("Throw TypeError if value is not array", () => {
		expect(() => check({ a: 123 }, [String])).toThrow(TypeError);
	});
	test("Throw TypeError if value is not plain array", () => {
		class MyArray extends Array {}
		const arr = new MyArray();
		arr.push("abc");
		expect(() => check(arr, [String])).toThrow(TypeError);
	});
	test("Array literal types pass correctly", () => {
		expect(check([1, 2, 3], [Number])).toBe(3);
		expect(check([1, 2, 3], ["num"])).toBe(3);
		expect(check([1, undefined, 3], ["num?"])).toBe(2); // Arrays don't count undefined optional values.
	});
	test("Array literal types fail correctly", () => {
		expect(() => check([1, 2, "surprisestring"], [Number])).toThrow(TypeError);
	});
	test("Array tuples pass correctly", () => {
		expect(check([1, 2, 3], [Number, Number, Number])).toBe(3);
		expect(check([1, 2, 3], ["num", "num", "num"])).toBe(3);
		expect(check([1, undefined, 3], ["num?", "num?", "num?"])).toBe(2); // Arrays don't count undefined optional values.
	});
	test("Array tuples fail correctly", () => {
		expect(() => check([1, 1], [Number, String])).toThrow(TypeError);
		expect(() => check([1, "b", "excessitem"], [Number, String])).toThrow(TypeError);
	});
	test("Array value with circular reference passes correctly", () => {
		const value = [];
		value.push(value);
		expect(check(value, [[Array]])).toBe(1);
	});
	test("Throw BlorkError when array type contains circular references", () => {
		const type = [];
		type.push(type);
		expect(() => check([[]], type)).toThrow(BlorkError);
	});
});
