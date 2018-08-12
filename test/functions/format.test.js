const { format, EMPTY } = require("../../lib/exports");

// Tests.
describe("format()", () => {
	test("Format debug string with message only", () => {
		expect(format("Message")).toBe("Message");
	});
	test("Format debug string with message and value", () => {
		expect(format("Message", 123)).toBe("Message (received 123)");
	});
	test("Format debug string with message and EMPTY value", () => {
		expect(format("Message", EMPTY)).toBe("Message");
	});
	test("Format debug string with message, value, and prefix", () => {
		expect(format("Message", 123, "Prefix")).toBe("Prefix: Message (received 123)");
	});
});
