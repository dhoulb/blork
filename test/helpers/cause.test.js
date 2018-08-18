const cause = require("../../lib/helpers/cause");

// Tests.
describe("cause()", () => {
	describe("Chrome, Node, IE, Edge", () => {
		test("Correct frame is returned", () => {
			// Full stack from a random Blork error.
			const stack = [
				"ValueError: Must be finite string (received 123)",
				"    at throwError (classes/Blorker.js:41:83)",
				"    at runChecker (classes/Blorker.js:21:77)",
				"    at Blorker._check (classes/Blorker.js:261:109)",
				"    at Blorker$check (classes/Blorker.js:118:31)",
				"    at MyClass.name (MyClass.js:8:4)",
				"    at myFunc (helpers/myFunc.js:129:432)"
			];

			// Get the cause stack frame from the frames.
			const c = cause(stack.join("\n"));
			expect(c.function).toBe("MyClass.name()");
			expect(c.file).toBe("MyClass.js");
			expect(c.line).toBe(8);
			expect(c.column).toBe(4);
			expect(c.original).toBe("    at MyClass.name (MyClass.js:8:4)");
			expect(c.stack).toBe(
				[
					"ValueError: Must be finite string (received 123)",
					"    at MyClass.name (MyClass.js:8:4)",
					"    at myFunc (helpers/myFunc.js:129:432)"
				].join("\n")
			);
		});
		test("Anonymous functions are skipped over", () => {
			// Full stack from a random Blork error.
			const stack = [
				"ValueError: Must be finite string (received 123)",
				"    at throwError (classes/Blorker.js:41:83)",
				"    at runChecker (classes/Blorker.js:21:77)",
				"    at Blorker._check (classes/Blorker.js:261:109)",
				"    at Blorker$check (classes/Blorker.js:118:31)",
				"    at <anonymous>:1:3", // Anonymous.
				"    at <anonymous>:1", // Anonymous.
				"    at <anonymous>", // Anonymous.
				"    at MyClass.name (MyClass.js:8:4)",
				"    at myFunc (helpers/myFunc.js:129:432)"
			];

			// Get the cause stack frame from the frames.
			const c = cause(stack.join("\n"));
			expect(c.function).toBe("MyClass.name()");
			expect(c.file).toBe("MyClass.js");
			expect(c.line).toBe(8);
			expect(c.column).toBe(4);
			expect(c.original).toBe("    at MyClass.name (MyClass.js:8:4)");
			expect(c.stack).toBe(
				[
					"ValueError: Must be finite string (received 123)",
					"    at MyClass.name (MyClass.js:8:4)",
					"    at myFunc (helpers/myFunc.js:129:432)"
				].join("\n")
			);
		});
		test("First frame is returned if no Blorker call is in the stack", () => {
			// Full stack from a random Blork error.
			const stack = [
				"Error",
				"    at Object.test (functions/cause.test.js:8:4)",
				"    at Object.asyncFn (node_modules/jest-jasmine2/build/jasmine_async.js:129:432)",
				"    at resolve (node_modules/jest-jasmine2/build/queue_runner.js:51:12)",
				"    at new Promise (<anonymous>)",
				"    at mapper (node_modules/jest-jasmine2/build/queue_runner.js:40:274)",
				"    at promise.then (node_modules/jest-jasmine2/build/queue_runner.js:83:39)",
				"    at <anonymous>",
				"    at process._tickCallback (internal/process/next_tick.js:182:7)"
			];

			// Get the cause stack frame from the frames.
			const c = cause(stack.join("\n"));
			expect(c.function).toBe("Object.test()");
			expect(c.file).toBe("functions/cause.test.js");
			expect(c.line).toBe(8);
			expect(c.column).toBe(4);
			expect(c.original).toBe("    at Object.test (functions/cause.test.js:8:4)");
			expect(c.stack).toBe(stack.join("\n"));
		});
	});
	describe("Firefox, Safari", () => {
		test("Correct frame is returned", () => {
			// Full stack from a random Blork error.
			const stack = [
				"throwError@classes/Blorker.js:41:83",
				"runChecker@classes/Blorker.js:21:77",
				"Blorker._check@classes/Blorker.js:261:109",
				"Blorker$check@classes/Blorker.js:118:31",
				"MyClass.name@MyClass.js:8:4",
				"myFunc@helpers/myFunc.js:129:432"
			];

			// Get the cause stack frame from the frames.
			const c = cause(stack.join("\n"));
			expect(c.function).toBe("MyClass.name()");
			expect(c.file).toBe("MyClass.js");
			expect(c.line).toBe(8);
			expect(c.column).toBe(4);
			expect(c.original).toBe("MyClass.name@MyClass.js:8:4");
			expect(c.stack).toBe(["MyClass.name@MyClass.js:8:4", "myFunc@helpers/myFunc.js:129:432"].join("\n"));
		});
		test("Anonymous functions are skipped over", () => {
			// Full stack from a random Blork error.
			const stack = [
				"throwError@classes/Blorker.js:41:83",
				"runChecker@classes/Blorker.js:21:77",
				"Blorker._check@classes/Blorker.js:261:109",
				"Blorker$check@classes/Blorker.js:118:31",
				"@file:///C:/example.html:16:13", // Anonymous.
				"@debugger eval code:21:9", // Anonymous.
				"MyClass.name@MyClass.js:8:4",
				"myFunc@helpers/myFunc.js:129:432"
			];

			// Get the cause stack frame from the frames.
			const c = cause(stack.join("\n"));
			expect(c.function).toBe("MyClass.name()");
			expect(c.file).toBe("MyClass.js");
			expect(c.line).toBe(8);
			expect(c.column).toBe(4);
			expect(c.original).toBe("MyClass.name@MyClass.js:8:4");
			expect(c.stack).toBe(["MyClass.name@MyClass.js:8:4", "myFunc@helpers/myFunc.js:129:432"].join("\n"));
		});
	});
	test("Undefined is returned if stack is not valid", () => {
		expect(cause(123)).toBe(undefined);
		expect(cause("")).toBe(undefined);
	});
});
