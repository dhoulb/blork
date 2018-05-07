const BlorkError = require("../lib/errors/BlorkError");
const { check } = require("../lib/exports");

// Tests.
describe("exports.check() array types", () => {
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
		expect(check([1, 2, 3], [Number])).toBe(undefined);
		expect(check([1, 2, 3], ["num"])).toBe(undefined);
		expect(check([1, undefined, 3], ["num?"])).toBe(undefined); // Arrays don't count undefined optional values.
	});
	test("Array literal types fail correctly", () => {
		expect(() => check([1, 2, "surprisestring"], [Number])).toThrow(TypeError);
		expect(() => check([1, 2, "surprisestring"], [Number])).toThrow(/\[2\]:/);
		expect(() => check([1, 2, "surprisestring"], [Number])).toThrow(/number/);
		expect(() => check([1, 2, "surprisestring"], [Number])).toThrow(/surprisestring/);
	});
	test("Array tuples pass correctly", () => {
		expect(check([1, 2, 3], [Number, Number, Number])).toBe(undefined);
		expect(check([1, 2, 3], ["num", "num", "num"])).toBe(undefined);
		expect(check([1, undefined, 3], ["num?", "num?", "num?"])).toBe(undefined); // Arrays don't count undefined optional values.
	});
	test("Array tuples fail correctly with incorrect types", () => {
		expect(() => check([1, 1], [Number, String])).toThrow(TypeError);
	});
	test("Array tuples fail correctly with excess items", () => {
		expect(() => check([1, "b", "excessitem"], [Number, String])).toThrow(TypeError);
	});
	test("No infinite loop when value contains circular references", () => {
		const value = [];
		value.push(value);
		expect(check(value, [[Array]])).toBe(undefined);
	});
	test("No infinite loop when value contains deep circular references", () => {
		const value = [];
		value.push([[[[value]]]]);
		expect(check(value, [[[[[[Array]]]]]])).toBe(undefined);
	});
	test("Throw BlorkError when array type contains circular references", () => {
		const type = [];
		type.push(type);
		expect(() => check([[[]]], type)).toThrow(BlorkError);
		expect(() => check([[[]]], type)).toThrow(/circular references/);
	});
	test("Throw BlorkError when array type contains deep circular references", () => {
		const type = [];
		type.push([[[[type]]]]);
		expect(() => check([[[[[[[[[[]]]]]]]]]], type)).toThrow(BlorkError);
		expect(() => check([[[[[[[[[[]]]]]]]]]], type)).toThrow(/circular references/);
	});
});
