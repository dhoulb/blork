const { BlorkError } = require('../lib/errors');

// Tests.
describe('debug()', () => {
	test('Return the correct debug string for different types', () => {
		expect(new BlorkError()).toHaveProperty('message');
		expect(new BlorkError('abc')).toHaveProperty('message', 'abc');
	});
});