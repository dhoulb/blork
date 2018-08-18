const { ValueError, EMPTY } = require("../../lib/exports");

// Tests.
describe("ValueError()", () => {
	describe("Default reason", () => {
		test("Return correct error with default reason (named function)", () => {
			function abc() {
				const e = new ValueError();
				expect(e).toHaveProperty("name", "ValueError");
				expect(e).toHaveProperty("message", "abc(): Invalid value");
				expect(e).toHaveProperty("prefix", "abc()");
				expect(e).toHaveProperty("reason", "Invalid value");
				expect(e).not.toHaveProperty("value");
			}
			abc();
		});
		test("Return correct error with default reason (named function)", () => {
			(() => {
				const e = new ValueError();
				expect(e).toHaveProperty("name", "ValueError");
				expect(e).toHaveProperty("message", "Invalid value");
				expect(e).toHaveProperty("prefix", "");
				expect(e).toHaveProperty("reason", "Invalid value");
				expect(e).not.toHaveProperty("value");
			})();
		});
	});
	describe("Reason", () => {
		test("Return correct error with reason only (named function)", () => {
			function abc() {
				const e = new ValueError("Reason");
				expect(e).toHaveProperty("name", "ValueError");
				expect(e).toHaveProperty("message", "abc(): Reason");
				expect(e).toHaveProperty("prefix", "abc()");
				expect(e).toHaveProperty("reason", "Reason");
				expect(e).not.toHaveProperty("value");
			}
			abc();
		});
		test("Return correct error with reason only (named function)", () => {
			(() => {
				const e = new ValueError("Reason");
				expect(e).toHaveProperty("name", "ValueError");
				expect(e).toHaveProperty("message", "Reason");
				expect(e).toHaveProperty("prefix", "");
				expect(e).toHaveProperty("reason", "Reason");
				expect(e).not.toHaveProperty("value");
			})();
		});
	});
	describe("Value", () => {
		test("Return correct error with reason and value (named function)", () => {
			function abc() {
				const e = new ValueError("Reason", 123);
				expect(e).toHaveProperty("name", "ValueError");
				expect(e).toHaveProperty("message", "abc(): Reason (received 123)");
				expect(e).toHaveProperty("prefix", "abc()");
				expect(e).toHaveProperty("reason", "Reason");
				expect(e).toHaveProperty("value", 123);
			}
			abc();
		});
		test("Return correct error with reason and value (anonymous function)", () => {
			(() => {
				const e = new ValueError("Reason", 123);
				expect(e).toHaveProperty("message", "Reason (received 123)");
				expect(e).toHaveProperty("prefix", "");
				expect(e).toHaveProperty("reason", "Reason");
				expect(e).toHaveProperty("value", 123);
			})();
		});
	});
	describe("Prefix", () => {
		test("Return correct error with reason, value, and prefix (named function)", () => {
			function abc() {
				const e = new ValueError("Reason", 123, "Prefix");
				expect(e).toHaveProperty("name", "ValueError");
				expect(e).toHaveProperty("message", "abc(): Prefix: Reason (received 123)");
				expect(e).toHaveProperty("prefix", "abc(): Prefix");
				expect(e).toHaveProperty("reason", "Reason");
				expect(e).toHaveProperty("value", 123);
			}
			abc();
		});
		test("Return correct error with reason, value, and prefix (named function but with prefix including ': ' colon space)", () => {
			function abc() {
				const e = new ValueError("Reason", 123, "myFunc(): Prefix");
				expect(e).toHaveProperty("name", "ValueError");
				expect(e).toHaveProperty("message", "myFunc(): Prefix: Reason (received 123)");
				expect(e).toHaveProperty("prefix", "myFunc(): Prefix");
				expect(e).toHaveProperty("reason", "Reason");
				expect(e).toHaveProperty("value", 123);
			}
			abc();
		});
		test("Return correct error with reason, value, and prefix (anonymous function)", () => {
			(() => {
				const e = new ValueError("Reason", 123, "Prefix");
				expect(e).toHaveProperty("message", "Prefix: Reason (received 123)");
				expect(e).toHaveProperty("prefix", "Prefix");
				expect(e).toHaveProperty("reason", "Reason");
				expect(e).toHaveProperty("value", 123);
			})();
		});
	});
	test("Does not show value in message if value is EMPTY", () => {
		expect(new ValueError("Reason", EMPTY).hasOwnProperty("value")).toBe(false);
		expect(new ValueError("Reason", EMPTY).message).not.toMatch(/received/);
	});
});
