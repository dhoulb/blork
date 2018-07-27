const BlorkError = require("../../lib/errors/BlorkError");

// Tests.
describe("BlorkError()", () => {
	test("Return correct error with default message", () => {
		expect(new BlorkError()).toHaveProperty("message");
		expect(new BlorkError()).toHaveProperty("reason");
		expect(new BlorkError()).not.toHaveProperty("value");
	});
	test("Return correct error with message only", () => {
		expect(new BlorkError("Message")).toHaveProperty("message", "Object.test(): Message");
		expect(new BlorkError("Message")).toHaveProperty("prefix", "Object.test()");
		expect(new BlorkError("Message")).toHaveProperty("reason", "Message");
		expect(new BlorkError("Message")).not.toHaveProperty("value");
	});
	test("Return correct error with message and value", () => {
		expect(new BlorkError("Message", 123)).toHaveProperty("message", "Object.test(): Message (received 123)");
		expect(new BlorkError("Message", 123)).toHaveProperty("prefix", "Object.test()");
		expect(new BlorkError("Message", 123)).toHaveProperty("reason", "Message");
		expect(new BlorkError("Message", 123)).toHaveProperty("value", 123);
	});
	test("Return correct error with message, value, and prefix", () => {
		expect(new BlorkError("Message", 123, "Prefix")).toHaveProperty(
			"message",
			"Object.test(): Prefix: Message (received 123)"
		);
		expect(new BlorkError("Message", 123, "Prefix")).toHaveProperty("prefix", "Object.test(): Prefix");
		expect(new BlorkError("Message", 123, "Prefix")).toHaveProperty("reason", "Message");
		expect(new BlorkError("Message", 123, "Prefix")).toHaveProperty("value", 123);
	});
});
