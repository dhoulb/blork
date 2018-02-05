const BlorkError = require("../lib/BlorkError");

// Tests.
describe("BlorkError()", () => {
	test("Return the correct debug string for different types", () => {
		expect(new BlorkError("abc")).toHaveProperty("message", "abc");
	});
});
