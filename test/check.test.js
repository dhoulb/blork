const BlorkError = require("../lib/BlorkError");
const { check } = require("../lib/exports");

// Tests.
describe("check() value", () => {
	test("Pass correctly when object value contains circular references", () => {
		const value = {};
		value.circular = value;
		expect(check(value, { circular: { circular: Object } })).toBe(1);
	});
	test("Pass correctly when array value contains circular references", () => {
		const value = [];
		value.push(value);
		expect(check(value, [[Array]])).toBe(1);
	});
	test("Throw TypeError when object value is not plain object", () => {
		expect(check(new class {}(), Object)).toBe(1);
	});
	test("Object literal types pass correctly", () => {
		expect(check({ a: "a", b: 1 }, { a: "str", b: Number })).toBe(2);
		expect(check({ a: "a", z: "extraparam" }, { a: String })).toBe(1); // Objects ignore extra params.
		expect(check({ a: "a", b: undefined }, { a: "str", b: "num?" })).toBe(1); // Objects don't count undefined optional values.
	});
	test("Object literal types fail correctly", () => {
		expect(() => check({ a: "notnumberparam" }, { a: Number })).toThrow(TypeError);
	});
	test("Throw TypeError if value is not object (object literal format)", () => {
		expect(() => check(123, { "1": Number })).toThrow(TypeError);
	});
	test("Array literal types pass correctly", () => {
		expect(check([1, 2, 3], [Number])).toBe(3);
		expect(check([1, 2, 3], ["num"])).toBe(3);
		expect(check([1, undefined, 3], ["num?"])).toBe(2); // Arrays don't count undefined optional values.
	});
	test("Array literal types fail correctly", () => {
		expect(() => check([1, 2, "surprisestring"], [Number])).toThrow(TypeError);
	});
	test("Throw TypeError if value is not array (array literal format)", () => {
		expect(() => check({ a: 123 }, [String])).toThrow(TypeError);
	});
	test("Return correctly when checks pass (array tuple format)", () => {
		expect(check([1, 2, 3], [Number, Number, Number])).toBe(3);
		expect(check([1, 2, 3], ["num", "num", "num"])).toBe(3);
		expect(check([1, undefined, 3], ["num?", "num?", "num?"])).toBe(2); // Arrays don't count undefined optional values.
	});
	test("Throw TypeError when checks fail (array tuple format)", () => {
		expect(() => check([1, 1], [Number, String])).toThrow(TypeError);
		expect(() => check([1, "b", "excessitem"], [Number, String])).toThrow(TypeError);
	});
	test("Throw TypeError if value is not array (array tuple format)", () => {
		expect(() => check({ a: 123 }, [String])).toThrow(TypeError);
	});
});
describe("check() type", () => {
	test("Throw BlorkError if string type does not exist", () => {
		expect(() => check(1, "checkerthatdoesnotexist")).toThrow(BlorkError);
	});
	test("Throw BlorkError when array type contains circular references", () => {
		const type = [];
		type.push(type);
		expect(() => check([[]], type)).toThrow(BlorkError);
	});
	test("Throw BlorkError when object type contain circular references", () => {
		const type = {};
		type.circular = type;
		expect(() => check({ circular: { circular: {} } }, type)).toThrow(BlorkError);
	});
	test("Optional types pass correctly", () => {
		expect(check(1, "number?")).toBe(1);
		expect(check("a", "string?")).toBe(1);
		expect(check({}, "object?")).toBe(1);
		expect(check(undefined, "number?")).toBe(0);
		expect(check(undefined, "string?")).toBe(0);
		expect(check(undefined, "object?")).toBe(0);
	});
	test("Optional types fail correctly", () => {
		expect(() => check("a", "number?")).toThrow(TypeError);
		expect(() => check(1, "string?")).toThrow(TypeError);
		expect(() => check(1, "object?")).toThrow(TypeError);
	});
	test("Throw BlorkError if type is not object, function, or string", () => {
		expect(() => check(1, 123)).toThrow(BlorkError);
		expect(() => check(1, true)).toThrow(BlorkError);
		expect(() => check(1, null)).toThrow(BlorkError);
		expect(() => check(1, undefined)).toThrow(BlorkError);
	});
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
describe("check() name", () => {
	test("Do not throw error if passing string name", () => {
		expect(check(true, "bool", "myValue")).toBe(1);
		expect(check(true, Boolean, "myValue")).toBe(1);
		expect(check([true], ["bool"], "myValue")).toBe(1);
		expect(check({ bool: true }, { bool: "bool" }, "myValue")).toBe(1);
	});
	test("Throw BlorkError if passing non-string name", () => {
		expect(() => check(1, "bool", 123)).toThrow(BlorkError);
	});
});
