const destack = require("../../lib/functions/destack");

// Tests.
describe("destack()", () => {
	test("First argument must be string", () => {
		expect(destack(123)).toEqual([]);
		expect(destack(true)).toEqual([]);
	});
	test("Chrome, Node, IE, Edge", () => {
		expect(destack("Error\n    at abc (file.js:1:2)")).toEqual([
			{ function: "abc()", file: "file.js", line: 1, column: 2 }
		]);
		expect(destack("Error\n    at abc (file.js:1)")).toEqual([
			{ function: "abc()", file: "file.js", line: 1, column: null }
		]);
		expect(destack("Error\n    at abc (file.js)")).toEqual([
			{ function: "abc()", file: "file.js", line: null, column: null }
		]);
		expect(destack("Error\n    at <anonymous> (file.js:1:2)")).toEqual([
			{ function: "function ()", file: "file.js", line: 1, column: 2 }
		]);
		expect(destack("Error\n    at file.js:1:2")).toEqual([
			{ function: "function ()", file: "file.js", line: 1, column: 2 }
		]);
		expect(destack("Error\n    at file.js:1")).toEqual([
			{ function: "function ()", file: "file.js", line: 1, column: null }
		]);
		expect(destack("Error\n    at file.js")).toEqual([
			{ function: "function ()", file: "file.js", line: null, column: null }
		]);
		expect(destack("Error\n    at <anonymous>:1:2")).toEqual([
			{ function: "function ()", file: "", line: 1, column: 2 }
		]);
		expect(destack("Error\n    at <anonymous>:1")).toEqual([
			{ function: "function ()", file: "", line: 1, column: null }
		]);
		expect(destack("Error\n    at <anonymous>")).toEqual([
			{ function: "function ()", file: "", line: null, column: null }
		]);
		const stack2 = [
			"Error",
			"    at abc (<anonymous>:1:30)",
			"    at def (<anonymous>:1:18)",
			"    at GHI.ghi (<anonymous>:2:9)",
			"    at <anonymous>:1:3",
			"    at <anonymous>:1",
			"    at <anonymous>"
		];
		expect(destack(stack2.join("\n"))).toEqual([
			{ function: "abc()", file: "", line: 1, column: 30 },
			{ function: "def()", file: "", line: 1, column: 18 },
			{ function: "GHI.ghi()", file: "", line: 2, column: 9 },
			{ function: "function ()", file: "", line: 1, column: 3 },
			{ function: "function ()", file: "", line: 1, column: null },
			{ function: "function ()", file: "", line: null, column: null }
		]);
		const stack3 = [
			"Error",
			"    at Object.test (/blork/test/functions/destack.test.js:21:15)",
			"    at Object.asyncFn (/jest-jasmine2/build/jasmine_async.js:129:432)",
			"    at resolve (/jest-jasmine2/build/queue_runner.js:51:12)",
			"    at new Promise (<anonymous>)",
			"    at mapper (/jest-jasmine2/build/queue_runner.js:40:274)",
			"    at promise.then (/jest-jasmine2/build/queue_runner.js:83:39)",
			"    at <anonymous>",
			"    at process._tickCallback (internal/process/next_tick.js:182:7)"
		];
		expect(destack(stack3.join("\n"))).toEqual([
			{ function: "Object.test()", file: "/blork/test/functions/destack.test.js", line: 21, column: 15 },
			{ function: "Object.asyncFn()", file: "/jest-jasmine2/build/jasmine_async.js", line: 129, column: 432 },
			{ function: "resolve()", file: "/jest-jasmine2/build/queue_runner.js", line: 51, column: 12 },
			{ function: "new Promise()", file: "", line: null, column: null },
			{ function: "mapper()", file: "/jest-jasmine2/build/queue_runner.js", line: 40, column: 274 },
			{ function: "promise.then()", file: "/jest-jasmine2/build/queue_runner.js", line: 83, column: 39 },
			{ function: "function ()", file: "", line: null, column: null },
			{ function: "process._tickCallback()", file: "internal/process/next_tick.js", line: 182, column: 7 }
		]);
	});
	test("Firefox, Safari", () => {
		// Firefox.
		expect(destack("trace@file:///C:/example.html:9:17")).toEqual([
			{ function: "trace()", file: "file:///C:/example.html", line: 9, column: 17 }
		]);
		expect(destack("@file:///C:/example.html:16:13")).toEqual([
			{ function: "function ()", file: "file:///C:/example.html", line: 16, column: 13 }
		]);
		expect(destack("a@file:///C:/example.html:19")).toEqual([
			{ function: "a()", file: "file:///C:/example.html", line: 19, column: null }
		]);
		expect(destack("@debugger eval code:21:9")).toEqual([
			{ function: "function ()", file: "", line: 21, column: 9 }
		]);
		const stack1 = [
			"trace@file:///C:/example.html:9:17",
			"@file:///C:/example.html:16:13",
			"a@file:///C:/example.html:19", // No column.
			"@debugger eval code:21:9" // Console.
		];
		expect(destack(stack1.join("\n"))).toEqual([
			{ function: "trace()", file: "file:///C:/example.html", line: 9, column: 17 },
			{ function: "function ()", file: "file:///C:/example.html", line: 16, column: 13 },
			{ function: "a()", file: "file:///C:/example.html", line: 19, column: null },
			{ function: "function ()", file: "", line: 21, column: 9 }
		]);
		// Safari.
		expect(destack("def")).toEqual([{ function: "def()", file: "", line: null, column: null }]);
		const stack2 = [
			"def",
			"global code",
			"evaluateWithScopeExtension@[native code]",
			"_evaluateOn",
			"_evaluateAndWrap"
		];
		expect(destack(stack2.join("\n"))).toEqual([
			{ function: "def()", file: "", line: null, column: null },
			{ function: "function ()", file: "", line: null, column: null },
			{ function: "evaluateWithScopeExtension()", file: "", line: null, column: null },
			{ function: "_evaluateOn()", file: "", line: null, column: null },
			{ function: "_evaluateAndWrap()", file: "", line: null, column: null }
		]);
	});
});
