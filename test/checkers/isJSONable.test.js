const isJSONable = require("../../lib/checkers/isJSONable");

describe("isJSONable()", () => {
	test("Primatives are JSON friendly", () => {
		expect(isJSONable(true)).toBe(true);
		expect(isJSONable(false)).toBe(true);
		expect(isJSONable(null)).toBe(true);
		expect(isJSONable(123)).toBe(true);
		expect(isJSONable(-123)).toBe(true);
		expect(isJSONable(1.5)).toBe(true);
		expect(isJSONable(-1.5)).toBe(true);
		expect(isJSONable("")).toBe(true);
		expect(isJSONable("a")).toBe(true);
		expect(isJSONable("abc")).toBe(true);
	});
	test("Plain arrays are JSON friendly", () => {
		const arr = [1, 2, 3];
		expect(isJSONable(arr)).toBe(true);
	});
	test("Plain objects are JSON friendly", () => {
		const obj = { a: 1, b: 2, c: 3 };
		expect(isJSONable(obj)).toBe(true);
	});
	test("Deep plain arrays are JSON friendly", () => {
		const arr = [[1, 2, 3]];
		expect(isJSONable(arr)).toEqual(true);
	});
	test("Deep plain objects are JSON friendly", () => {
		const obj = { deep: { a: 1, b: 2, c: 3 } };
		expect(isJSONable(obj)).toEqual(true);
	});
	test("Undefined is not JSON friendly", () => {
		expect(isJSONable(undefined)).toBe(false);
	});
	test("Symbols is not JSON friendly", () => {
		expect(isJSONable(Symbol("abc"))).toBe(false);
	});
	test("Infinite numbers is not JSON friendly", () => {
		expect(isJSONable(Infinity)).toBe(false);
		expect(isJSONable(-Infinity)).toBe(false);
		expect(isJSONable(NaN)).toBe(false);
	});
	test("Complex objects is not JSON friendly", () => {
		expect(isJSONable({ complex: new class Something {}() })).toBe(false);
		expect(isJSONable({ arr: new class Megarray extends Array {}() })).toBe(false);
		expect(isJSONable({ str: new String("abc") })).toBe(false);
		expect(isJSONable({ date: new Date() })).toBe(false);
		expect(isJSONable({ func: () => {} })).toBe(false);
	});
	test("Circular references in objects are not JSON friendly", () => {
		const obj1 = {};
		obj1.circular = obj1;
		expect(isJSONable(obj1)).toBe(false);
		const obj2 = { sub: {} };
		obj2.sub.circular = obj2;
		expect(isJSONable(obj2)).toBe(false);
	});
	test("Circular references in arrays are not JSON friendly", () => {
		const arr1 = [];
		arr1[0] = arr1;
		expect(isJSONable(arr1)).toBe(false);
		const arr2 = [[]];
		arr2[0][0] = arr2;
		expect(isJSONable(arr2)).toBe(false);
	});
});
