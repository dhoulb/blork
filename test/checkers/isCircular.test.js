const isCircular = require("../../lib/checkers/isCircular");

describe("isCircular()", () => {
	test("Circular references in objects return true", () => {
		const a = {};
		a.circular = a;
		expect(isCircular(a)).toEqual(true);
		const b = { b: {} };
		b.b.circular = b;
		expect(isCircular(b)).toEqual(true);
		const c = { c: { c: { c: { c: {} } } } };
		c.c.c.c.c.circular = c;
		expect(isCircular(c)).toEqual(true);
	});
	test("Circular references in arrays return true", () => {
		const a = [];
		a[0] = a;
		expect(isCircular(a)).toEqual(true);
		const b = [[[[[[[[]]]]]]]];
		b[0][0][0][0][0][0][0][0] = b;
		expect(isCircular(b)).toEqual(true);
	});
	test("Mixed circular references in arrays/objects return true", () => {
		const a = [{ a: [{ a: [{ a: [{ a: [{}] }] }] }] }];
		a[0].a[0].a[0].a[0].a[0].circular = a;
		expect(isCircular(a)).toEqual(true);
	});
	test("No circular references in arrays/objects return false", () => {
		const a = [];
		expect(isCircular(a)).toEqual(false);
		const b = [[[[[[[[]]]]]]]];
		expect(isCircular(b)).toEqual(false);
		const c = {};
		expect(isCircular(c)).toEqual(false);
		const d = { d: {} };
		expect(isCircular(d)).toEqual(false);
		const e = { e: { e: { e: { e: {} } } } };
		e.e.e.e.e.circular = c;
		expect(isCircular(e)).toEqual(false);
		const f = [{ f: [{ f: [{ f: [{ f: [{}] }] }] }] }];
		expect(isCircular(f)).toEqual(false);
	});
});
