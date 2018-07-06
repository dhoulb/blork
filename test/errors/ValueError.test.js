const { ValueError, EMPTY } = require("../../lib/exports");

// Tests.
describe("ValueError()", () => {
	test("Return correct error with default message", () => {
		expect(new ValueError()).toHaveProperty("name", "ValueError");
		expect(new ValueError()).toHaveProperty("message", "Invalid value");
		expect(new ValueError()).toHaveProperty("prefix", "");
		expect(new ValueError()).toHaveProperty("reason", "Invalid value");
		expect(new ValueError()).not.toHaveProperty("value");
	});
	test("Return correct error with message only", () => {
		expect(new ValueError("Message")).toHaveProperty("name", "ValueError");
		expect(new ValueError("Message")).toHaveProperty("message", "Message");
		expect(new ValueError("Message")).toHaveProperty("prefix", "");
		expect(new ValueError("Message")).toHaveProperty("reason", "Message");
		expect(new ValueError("Message")).not.toHaveProperty("value");
	});
	test("Return correct error with message and value", () => {
		expect(new ValueError("Message", 123)).toHaveProperty("name", "ValueError");
		expect(new ValueError("Message", 123)).toHaveProperty("message", "Message (received 123)");
		expect(new ValueError("Message", 123)).toHaveProperty("prefix", "");
		expect(new ValueError("Message", 123)).toHaveProperty("reason", "Message");
		expect(new ValueError("Message", 123)).toHaveProperty("value", 123);
	});
	test("Return correct error with message, value, and prefix", () => {
		expect(new ValueError("Message", 123, "Prefix")).toHaveProperty("name", "ValueError");
		expect(new ValueError("Message", 123, "Prefix")).toHaveProperty("message", "Prefix: Message (received 123)");
		expect(new ValueError("Message", 123, "Prefix")).toHaveProperty("prefix", "Prefix");
		expect(new ValueError("Message", 123, "Prefix")).toHaveProperty("reason", "Message");
		expect(new ValueError("Message", 123, "Prefix")).toHaveProperty("value", 123);
	});
	test("Does not show value in message if value is EMPTY", () => {
		expect(new ValueError("Message", EMPTY).hasOwnProperty("value")).toBe(false);
		expect(new ValueError("Message", EMPTY).message).not.toMatch(/received/);
	});
});
