# Blork! Mini (non-static) argument checking in Javascript

[![Build Status](https://travis-ci.org/dhoulb/blork.svg?branch=master)](https://travis-ci.org/dhoulb/blork)

A mini type checker for locking down the external edges of your code. Mainly for use in modules when you don't know who'll be using the code. Minimal boilerplate code keeps your functions hyper readable and lets them be their beautiful minimal best selves (...or something?)

Everything is unit tested and everything has TypeScript types (if you're into that!).

## Installation

```
npm install blork
```

## Usage

### Checking function arguments

The primary use case of Blork is validating function input arguments. The `args()` function is provided for this purpose, and should be passed two arguments:

1. `arguments` — The **arguments** object provided automatically to functions in Javascript
2. `types` — An array identifying the types for the arguments (list of types is available below)

```js
import { args } from 'blork';

// An exported function other (untrusted) developers may use.
export default function myFunc(definitelyString, optionalNumber)
{
	// Check the args.
	args(arguments, ['string', 'number?']);

	// Rest of the function.
	return true;
}

// Call with good args.
myFunc('abc', 123); // Returns true
myFunc('abc'); // Returns true

// Call with invalid args.
myFunc(123); // Throws TypeError "arguments[0]: Must be string (received 123)"
myFunc('abc', 'abc'); // Throws TypeError "arguments[1]: Must be number (received 'abc')"
myFunc(); // Throws TypeError "arguments[0]: Must be string (received undefined)"
myFunc('abc', 123, true); // Throws TypeError "Too many arguments (expected 2 but received 3)"
```

### Checking individual values

The `args()` function is a convenient wrapper for the `check()` function, which allows you to test individual values and more. The `check()` function is more versatile and allows more use cases than validating function input arguments.

`check()` can be passed three arguments:

1. `value` — The value to check
2. `type` — The type to check the value against (list of types is available below)
3. An optional string name for the value, which is prepended to any error message thrown to help debugging

```js
import { check } from 'blork';

// Check that passes.
check('Sally', 'string'); // Returns 1

// Check that fails.
check('Sally', 'number'); // Throws TypeError "Must be a number (received 'Sally')"

// Check that fails (with a name set).
check('Sally', 'number', 'name'); // Throws TypeError "name: Must be a number (received 'Sally')"
```

### Optional values

Appending `?` question mark to any type string makes it optional. This means it will accept `undefined` in addition to the specified type.

```js
// This check fails.
check(undefined, 'number'); // Throws TypeError "Must be a number (received 'Sally')"

// This check passes (because it's optional).
check(undefined, 'number?'); // Returns 0

// Null does not count as optional.
check(null, 'number?'); // Throws TypeError "Must be a number (received null)"
```

_`check()` and `args()` return the number of defined values that passed their tests. i.e. If a single-value check doesn't throw an error because it's optional, it will return `0` as shown above._

### Checking objects and arrays

Blork can perform deep checks on objects and arrays to ensure the schema is correct _all_ the way down. To use this pass an array or object `check()` (or to to `args()`).

```js
// Check object properties.
check({ name: 'Sally' }, { name: 'string' }); // Returns 1

// Check all array items.
check(['Sally', 'John', 'Sonia'], ['string']); // Returns 3

// Check tuple-style array.
check([1029, 'Sonia'], ['number', 'string']); // Returns 2

// Check deep object properties.
check(
	{ owner: { id: 1028, name: 'Sally' }},
	{ owner: { id: 'num', name: 'str' }}
);
```

### Add a custom checker

Register your own checker using the `add()` function. If you're going to be applying the same check over and over and want to make sure your error messages are consistent, or want your custom type to clean and integrated with our built-in types, this is a great way to go.

```js
import { add, check, args } from 'blork';

// Register your new checker.
add('catty', (v) => { 
	// Check it's a string starting with 'cat', or return an error message.
	return typeof v === 'string' && v.indexOf('cat') >= 0 || "Must be a string containing 'cat'"; 
}

// Check some strings with your checker.
check('That cat is having fun', 'catty'); // Returns true.
check('A dog sits on the chair', 'catty'); // Throws TypeError "Must be a string containing 'cat' (received 'A dog sits on the chair')"

// Use your checker to check function args.
function myFunc(str)
{
	args(arguments, ['catty']);
	return true;
}

// Try out your custom function.
myFunc('That cat is chasing string'); // Returns true.
myFunc('A dog sits over there'); // Throws TypeError "arguments[1]: Must be a string containing 'cat' (received 'A dog sits over there')"
```

### Custom error type

To change the error type Blork throws when a type doesn't match, use the `throws()` function.

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

Types are generally accessed via a string reference. The following list shows all checkers available in Blork:

- `'null'` — The value is null.
- `'undefined`, `'undef'`, `'void'` — Passes if the value is **undefined**
- `'defined`, `'def'` — Passes if the value is not **undefined**
- `'boolean'` or `'bool'` — Passes if the value is **true** or **false**
- `'true'` — Passes if the value is **true**
- `'false'` — Passes if the value is **false**
- `'truthy'` — Passes if the value is like **true** (i.e. **== true**)
- `'falsy'` — Passes if the value is like **true** (i.e. **== false**)
- `'number'` or `'num'` — Passes if the value is a number (checked using **typeof**)
- `'integer'` or `'int'` — Passes if the value is an integer (using **Number.isInteger()**)
- `'natural'` — Passes if the value is a natural number (1, 2, 3...)
- `'whole'` — Passes if the value is a whole number (1, 2, 3...)
- `'finite'` — Passes if the value is a finite number (not **NaN** or **Infinity**)
- `'string'` or `'str'` — Passes if the value is a string (checked using **typeof**)
- `'string+'` or `'str+'` — Passes if the value is a non-empty string
- `'lowercase'` or `'lower'` — Passes if the value is a string with no uppercase characters
- `'lowercase+'` or `'lower+'` — Passes if the value is a non-empty string with no uppercase characters
- `'uppercase'` or `'upper'` — Passes if the value is a non-empty string with no lowercase characters
- `'uppercase+'` or `'upper+'` — Passes if the value is a non-empty string with no lowercase characters
- `'function'` or `'func'` — Passes if the value is a function (checked using **instanceof Function**)
- `'object'` or `'obj'` — Passes if the value is an object (checked using **instanceof Object**)
- `'object+'` or `'obj'` — Passes if the value is an object with one or more enumerable properties (using **Object.keys()**)
- `'iterable'` — An object with a method called **Symbol.iterator** that can be used with **for..of** loops
- `'array'` or `'arr'` — An instance of **Array**
- `'array+'` or `'arr+'` — An instance of **Array** with one or more entries
- `'map'` — An instance of **Map**
- `'map+'` — An instance of **Map** with one or more entries
- `'weakmap'` — An instance of **WeakMap**
- `'set'` — An instance of **Set**
- `'set+'` — An instance of **Set** with one or more entries
- `'weakset'` — An instance of **WeakSet*
- `'arguments'` or `'args'` — An **arguments** object (i.e. an object with a numeric **length** property, not an array)
- `'promise'` — An instance of **Promise**
- `'date'` — An instance of **Date**
- `'future'` — An instance of **Date** with a value in the future
- `'past'` — An instance of **Date** with a value in the past

```js
// Pass.
check('abc', 'str'); // Returns 1
check('abc', 'lower'); // Returns 1
check(100, 'whole'); // Returns 1
check([1,2,3], 'array+'); // Returns 1
check(new Date(2180, 1, 1), 'future'); // Returns 1

// Fail.
check(123, 'str'); // Throws TypeError "Must be string (received 123)"
check({}, 'object+'); // Throws TypeError "Must be object with one or more properties (received Object(0))"
check([], 'array+'); // Throws TypeError "Must be array with one or more items (received Array(0))"
```

Any type can be made optional by appending a `?` question mark to the type reference. This means the check will also accept `undefined` in addition to the specified type.

Note: If the check passes (doesn't throw an error) because it was optional and `undefined` was passed, the `check()` and `args()` do not add it to their return count.

```js
// Pass.
check(undefined, 'str?'); // Returns 0 (not 1)
check(undefined, 'lower?'); // Returns 0 (not 1)
check(undefined, 'whole?'); // Returns 0 (not 1)

// Fail.
check(123, 'str?'); // Throws TypeError "Must be string (received 123)"
check(null, 'str?'); // Throws TypeError "Must be string (received null)"
```

For convenience constructors can also be used as types in `args()` and `check()`. The following built-in objects can be used:

- `Boolean` — Same as **'boolean'** type
- `String` — Same as **'string'** type
- `Number` — Same as **'number'** type
- `Array` — Same as **'array'** type
- `Object` — Same as **'object'** type

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