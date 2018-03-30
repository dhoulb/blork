const { blork, check, args } = require("../lib/exports");
const BlorkError = require("../lib/errors/BlorkError");

// Tests.
describe("exports.blork()", () => {
	test("Test that instances of Blork are independent", () => {
		const blork1 = blork();
		const blork2 = blork();
		expect(blork1.check).toBeInstanceOf(Function);
		expect(blork2.check).toBeInstanceOf(Function);
		expect(blork1.args).toBeInstanceOf(Function);
		expect(blork2.args).toBeInstanceOf(Function);
		expect(check).not.toBe(blork1.check);
		expect(blork1.check).not.toBe(blork2.check);
		expect(args).not.toBe(blork1.args);
		expect(blork1.args).not.toBe(blork2.args);
	});
	test("Test that instances of Blork don't share throws() Error type", () => {
		class OtherError extends Error {}
		const blork1 = blork();
		const blork2 = blork();
		blork1.throws(OtherError);
		// Blork1 throws OtherError now.
		expect(() => blork1.check(123, "str")).toThrow(OtherError);
		// Blork2 and global Blork are unaffected.
		expect(() => blork2.check(123, "str")).toThrow(TypeError);
		expect(() => check(123, "str")).toThrow(TypeError);
	});
	test("Test that instances of Blork don't share checkers", () => {
		const blork1 = blork();
		const blork2 = blork();
		blork1.add("something", () => true, "something");
		// Blork1 returns 1 because we added the custom "something" checker.
		expect(blork1.check(123, "something")).toBe(undefined);
		// Blork2 and global Blork are unaffected (and throw typeerror).
		expect(() => blork2.check(123, "something")).toThrow(BlorkError);
		expect(() => check(123, "something")).toThrow(BlorkError);
	});
});
