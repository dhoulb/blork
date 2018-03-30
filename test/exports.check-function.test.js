const { check } = require("../lib/exports");

// Tests.
describe("exports.check() function/constructor types", () => {
	test("Constructor types pass correctly", () => {
		expect(check(true, Boolean)).toBe(undefined);
		expect(check(1, Number)).toBe(undefined);
		expect(check("a", String)).toBe(undefined);
		expect(check({}, Object)).toBe(undefined);
		expect(check([], Array)).toBe(undefined);
		expect(check(Promise.resolve(true), Promise)).toBe(undefined);
	});
	test("Constructor types fail correctly", () => {
		expect(() => check(1, Boolean)).toThrow(TypeError);
		expect(() => check("a", Number)).toThrow(TypeError);
		expect(() => check(null, String)).toThrow(TypeError);
		expect(() => check("a", Object)).toThrow(TypeError);
		expect(() => check({}, Array)).toThrow(TypeError);
		expect(() => check({}, Promise)).toThrow(TypeError);
		expect(() => check(1, Boolean)).toThrow(/Must be true or false/);
		expect(() => check("a", Number)).toThrow(/Must be finite number/);
		expect(() => check(null, String)).toThrow(/Must be string/);
		expect(() => check("a", Object)).toThrow(/Must be instance of Object/);
		expect(() => check({}, Array)).toThrow(/Must be instance of Array/);
		expect(() => check({}, Promise)).toThrow(/Must be instance of Promise/);
	});
	test("Object constructor type checks using instanceof so allows _any_ object", () => {
		expect(check([], Object)).toBe(undefined);
		expect(check(function() {}, Object)).toBe(undefined);
		expect(check(new class Dog {}(), Object)).toBe(undefined);
	});
	test("Object constructor type does not allow null", () => {
		expect(() => check(null, Object)).toThrow(TypeError);
	});
	test("Array constructor type checks using instanceof so allows _any_ array", () => {
		expect(check(new class MyArray extends Array {}(), Array)).toBe(undefined);
	});
	test("Custom constructor types pass correctly", () => {
		class MyClass {}
		const myClass = new MyClass();
		expect(check(myClass, MyClass)).toBe(undefined);
		class MySubClass extends MyClass {}
		const mySubClass = new MySubClass();
		expect(check(mySubClass, MyClass)).toBe(undefined);
	});
	test("Custom constructor checks fail correctly", () => {
		class MyClass {}
		class MyOtherClass {}
		const myClass = new MyClass();
		expect(() => check(myClass, MyOtherClass)).toThrow(TypeError);
		expect(() => check(myClass, MyOtherClass)).toThrow(/Must be instance of MyOtherClass/);
		expect(() => check(myClass, class {})).toThrow(TypeError);
		expect(() => check(myClass, class {})).toThrow(/Must be instance of anonymous class/);
		expect(() => check(myClass, function() {})).toThrow(TypeError);
		expect(() => check(myClass, function() {})).toThrow(/Must be instance of anonymous class/);
	});
});
