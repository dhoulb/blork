const { BlorkError } = require('../lib/errors');
const { checkers } = require('../lib/checkers');
const { check, args, add, throws } = require('../lib/blork');

// Tests.
describe('add()', () => {
	test('Add and run a custom checker', () => {
		// Define a checker called 'isstring'.
		expect(add('test.checker', v => typeof v === 'string' || 'must be string')).toBeUndefined();

		// Check a passing value.
		expect(check('abc', 'test.checker')).toBe(1);

		// Check a failing value.
		expect(() => check(123, 'test.checker')).toThrow(TypeError);
	});
	test('Throw BlorkError if not non-empty lowercase string', () => {
		const func = () => {};
		expect(() => add(123, func)).toThrow(BlorkError);
		expect(() => add('', func)).toThrow(BlorkError);
		expect(() => add('UPPER', func)).toThrow(BlorkError);
	});
	test('Throw BlorkError if passing a non-function', () => {
		expect(() => add('test.checker.nonfunction', true)).toThrow(BlorkError);
	});
	test('Throw BlorkError if same name as existing', () => {
		const func = () => {};
		add('test.checker.samename', func);
		expect(() => add('test.checker.samename', func)).toThrow(BlorkError);
	});
});