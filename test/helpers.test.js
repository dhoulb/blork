const { debug } = require('../lib/helpers');

// Tests.
describe('debug()', () => {
	test('Return the correct debug string for different types', () => {
		expect(debug('abc')).toBe('"abc"');
		expect(debug('a"b"c')).toBe('"a\\\"b\\\"c"');
		expect(debug(123)).toBe('123');
		expect(debug(NaN)).toBe('NaN');
		expect(debug(Infinity)).toBe('Infinity');
		expect(debug(-Infinity)).toBe('-Infinity');
		expect(debug(true)).toBe('true');
		expect(debug(false)).toBe('false');
		expect(debug(null)).toBe('null');
		expect(debug(undefined)).toBe('undefined');
		expect(debug(/abc/)).toBe('/abc/');
		expect(debug({})).toBe('{}');
		expect(debug({ a: 1 })).toBe(`{
	"a": 1
}`);
		expect(debug([])).toBe('[]');
		expect(debug([1,2,3])).toBe(`[
	1,
	2,
	3
]`);
		expect(debug(function () {})).toBe('anonymous function');
		expect(debug(function dog() {})).toBe('dog()');
		expect(debug(new class MyClass {})).toBe('instance of MyClass');
		expect(debug(new class {})).toBe('instance of anonymous class');
		expect(debug(Symbol('abc'))).toBe('Symbol(abc)');
		expect(debug(TypeError('My error message'))).toBe('TypeError "My error message"');
	});
});