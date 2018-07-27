const cause = require("../../lib/functions/cause");

// Tests.
describe("cause()", () => {
	test("Cause is correctly found", () => {
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
		expect(cause(stack.join("\n"))).toEqual({
			function: "MyClass.name()",
			file: "MyClass.js",
			line: 8,
			column: 4
		});
	});
	test("Undefined is returned if no Blorker call is in the stack", () => {
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
		expect(cause(stack.join("\n"))).toBe(undefined);
	});
});
