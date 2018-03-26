# Blork! Mini runtime type checking in Javascript

[![Build Status](https://travis-ci.org/dhoulb/blork.svg?branch=master)](https://travis-ci.org/dhoulb/blork)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/dm/blork.svg)](https://www.npmjs.com/package/blork)

A mini type checker for locking down the external edges of your code. Mainly for use in modules when you don"t know who'll be using the code. Minimal boilerplate code keeps your functions hyper readable and lets them be their beautiful minimal best selves (...or something?)

Blork is fully unit tested and 100% covered (if you're into that!).

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
import { args } from "blork";

// An exported function other (untrusted) developers may use.
export default function myFunc(definitelyString, optionalNumber)
{
	// Check the args.
	args(arguments, ["string", "number?"]);

	// Rest of the function.
	return "It passed!";
}

// Call with good args.
myFunc("abc", 123); // Returns "It passed!"
myFunc("abc"); // Returns "It passed!"

// Call with invalid args.
myFunc(123); // Throws TypeError "arguments[0]: Must be string (received 123)"
myFunc("abc", "abc"); // Throws TypeError "arguments[1]: Must be number (received "abc")"
myFunc(); // Throws TypeError "arguments[0]: Must be string (received undefined)"
myFunc("abc", 123, true); // Throws TypeError "arguments: Too many arguments (expected 2) (received 3)"
```

### check(): Check individual values

The `check()` function allows you to test individual values with more granularity. The `check()` function is more versatile and allows more use cases than validating function input arguments.

`check()` can be passed three arguments:

1. `value` | The value to check
2. `type` | The type to check the value against (list of types is available below)
3. An optional string name for the value, which is prepended to any error message thrown to help debugging

```js
import { check } from "blork";

// Checks that pass.
check("Sally", "string"); // Returns 1
check("Sally", String); // Returns 1

// Checks that fail.
check("Sally", "number"); // Throws TypeError "Must be a number (received "Sally")"
check("Sally", Boolean); // Throws TypeError "Must be true or false (received "Sally")"

// Checks that fail (with a name set).
check("Sally", "num", "name"); // Throws TypeError "name: Must be a number (received "Sally")"
check(true, "str", "status"); // Throws TypeError "status: Must be a string (received true)"
```

### Checking optional values

Appending `?` question mark to any type string makes it optional. This means it will accept `undefined` in addition to the specified type.

```js
// This check fails because it"s not optional.
check(undefined, "number"); // Throws TypeError "Must be a number (received undefined)"

// This check passes because it"s optional.
check(undefined, "number?"); // Returns 0

// Null does not count as optional.
check(null, "number?"); // Throws TypeError "Must be a number (received null)"
```

_`check()` and `args()` return the number of **defined** values that passed. i.e. If a check passes because it"s optional it will return `0` as shown above._

### Checking objects and arrays

Blork can perform deep checks on objects and arrays to ensure the schema is correct. To do object or array checks pass literal arrays or literal objects to `check()` or `args()`:

```js
// Check object properties.
check({ name: "Sally" }, { name: "string" }); // Returns 1

// Check all array items.
check(["Sally", "John", "Sonia"], ["str"]); // Returns 3

// Check tuple-style array.
check([1029, "Sonia"], ["number", "string"]); // Returns 2

// Failing checks.
check({ name: "Sally" }, { name: "string" }); // Returns 1
check(["Sally", "John", "Sonia"], ["str"]); // Returns 3
check([1029, "Sonia"], ["number", "string"]); // Returns 2
check([1029, "Sonia", true], ["number", "string"]); // Throws TypeError: "Array: Too many array items (expected 2) (received 3)"
```

Arrays and objects can be deeply nested within each other and Blork will recursively check the schema _all_ the way down:

```js
// Deeply nested check (passes).
// Will return 1
check(
	[
		{ id: 1028, name: "Sally", status: [1, 2, 3] },
		{ id: 1062, name: "Bobby", status: [1, 2, 3] }
	],
	[
		{ id: Number, name: String, status: [Number] }
	]
);

// Deeply nested check (fails).
// Will throw TypeError "Array[1][status][2]: Must be a number (received "not_a_number")"
check(
	[
		{ id: 1028, name: "Sally", status: [1, 2, 3] },
		{ id: 1062, name: "Bobby", status: [1, 2, "not_a_number"] }
	],
	[
		{ id: Number, name: String, status: [Number] }
	]
);
```

### add(): Add a custom checker type

Register your own checker using the `add()` function. If you're going to be applying the same check over and over and want a custom type that's integrated with Blork's built-in types and has consistent error messages, this is a great way to go.

```js
import { add, check } from "blork";

// Register your new checker.
add("catty", (v) => {
	// Check it"s a string containing "cat", or return an error message.
	return typeof v === "string" && v.indexOf("cat") >= 0 || "Must be a string containing 'cat'";
});

// Passes.
check("That cat is having fun", "catty"); // Returns 1.

// Fails.
check("A dog sits on the chair", "catty"); // Throws TypeError "Must be a string containing "cat" (received "A dog sits on the chair")"
```

```js
import { add, args } from "blork";

// Use your checker to check function args.
function myFunc(str)
{
	args(arguments, ["catty"]);
	return "It passed!";
}

// Passes.
myFunc("That cat is chasing string"); // Returns "It passed!"

// Fails.
myFunc("A dog sits over there"); // Throws TypeError "arguments[1]: Must be a string containing "cat" (received "A dog sits over there")"
```

### throws(): Set a custom error constructor

To change the error object Blork throws when a type doesn't match, use the `throws()` function.

```js
import { throws, check } from "blork";

// Make a custom error type for yourself.
class MyError extends Error {};

// Register your custom error type.
throws(MyError);

// Test a value.
check(true, "false"); // Throws MyError "Must be false (received true)"
```

### blork(): Create an independent instance of Blork

To create an instance of Blork with an independent set of checkers (added with `add()`) and an independently set `throws()` error object, use the `blork()` function.

This functionality is provided so you can ensure multiple versions of Blork in submodules of the same project don't interfere with each other, even if they have been (possibly purposefully) deduped in npm. 

```js
import { blork } from "blork";

// Create a new set of functions from Blork.
const { check, add, throws } = blork();

// Set a new custom error on the new instance.
throws(class CustomError extends TypeError);

// Add a custom checker on the new instance.
add("mychecker", v => v === "abc" || "Must be 'abc'");

// Try to use the custom checker.
check("123", "mychecker"); // Throws CustomChecker("Must be 'abc' (received '123')")
```

## Types

### String types

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
| `arraylike`                     | Any object, not just arrays, with numeric **.length** property
| `arguments`, `args`             | Arguments objects (any object, not just arrays, with numeric **.length** property)
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
| `regex`, `regexp`               | Instances of **RegExp** (regular expressions)
| `any`, `mixed`                  | Allow any value (transparently passes through with no error)

```js
// Pass.
check("abc", "str"); // Returns 1
check("abc", "lower"); // Returns 1
check(100, "whole"); // Returns 1
check([1, 2, 3], "array+"); // Returns 1
check(new Date(2180, 1, 1), "future"); // Returns 1

// Fail.
check(123, "str"); // Throws TypeError "Must be string (received 123)"
check({}, "object+"); // Throws TypeError "Must be object with one or more properties (received Object(0))"
check([], "array+"); // Throws TypeError "Must be array with one or more items (received Array(0))"
```

### Optional string types

Any type can be made optional by appending a `?` question mark to the type reference. This means the check will also accept `undefined` in addition to the specified type.

Note: If the check passes because the value was optional (and `undefined` was received), `check()` and `args()` do not increment their return count (of defined values), and will return 1.

```js
// Pass.
check(undefined, "str?"); // Returns 0 (not 1)
check(undefined, "lower?"); // Returns 0 (not 1)
check(undefined, "whole?"); // Returns 0 (not 1)
check([undefined, undefined, 123], ["number?"]); // Returns 1 (not 3)

// Fail.
check(123, "str?"); // Throws TypeError "Must be string (received 123)"
check(null, "str?"); // Throws TypeError "Must be string (received null)"
```

### Combined string types

You can use `&` and `|` to join string types together, to form AND and OR chains of allowed types. This allows you to compose together more complex types like `number | string` or `date | number | null` or `string && custom-checker`

`|` is used to create an OR type, meaning any of the values is valid, e.g. `number|string` or `string | null`

```js
// Pass.
check(123, "str|num"); // Returns 1
check("a", "str|num"); // Returns 1

// Fail.
check(null, "str|num"); // Throws TypeError "Must be string or number (received null)"
check(null, "str|num|bool|func|obj"); // Throws TypeError "Must be string or number or boolean or function or object (received null)"
```

`&` is used to create an AND type, meaning the value must pass _all_ of the checks to be valid. This is primarily useful for custom checkers e.g. `lower & username-unique`.

```js
// Pass.
check("this cat is crazy!", "lower & catty"); // Returns 1
check("THIS cat is crazy!", "string & catty"); // Returns 1

// Fail.
check(null, "str & num"); // Throws TypeError "Must be string and number (received null)"
```

Note: `&` has a higher precedence than `|`, meaning a type like `string & lower | upper` compiles to `(lower | upper) & string`.

Note: All built in checkers like `lower` or `int+` already check the basic type of a value, so there's no need to use `string & lower` or `number & int+`. These will work but you'll be double checking.

Note: Spaces around the `&` or `|` are not required (but can be more readable).

### Constructor and constant types

For convenience some constructors (e.g. `String`) and constants (e.g. `null`) can be used as types in `args()` and `check()`. The following built-in objects and constants are supported:

| Type        | Description                  |
|-------------|------------------------------|
| `Boolean`   | Same as **'boolean'** type   |
| `String`    | Same as **'string'** type    |
| `Number`    | Same as **'number'** type    |
| `true`      | Same as **'true'** type      |
| `false`     | Same as **'false'** type     |
| `null`      | Same as **'null'** type      |
| `undefined` | Same as **'undefined'** type |

You can pass in _any_ class name, and Blork will check the value using `instanceof` and generate a corresponding error message if the type doesn't match. 

Using `Object` and `Array` constructors will work also and will allow any object that is `instanceof Object` or `instanceof Array`. _Note: this is not the same as e.g. the `'object'` and `'array'` string types, which only allow plain objects an arrays (but will reject objects of custom classes extending `Object` or `Array`)._

```js
// Pass.
check(true, Boolean); // Returns 1
check("abc", String); // Returns 1
check(123, Number); // Returns 1
check(new Date, Date); // Returns 1
check(new MyClass, MyClass); // Returns 1
check(Promise.resolved(true), Promise); // Returns 1
check([true, true, false], [Boolean]); // Returns 3
check({ name: 123 }, { name: Number }); // Returns 1

// Fail.
check("abc", Boolean); // Throws TypeError "Must be true or false (received "abc")"
check("abc", String); // Throws TypeError "Must be a string (received "abc")"
check("abc", String, "myVar"); // Throws TypeError "myVar: Must be a string (received "abc")"
check(new MyClass, OtherClass); // Throws TypeError "Must be an instance of OtherClass (received MyClass)"
check({ name: 123 }, { name: String }); // Throws TypeError "name: Must be a string (received 123)"
check({ name: 123 }, { name: String }, "myObj"); // Throws TypeError "myObj[name]: Must be a string (received 123)"
```

### Object literal type

To check the types of object properties, use a literal object as a type. You can also deeply nest these properties and the types will be checked recursively and will generate useful debuggable error messages.

_Note: it is fine for objects to contain additional properties that don't have a type specified._

```js
// Pass.
check({ name: "abc" }, { name: "str" }); // Returns 1
check({ name: "abc" }, { name: "str?", age: "num?" }); // Returns 1 (age is optional)
check({ name: "abc", additional: true }, { name: "str" }); // Returns 1 (additional properties are fine)

// Fail.
check({ age: "apple" }, { age: "num" }); // Throws TypeError "age: Must be a number (received "apple")"
check({ size: { height: 10, width: "abc" } }, { size: { height: "num", width: "num" } }); // Throws TypeError "size[width]: Must be a number (received "abc")"
```

### Object literal type (with additional properties)

To check that the type of **all** properties in an object all conform to a type, use an `ANY` key. This allows you to check objects that don't have known keys (e.g. from user generated data). This is similar to how indexer keys work in Flow or Typescript.

```js
import { check, ANY } from "blork";

// Pass.
check({ a: 1, b: 2, c: 3 }, { [ANY]: "num" }); // Returns 3
check({ name: "Dan", a: 1, b: 2, c: 3 }, { name: "str", [ANY]: "num" }); // Returns 4

// Fail.
check({ a: 1, b: 2, c: "abc" }, { [ANY]: "num" }); // Throws TypeError "c: Must be a number (received "abc")"
```

If you wish you can use this functionality with the `undefined` type to ensure objects **do not** contain additional properties (object literal types by default are allowed to contain additional properties).

```js
// Pass.
check({ name: "Carl" }, { name: "str", [ANY]: "undefined" }); // Returns 1;

// Fail.
check({ name: "Jess", another: 28 }, { name: "str", [ANY]: "undefined" }); // Throws TypeError "another: Must be undefined (received 28)"
```

### Array literal type

To check an array where all items conform to a specific type, pass an array as the type. Arrays and objects can be deeply nested to check types recursively.

```js
// Pass.
check(["abc", "abc"], ["str"]); // Returns 2
check([123, 123], ["num"]); // Returns 2
check([{ names: ["Alice", "John"] }], [{ names: ["str"] }]); // Returns 1

// Fail.
check(["abc", "abc", 123], ["str"]); // Throws TypeError "Array[2]: Must be a number (received 123)"
check(["abc", "abc", 123], ["number"]); // Throws TypeError "Array[0]: Must be a string (received "abc")"
```

### Array tuple type

Similarly, to check the format of tuples, pass an array with two or more items as the type. _If two or more types are in an type array, it is considered a tuple type and will be rejected if it does not conform exactly to the tuple._

```js
// Pass.
check([123, "abc"], ["num", "str"]); // Returns 2
check([123, "abc"], ["num", "str", "str?"]); // Returns 2 (third item is optional)

// Fail.
check([123], ["num", "str"]); // Throws TypeError "Array[1]: Must be a string (received undefined)"
check([123, 123], ["num", "str"]); // Throws TypeError "Array[1]: Must be a string (received 123)"
check([123, "abc", true], ["num", "str"]); // Throws TypeError "Array: Too many items (expected 2 but received 3)"
```

## Contributing

Please see (CONTRIBUTING.md)

## Roadmap

- [ ] Support `@decorator` syntax for class methods (PRs welcome)