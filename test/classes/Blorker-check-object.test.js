const BlorkError = require("../../lib/errors/BlorkError");
const { check, CLASS, KEYS, VALUES } = require("../../lib/exports");

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
	describe("CLASS property", () => {
		class MyClass {
			constructor() {
				this.a = "abc";
			}
		}
		test("Object literal types with CLASS property pass correctly", () => {
			expect(check(new MyClass(), { [CLASS]: MyClass, a: "string" })).toBe(undefined);
		});
		test("Object literal types with CLASS property fails correctly", () => {
			expect(() => check({ a: "abc" }, { [CLASS]: MyClass, a: "string" })).toThrow(TypeError);
			expect(() => check({ a: "abc" }, { [CLASS]: MyClass, a: "string" })).toThrow(/instance of MyClass/);
			expect(() => check({ a: "abc" }, { [CLASS]: MyClass, a: "string" })).toThrow(/{ "a": "abc" }/);
		});
		test("Object literal types without CLASS property fails correctly", () => {
			expect(() => check(new MyClass(), { a: "string" })).toThrow(TypeError);
		});
	});
	describe("KEYS property", () => {
		test("Object literal types with KEYS property pass correctly", () => {
			expect(check({ A: 1, B: 1, C: 1 }, { A: "num", [KEYS]: "upper" })).toBe(undefined);
			expect(check({ aA: "abc", bB: "abc", cC: "abc" }, { aA: "str", [KEYS]: "camel" })).toBe(undefined);
			expect(check({ a: 1, b: 2, c: undefined }, { a: "num", [KEYS]: "lower" })).toBe(undefined);
		});
		test("Object literal types with KEYS property pass correctly when KEYS isn't used", () => {
			expect(check({ A: "abc" }, { A: "str", [KEYS]: "lower" })).toBe(undefined);
		});
		test("Object literal types with KEYS property fail correctly", () => {
			expect(() => check({ a: 1, b: 2 }, { a: "num", [KEYS]: "upper" })).toThrow(TypeError);
			expect(() => check({ a: 1, b: 2 }, { a: "num", [KEYS]: "upper" })).toThrow(/\.b:/);
			expect(() => check({ a: 1, b: 2 }, { a: "num", [KEYS]: "upper" })).toThrow(/UPPERCASE/i);
			expect(() => check({ a: 1, b: 2 }, { a: "num", [KEYS]: "upper" }, "doc")).toThrow(TypeError);
			expect(() => check({ a: 1, b: 2 }, { a: "num", [KEYS]: "upper" }, "doc")).toThrow(/doc\.b:/);
			expect(() => check({ a: 1, b: 2 }, { a: "num", [KEYS]: "upper" }, "doc")).toThrow(/UPPERCASE/i);
			expect(() => check({ a: 1, b: 2, c: "c" }, { a: "num", [KEYS]: "num" })).toThrow(TypeError);
		});
	});
	describe("VALUES property", () => {
		test("Object literal types with VALUES property pass correctly", () => {
			expect(check({ a: 1, b: 1, c: 1 }, { a: "num", [VALUES]: "num" })).toBe(undefined);
			expect(check({ a: "abc", b: "abc", c: "abc" }, { a: "str", [VALUES]: "str" })).toBe(undefined);
			expect(check({ a: 1, b: 2, c: undefined }, { a: "num", [VALUES]: "num?" })).toBe(undefined);
			expect(check({ a: new Map(), b: new Map(), c: new Map() }, { [VALUES]: Map })).toBe(undefined);
		});
		test("Object literal types with VALUES property pass correctly when VALUES isn't used", () => {
			expect(check({ a: "abc" }, { a: "str", [VALUES]: "str" })).toBe(undefined);
		});
		test("Object literal types with VALUES property fail correctly", () => {
			expect(() => check({ a: 1 }, { [VALUES]: "str" })).toThrow(TypeError);
			expect(() => check({ a: 1 }, { [VALUES]: "str" })).toThrow(/\.a:/);
			expect(() => check({ a: 1 }, { [VALUES]: "str" })).toThrow(/must be string/i);
			expect(() => check({ a: 1 }, { [VALUES]: "str" }, "doc")).toThrow(TypeError);
			expect(() => check({ a: 1 }, { [VALUES]: "str" }, "doc")).toThrow(/doc.a:/);
			expect(() => check({ a: 1 }, { [VALUES]: "str" }, "doc")).toThrow(/must be string/i);
			expect(() => check({ a: 1, b: 2, c: "c" }, { a: "num", [VALUES]: "num" })).toThrow(TypeError);
			expect(() => check({ a: new Map() }, { [VALUES]: Set })).toThrow(TypeError);
			expect(() => check({ a: new Map(), b: new Set(), c: new Set() }, { [VALUES]: Set })).toThrow(TypeError);
		});
		test("Deep object literal types with VALUES property pass correctly", () => {
			expect(check({ a: "a", b: { bb: 22, bc: 23 } }, { a: "str", b: { [VALUES]: "num" } })).toBe(undefined);
		});
	});
	describe("Circular references", () => {
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
});
