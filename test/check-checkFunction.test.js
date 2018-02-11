const { check } = require("../lib/exports");

// Tests.
describe("checkFunction()", () => {
	test("Constructor types pass correctly", () => {
		expect(check(true, Boolean)).toBe(1);
		expect(check(1, Number)).toBe(1);
		expect(check("a", String)).toBe(1);
		expect(check({}, Object)).toBe(1);
		expect(check([], Array)).toBe(1);
		expect(check(Promise.resolve(true), Promise)).toBe(1);
	});
	test("Constructor types fail correctly", () => {
		expect(() => check(1, Boolean)).toThrow(TypeError);
		expect(() => check("a", Number)).toThrow(TypeError);
		expect(() => check(null, String)).toThrow(TypeError);
		expect(() => check("a", Object)).toThrow(TypeError);
		expect(() => check({}, Array)).toThrow(TypeError);
		expect(() => check({}, Promise)).toThrow(TypeError);
		expect(() => check(1, Boolean)).toThrow(/Must be true or false/);
		expect(() => check("a", Number)).toThrow(/Must be a finite number/);
		expect(() => check(null, String)).toThrow(/Must be a string/);
		expect(() => check("a", Object)).toThrow(/Must be an instance of Object/);
		expect(() => check({}, Array)).toThrow(/Must be an instance of Array/);
		expect(() => check({}, Promise)).toThrow(/Must be an instance of Promise/);
	});
	test("Object constructor type checks using instanceof so allows _any_ object", () => {
		expect(check([], Object)).toBe(1);
		expect(check(function() {}, Object)).toBe(1);
		expect(check(new class Dog {}(), Object)).toBe(1);
	});
	test("Object constructor type does not allow null", () => {
		expect(() => check(null, Object)).toThrow(TypeError);
	});
	test("Array constructor type checks using instanceof so allows _any_ array", () => {
		expect(check(new class MyArray extends Array {}(), Array)).toBe(1);
	});
	test("Custom constructor types pass correctly", () => {
		class MyClass {}
		const myClass = new MyClass();
		expect(check(myClass, MyClass)).toBe(1);
		class MySubClass extends MyClass {}
		const mySubClass = new MySubClass();
		expect(check(mySubClass, MyClass)).toBe(1);
	});
	test("Custom constructor checks fail correctly", () => {
		class MyClass {}
		class MyOtherClass {}
		const myClass = new MyClass();
		expect(() => check(myClass, MyOtherClass)).toThrow(TypeError);
		expect(() => check(myClass, MyOtherClass)).toThrow(/Must be an instance of MyOtherClass/);
		expect(() => check(myClass, class {})).toThrow(TypeError);
		expect(() => check(myClass, class {})).toThrow(/Must be an instance of anonymous class/);
		expect(() => check(myClass, function() {})).toThrow(TypeError);
		expect(() => check(myClass, function() {})).toThrow(/Must be an instance of anonymous class/);
	});
});
