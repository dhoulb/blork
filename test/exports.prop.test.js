const ValueError = require("../lib/errors/ValueError");
const BlorkError = require("../lib/errors/BlorkError");
const { prop } = require("../lib/exports");

// Tests.
describe("exports.prop()", () => {
	test("Value is set on property", () => {
		const obj = {};
		const arr = [];
		prop(obj, "arr", arr);
		prop(obj, "bool", true);
		prop(obj, "num", 123);
		prop(obj, "str", "ABC");
		prop(obj, "obj", obj);
		expect(obj.arr).toBe(arr);
		expect(obj.bool).toBe(true);
		expect(obj.num).toBe(123);
		expect(obj.str).toBe("ABC");
		expect(obj.obj).toBe(obj);
	});
	test("Property can be changed to implied primitive type", () => {
		const obj = {};
		prop(obj, "bool", true);
		prop(obj, "num", 123);
		prop(obj, "str", "ABC");
		prop(obj, "symb", Symbol());
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
	test("Property can be locked to explicit string type", () => {
		const obj = {};
		prop(obj, "bool", true, "boolean");
		prop(obj, "numOrStr", 123, "number|string");
		prop(obj, "optionalStr", "ABC", "string?");
		// Doesn't throw.
		expect(() => (obj.bool = false)).not.toThrow(Error);
		expect(() => (obj.numOrStr = 123)).not.toThrow(Error);
		expect(() => (obj.numOrStr = "DEF")).not.toThrow(Error);
		expect(() => (obj.optionalStr = "DEF")).not.toThrow(Error);
		expect(() => (obj.optionalStr = undefined)).not.toThrow(Error);
		// Throws.
		expect(() => (obj.bool = 123)).toThrow(ValueError);
		expect(() => (obj.bool = 123)).toThrow(/bool:/);
		expect(() => (obj.bool = 123)).toThrow(/true or false/);
		expect(() => (obj.numOrStr = true)).toThrow(ValueError);
		expect(() => (obj.numOrStr = true)).toThrow(/numOrStr:/);
		expect(() => (obj.numOrStr = true)).toThrow(/number or string/);
		expect(() => (obj.optionalStr = 123)).toThrow(ValueError);
		expect(() => (obj.optionalStr = 123)).toThrow(/optionalStr/);
		expect(() => (obj.optionalStr = 123)).toThrow(/string or empty/);
	});
	test("Property can be locked to explicit literal type", () => {
		const obj = {};
		prop(obj, "bool", true, Boolean);
		prop(obj, "num", 123, Number);
		prop(obj, "str", "ABC", String);
		// Doesn't throw.
		expect(() => (obj.bool = false)).not.toThrow(Error);
		expect(() => (obj.num = 123)).not.toThrow(Error);
		expect(() => (obj.str = "DEF")).not.toThrow(Error);
		// Throws.
		expect(() => (obj.bool = 123)).toThrow(ValueError);
		expect(() => (obj.num = "nope")).toThrow(ValueError);
		expect(() => (obj.str = 123)).toThrow(ValueError);
	});
	test("Property can be locked to explicit object type", () => {
		const obj = {};
		prop(obj, "objWithStr", { str: "ABC" }, { str: "string" });
		// Doesn't throw.
		expect(() => (obj.objWithStr = { str: "DEF" })).not.toThrow(Error);
		// Throws.
		expect(() => (obj.objWithStr = 123)).toThrow(ValueError);
		expect(() => (obj.objWithStr = 123)).toThrow(/objWithStr:/);
		expect(() => (obj.objWithStr = 123)).toThrow(/plain object/);
		expect(() => (obj.objWithStr = { str: 123 })).toThrow(ValueError);
		expect(() => (obj.objWithStr = { str: 123 })).toThrow(/objWithStr\.str:/);
		expect(() => (obj.objWithStr = { str: 123 })).toThrow(/string/);
	});
	test("Property can be locked to implied plain object type", () => {
		const obj = {};
		prop(obj, "obj", { str: "ABC" }); // Plain object.
		// Doesn't throw.
		expect(() => (obj.obj = {})).not.toThrow(Error); // Any instanceof Object is fine.
		// Throws.
		expect(() => (obj.obj = false)).toThrow(ValueError);
		expect(() => (obj.obj = false)).toThrow(/obj:/);
		expect(() => (obj.obj = false)).toThrow(/instance of Object/);
	});
	test("Property can be locked to implied class object type", () => {
		const obj = {};
		class Dog {}
		prop(obj, "dog", new Dog()); // Dog object.
		// Doesn't throw.
		expect(() => (obj.dog = new Dog())).not.toThrow(Error);
		// Throws.
		expect(() => (obj.dog = {})).toThrow(ValueError);
		expect(() => (obj.dog = {})).toThrow(/dog:/);
		expect(() => (obj.dog = {})).toThrow(/instance of Dog/);
	});
	test("Locked property cannot be deleted", () => {
		const obj = {};
		prop(obj, "bool", true, "boolean");
		// Delete.
		delete obj.bool;
		// Note not deleted.
		expect(obj.bool).toBe(true);
	});
	test("Throw BlorkError if passing incorrect object argument", () => {
		expect(() => prop(null)).toThrow(BlorkError); // Must be BlorkError.
		expect(() => prop(null)).toThrow(/prop\(\):/); // Must contain "prop()"
		expect(() => prop(null)).toThrow(/object:/); // Must contain "object:"
		expect(() => prop(null)).toThrow(/must be object/i); // Must contain "must be object"
	});
	test("Throw BlorkError if passing incorrect name argument", () => {
		expect(() => prop({}, null)).toThrow(BlorkError); // Must be BlorkError.
		expect(() => prop({}, null)).toThrow(/prop\(\):/); // Must contain "prop()"
		expect(() => prop({}, null)).toThrow(/name:/); // Must contain "arguments[1]"
		expect(() => prop({}, null)).toThrow(/string/); // Must contain "must be string"
	});
	test("Throw BlorkError if type is specified and value doesn't match", () => {
		expect(() => prop({}, "prop", "abc", "number")).toThrow(BlorkError); // Must be BlorkError.
		expect(() => prop({}, "prop", "abc", "number")).toThrow(/prop\(\)/); // Must contain "prop()"
		expect(() => prop({}, "prop", "abc", "number")).toThrow(/value:/); // Must contain "arguments[2]"
		expect(() => prop({}, "prop", "abc", "number")).toThrow(/number/); // Must contain "number"
		expect(() => prop({}, "prop", 123, "string")).toThrow(/string/); // Must contain "must be string"
	});
});
