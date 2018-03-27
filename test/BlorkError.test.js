const BlorkError = require("../lib/BlorkError");

// Tests.
describe("BlorkError()", () => {
	test("Return correct error with message only", () => {
		expect(new BlorkError("Message")).toHaveProperty("message", "Message");
	});
	test("Return correct error with message and value", () => {
		expect(new BlorkError("Message", 123)).toHaveProperty("message", "Message (received 123)");
	});
	test("Return correct error with message, value, and prefix", () => {
		expect(new BlorkError("Message", 123, "Prefix")).toHaveProperty("message", "Prefix: Message (received 123)");
	});
});
