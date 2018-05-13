const ValueError = require("../lib/errors/ValueError");
const BlorkError = require("../lib/errors/BlorkError");
const { props } = require("../lib/exports");

// Tests.
describe("exports.props()", () => {
	test("Value is set on property", () => {
		const obj = {};
		const arr = [];
		props(obj, { arr: arr });
		props(obj, { bool: true });
		props(obj, { num: 123 });
		props(obj, { str: "ABC" });
		props(obj, { obj: obj });
		expect(obj.arr).toBe(arr);
		expect(obj.bool).toBe(true);
		expect(obj.num).toBe(123);
		expect(obj.str).toBe("ABC");
		expect(obj.obj).toBe(obj);
	});
	test("Property can be locked to primitive type", () => {
		const obj = {};
		props(obj, { bool: true });
		props(obj, { num: 123 });
		props(obj, { str: "ABC" });
		props(obj, { symb: Symbol() });
		// Doesn't throw.
		expect(() => (obj.bool = false)).not.toThrow(Error);
		expect(() => (obj.num = 123)).not.toThrow(Error);
		expect(() => (obj.str = "DEF")).not.toThrow(Error);
		expect(() => (obj.symb = Symbol("symb"))).not.toThrow(Error);
		// Throws.
		expect(() => (obj.bool = 123)).toThrow(ValueError);
		expect(() => (obj.num = "nope")).toThrow(ValueError);
		expect(() => (obj.str = 123)).toThrow(ValueError);
		expect(() => (obj.symb = 123)).toThrow(ValueError);
	});

	test("Property can be locked to plain object type", () => {
		const obj = {};
		props(obj, { obj: { str: "ABC" } }); // Plain object.
		// Doesn't throw.
		expect(() => (obj.obj = {})).not.toThrow(Error); // Any instanceof Object is fine.
		// Throws.
		expect(() => (obj.obj = false)).toThrow(ValueError);
		expect(() => (obj.obj = false)).toThrow(/obj:/);
		expect(() => (obj.obj = false)).toThrow(/instance of Object/);
	});
	test("Property can be locked to class object type", () => {
		const obj = {};
		class Dog {}
		props(obj, { dog: new Dog() }); // Dog object.
		// Doesn't throw.
		expect(() => (obj.dog = new Dog())).not.toThrow(Error);
		// Throws.
		expect(() => (obj.dog = {})).toThrow(ValueError);
		expect(() => (obj.dog = {})).toThrow(/dog:/);
		expect(() => (obj.dog = {})).toThrow(/instance of Dog/);
	});
	test("Locked property cannot be deleted", () => {
		const obj = {};
		props(obj, { bool: true });
		// Delete.
		delete obj.bool;
		// Note not deleted.
		expect(obj.bool).toBe(true);
	});
	test("Throw BlorkError if passing incorrect object argument", () => {
		expect(() => props(null)).toThrow(BlorkError); // Must be BlorkError.
		expect(() => props(null)).toThrow(/props\(\):/); // Must contain "props()"
		expect(() => props(null)).toThrow(/object:/); // Must contain "object:"
		expect(() => props(null)).toThrow(/must be object/i); // Must contain "must be object"
	});
	test("Throw BlorkError if passing incorrect name argument", () => {
		expect(() => props({}, null)).toThrow(BlorkError); // Must be BlorkError.
		expect(() => props({}, null)).toThrow(/props\(\):/); // Must contain "props()"
		expect(() => props({}, null)).toThrow(/props:/); // Must contain "arguments[1]"
		expect(() => props({}, null)).toThrow(/must be plain object/i); // Must contain "must be plain object"
	});
});
