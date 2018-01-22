# Blork! Mini runtime type checking in Javascript

[![Build Status](https://travis-ci.org/dhoulb/blork.svg?branch=master)](https://travis-ci.org/dhoulb/blork)

A mini type checker for locking down the external edges of your code. Mainly for use in modules when you don't know who'll be using the code. Minimal boilerplate code keeps your functions hyper readable and lets them be their beautiful minimal best selves (...or something?)

Everything is unit tested and everything has TypeScript types (if you're into that!).

## Installation

```sh
npm install blork
```

## Usage

### args(): Check function arguments

The primary use case of Blork is validating function input arguments. The `args()` function is provided for this purpose, and should be passed two arguments:

1. `arguments` | The **arguments** object provided automatically to functions in Javascript
2. `types` | An array identifying the types for the arguments (list of types is available below)

```js
import { args } from 'blork';

// An exported function other (untrusted) developers may use.
export default function myFunc(definitelyString, optionalNumber)
{
	// Check the args.
	args(arguments, ['string', 'number?']);

	// Rest of the function.
	return 'It passed!';
}

// Call with good args.
myFunc('abc', 123); // Returns "It passed!"
myFunc('abc'); // Returns "It passed!"

// Call with invalid args.
myFunc(123); // Throws TypeError "arguments[0]: Must be string (received 123)"
myFunc('abc', 'abc'); // Throws TypeError "arguments[1]: Must be number (received 'abc')"
myFunc(); // Throws TypeError "arguments[0]: Must be string (received undefined)"
myFunc('abc', 123, true); // Throws TypeError "arguments: Too many arguments (expected 2) (received 3)"
```

### check(): Check individual values

The `check()` function allows you to test individual values with more granularity. The `check()` function is more versatile and allows more use cases than validating function input arguments.

`check()` can be passed three arguments:

1. `value` | The value to check
2. `type` | The type to check the value against (list of types is available below)
3. An optional string name for the value, which is prepended to any error message thrown to help debugging

```js
import { check } from 'blork';

// Checks that pass.
check('Sally', 'string'); // Returns 1
check('Sally', String); // Returns 1

// Checks that fail.
check('Sally', 'number'); // Throws TypeError "Must be a number (received 'Sally')"
check('Sally', Boolean); // Throws TypeError "Must be true or false (received 'Sally')"

// Checks that fail (with a name set).
check('Sally', 'num', 'name'); // Throws TypeError "name: Must be a number (received 'Sally')"
check(true, 'str', 'status'); // Throws TypeError "status: Must be a string (received true)"
```

### Checking optional values

Appending `?` question mark to any type string makes it optional. This means it will accept `undefined` in addition to the specified type.

```js
// This check fails because it's not optional.
check(undefined, 'number'); // Throws TypeError "Must be a number (received undefined)"

// This check passes because it's optional.
check(undefined, 'number?'); // Returns 0

// Null does not count as optional.
check(null, 'number?'); // Throws TypeError "Must be a number (received null)"
```

_`check()` and `args()` return the number of **defined** values that passed. i.e. If a check passes because it's optional it will return `0` as shown above._

### Checking objects and arrays

Blork can perform deep checks on objects and arrays to ensure the schema is correct. To do object or array checks pass literal arrays or literal objects to `check()` or `args()`:

```js
// Check object properties.
check({ name: 'Sally' }, { name: 'string' }); // Returns 1

// Check all array items.
check(['Sally', 'John', 'Sonia'], ['str']); // Returns 3

// Check tuple-style array.
check([1029, 'Sonia'], ['number', 'string']); // Returns 2

// Failing checks.
check({ name: 'Sally' }, { name: 'string' }); // Returns 1
check(['Sally', 'John', 'Sonia'], ['str']); // Returns 3
check([1029, 'Sonia'], ['number', 'string']); // Returns 2
check([1029, 'Sonia', true], ['number', 'string']); // Throws TypeError: "Array: Too many array items (expected 2) (received 3)"
```

Arrays and objects can be deeply nested within each other and Blork will recursively check the schema _all_ the way down:

```js
// Deeply nested check (passes).
// Will return 1
check(
	[
		{ id: 1028, name: 'Sally', status: [1, 2, 3] },
		{ id: 1062, name: 'Bobby', status: [1, 2, 3] }
	],
	[
		{ id: Number, name: String, status: [Number] }
	]
);

// Deeply nested check (fails).
// Will throw TypeError "Array[1][status][2]: Must be a number (received 'not_a_number')"
check(
	[
		{ id: 1028, name: 'Sally', status: [1, 2, 3] },
		{ id: 1062, name: 'Bobby', status: [1, 2, 'not_a_number'] }
	],
	[
		{ id: Number, name: String, status: [Number] }
	]
);
```

### add(): Add a custom checker type

Register your own checker using the `add()` function. If you're going to be applying the same check over and over and want a custom type that's integrated with Blork's built-in types and has consistent error messages, this is a great way to go.

```js
import { add, check } from 'blork';

// Register your new checker.
add('catty', (v) => {
	// Check it's a string containing 'cat', or return an error message.
	return typeof v === 'string' && v.indexOf('cat') >= 0 || "Must be a string containing 'cat'";
});

// Passes.
check('That cat is having fun', 'catty'); // Returns 1.

// Fails.
check('A dog sits on the chair', 'catty'); // Throws TypeError "Must be a string containing 'cat' (received 'A dog sits on the chair')"
```

```js
import { add, args } from 'blork';

// Use your checker to check function args.
function myFunc(str)
{
	args(arguments, ['catty']);
	return 'It passed!';
}

// Passes.
myFunc('That cat is chasing string'); // Returns "It passed!"

// Fails.
myFunc('A dog sits over there'); // Throws TypeError "arguments[1]: Must be a string containing 'cat' (received 'A dog sits over there')"
```

### throws(): Set a custom error constructor

To change the error object Blork throws when a type doesn't match, use the `throws()` function.

```js
import { throws, check } from 'blork';

// Make a custom error type for yourself.
class MyError extends Error {};

// Register your custom error type.
throws(MyError);

// Test a value.
check(true, 'false'); // Throws MyError "Must be false (received true)"
```

## Types

Types are generally accessed via a string reference. This list shows all Blork built-in checkers:

| Type string reference           | Description
|---------------------------------|-------------------
| `null`                          | Value is **null**
| `undefined`, `undef`, `void`    | Value is **undefined**
| `defined`, `def`                | Value is **not undefined**
| `boolean`, `bool`               | Value is **true** or **false**
| `true`                          | Value is **true**
| `false`                         | Value is **false**
| `truthy`                        | Any truthy values (i.e. **== true**)
| `falsy`                         | Any falsy values (i.e. **== false**)
| `number`, `num`                 | Numbers excluding NaN/Infinity (using **typeof** and finite check) 
| `number+`, `num+`               | Numbers more than or equal to zero
| `number-`, `num-`               | Numbers less than or equal to zero
| `integer`, `int`                | Integers (using **Number.isInteger()**)
| `integer+`, `int+`              | Positive integers including zero
| `integer-`, `int-`              | Negative integers including zero
| `string`, `str`                 | Strings (using **typeof**)
| `string+`, `str+`               | Non-empty strings (using **str.length**)
| `lowercase`, `lower`            | Strings with no uppercase characters
| `lowercase+`, `lower+`          | Non-empty strings with no uppercase characters
| `uppercase`, `upper`            | Strings with no lowercase characters
| `uppercase+`, `upper+`          | Non-empty strings with no lowercase characters
| `function`, `func`              | Functions (using **instanceof Function**)
| `object`, `obj`                 | Plain objects (using **instanceof Object** and constructor check)
| `object+`, `obj+`               | Plain objects with one or more properties (using **Object.keys().length**)
| `objectlike`                    | Any object-like object (using **instanceof Object**)
| `iterable`                      | Objects with a **Symbol.iterator** method (that can be used with **for..of** loops)
| `array`, `arr`                  | Plain instances of Array (using **instanceof Array** and constructor check) 
| `array+`, `arr+`                | Plain instances of **Array** with one or more items
| `arraylike`                     | Any object inheriting **Array**
| `map`                           | Instances of **Map**
| `map+`                          | Instances of **Map** with one or more items
| `weakmap`                       | Instances of **WeakMap**
| `set`                           | Instances of **Set**
| `set+`                          | Instances of **Set** with one or more items
| `weakset`                       | Instances of **WeakSet**
| `promise`                       | Instances of **Promise**
| `date`                          | Instances of **Date**
| `date+`, `future`               | Instances of **Date** with a value in the future
| `date-`, `past`                 | Instances of **Date** with a value in the past
| `arguments`, `args`             | Arguments (any object, not just arrays, with numeric **.length** property)

```js
// Pass.
check('abc', 'str'); // Returns 1
check('abc', 'lower'); // Returns 1
check(100, 'whole'); // Returns 1
check([1, 2, 3], 'array+'); // Returns 1
check(new Date(2180, 1, 1), 'future'); // Returns 1

// Fail.
check(123, 'str'); // Throws TypeError "Must be string (received 123)"
check({}, 'object+'); // Throws TypeError "Must be object with one or more properties (received Object(0))"
check([], 'array+'); // Throws TypeError "Must be array with one or more items (received Array(0))"
```

Any type can be made optional by appending a `?` question mark to the type reference. This means the check will also accept `undefined` in addition to the specified type.

Note: If the check passes because the value was optional (and `undefined` was received), `check()` and `args()` do not increment their return count (of defined values), and will return 1.

```js
// Pass.
check(undefined, 'str?'); // Returns 0 (not 1)
check(undefined, 'lower?'); // Returns 0 (not 1)
check(undefined, 'whole?'); // Returns 0 (not 1)
check([undefined, undefined, 123], ['number?']); // Returns 1 (not 3)

// Fail.
check(123, 'str?'); // Throws TypeError "Must be string (received 123)"
check(null, 'str?'); // Throws TypeError "Must be string (received null)"
```

For convenience constructors can also be used as types in `args()` and `check()`. The following built-in objects can be used:

| Type      | Description                |
|-----------|----------------------------|
| `Boolean` | Same as **'boolean'** type |
| `String`  | Same as **'string'** type  |
| `Number`  | Same as **'number'** type  |
| `Array`   | Same as **'array'** type   |
| `Object`  | Same as **'object'** type  |

You can also pass in _any_ class name, and Blork will check the value using `instanceof` and generate a corresponding error message if the type doesn't match.

```js
// Pass.
check(true, Boolean); // Returns 1
check('abc', String); // Returns 1
check(123, Number); // Returns 1
check(new Date, Date); // Returns 1
check(new MyClass, MyClass); // Returns 1
check(Promise.resolved(true), Promise); // Returns 1
check([true, true, false], [Boolean]); // Returns 3
check({ name: 123 }, { name: Number }); // Returns 1

// Fail.
check('abc', Boolean); // Throws TypeError "Must be true or false (received 'abc')"
check('abc', String); // Throws TypeError "Must be a string (received 'abc')"
check('abc', String, 'myVar'); // Throws TypeError "myVar: Must be a string (received 'abc')"
check(new MyClass, OtherClass); // Throws TypeError "Must be an instance of OtherClass (received MyClass)"
check({ name: 123 }, { name: String }); // Throws TypeError "name: Must be a string (received 123)"
check({ name: 123 }, { name: String }, 'myObj'); // Throws TypeError "myObj[name]: Must be a string (received 123)"
```

To check the types of object properties, pass an object as the type. You can also deeply nest these properties and the types will be checked recursively and will generate useful debuggable error messages.

```js
// Pass.
check({ name: 'abc' }, { name: 'str' }); // Returns 1
check({ name: 'abc' }, { name: 'str?', age: 'num?' }); // Returns 1 (age is optional)

// Fail.
check({ age: '28' }, { age: 'num' }); // Throws TypeError "age: Must be a number (received '28')"
```

To check an array where all items conform to a specific type, pass an array as the type. Other objects and arrays can be nested to check types recursively.

```js
// Pass.
check(['abc', 'abc'], ['str']); // Returns 2
check([123, 123], ['num']); // Returns 2

// Fail.
check(['abc', 'abc', 123], ['str']); // Throws TypeError "Array[2]: Must be a number (received 123)"
check(['abc', 'abc', 123], ['number']); // Throws TypeError "Array[0]: Must be a string (received 'abc')"
```

Similarly, to check the format of tuples, pass an array with two or more items as the type. _If two or more items are in the array, it is considered a tuple type._

```js
// Pass.
check([123, 'abc'], ['num', 'str']); // Returns 2
check([123, 'abc'], ['num', 'str', 'str?']); // Returns 2 (third item is optional)

// Fail.
check([123], ['num', 'str']); // Throws TypeError "Array[1]: Must be a string (received undefined)"
check([123, 123], ['num', 'str']); // Throws TypeError "Array[1]: Must be a string (received 123)"
check([123, 'abc', true], ['num', 'str']); // Throws TypeError "Array: Too many items (expected 2 but received 3)"
```

## Contributing

Please see (CONTRIBUTING.md)

## Roadmap

- [ ] Support `@decorator` syntax for class methods (PRs welcome)