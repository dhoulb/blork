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
myFunc(123); // Throws ValueError "arguments[0]: Must be string (received 123)"
myFunc("abc", "abc"); // Throws ValueError "arguments[1]: Must be number (received "abc")"
myFunc(); // Throws ValueError "arguments[0]: Must be string (received undefined)"
myFunc("abc", 123, true); // Throws ValueError "arguments: Too many arguments (expected 2) (received 3)"
```

### check(): Check individual values

The `check()` function allows you to test individual values with more granularity. The `check()` function is more versatile and allows more use cases than validating function input arguments.

`check()` accepts three arguments:

1. `value` The value to check
2. `type` The type to check the value against (list of types is available below)
3. `prefix=""` An optional string name/prefix for the value, which is prepended to any error message thrown to help debugging

```js
import { check } from "blork";

// Checks that pass.
check("Sally", "string"); // No error.
check("Sally", String); // No error.

// Checks that fail.
check("Sally", "number"); // Throws ValueError "Must be number (received "Sally")"
check("Sally", Boolean); // Throws ValueError "Must be true or false (received "Sally")"

// Checks that fail (with a prefix/name set).
check("Sally", "num", "name"); // Throws ValueError "name: Must be number (received "Sally")"
check(true, "str", "status"); // Throws ValueError "status: Must be string (received true)"
```

Another common use for `check()` is to validate an options object:

```js
import { check } from "blork";

// Make a custom function.
function myFunc(options)
{
	// Check all the options with a literal type (note that keepAlive is optional).
	check(options, { name: "string", required: "boolean", keepAlive: "number?" });
}
```

There are more complex types available: Appending `?` question mark to any type string makes it optional (which means it also allows `undefined`). Prepending a `!` exclaimation mark to any type string makes it inverted. Multiple types can be combined with `|` and `&` for OR and AND conditions.

```js
// Optional types.
check(undefined, "number"); // Throws ValueError "Must be number (received undefined)"
check(undefined, "number?"); // No error.

// Note that null does not count as optional.
check(null, "number?"); // Throws ValueError "Must be number (received null)"

// Inverted types.
check(123, "!str"); // No error.
check(123, "!int"); // Throws ValueError "Must be not integer (received 123)"

// Combined OR types.
check(1234, "num | str"); // No error.
check(null, "num | str"); // Throws ValueError "Must be number or string (received null)"

// Combined AND types.
check("abc", "string & !falsy"); // No error.
check("", "string & !falsy"); // Throws ValueError "Must be string and not falsy (received "")"
```

### Checking objects and arrays

Blork can perform deep checks on objects and arrays to ensure the schema is correct. To do object or array checks pass literal arrays or literal objects to `check()` or `args()`:

```js
// Check object properties.
check({ name: "Sally" }, { name: "string" }); // No error.

// Check all array items.
check(["Sally", "John", "Sonia"], ["str"]); // No error.

// Check tuple-style array.
check([1029, "Sonia"], ["number", "string"]); // No error.

// Failing checks.
check({ name: "Sally" }, { name: "string" }); // No error.
check(["Sally", "John", "Sonia"], ["str"]); // No error.
check([1029, "Sonia"], ["number", "string"]); // No error.
check([1029, "Sonia", true], ["number", "string"]); // Throws ValueError: "Array: Too many array items (expected 2) (received 3)"
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
// Will throw ValueError "Array[1][status][2]: Must be number (received "not_a_number")"
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

Register your own checker using the `add()` function. This is great if 1) you're going to be applying the same check over and over, or 2) want to integrate your own checks with Blork's built-in types so your code looks clean.

`add()` accepts four arguments:

1. `name` The name of the custom checker you'll use to reference it later
2. `checker` A function that accepts a single argument, `value`, and returns `true` or `false`.
3. `description=""` An description for the value the checker will accept, e.g. "lowercase string" or "unique username", that is shown in the error message. Defaults to the value of `name`.
4. `error=undefined` A custom class that is thrown when this checker fails (can be _any_ class, not just classes extending `Error`). An error set with `add() takes precedence for this checker over the error set through `throws()`.

```js
import { add, check } from "blork";

// Register your new checker.
add(
	// Name of checker.
	"catty", 
	// Checker to validate a string containing "cat".
	(v) => typeof v === "string" && v.strToLower().indexOf("cat") >= 0,
	// Description of what the variable _should_ contain.
	// Gets shown in the error message.
	"string containing 'cat'"
);

// Passes.
check("That cat is having fun", "catty"); // No error.
check("That CAT is having fun", "catty"); // No error.

// Fails.
check("A dog sits on the chair", "catty"); // Throws ValueError "Must be string containing "cat" (received "A dog sits on the chair")"

// Combine a custom checkers with a built-in checker using `&` syntax.
// The value must pass both checks or an error will be thrown.
// This saves you replicating existing logic in your checker.
check("A CAT SAT ON THE MAT", "upper+ & catty"); // No error.
check("A DOG SAT ON THE MAT", "upper+ & catty"); // Throws ValueError "Must be non-empty uppercase string and string containing 'cat'"
```

```js
import { add, args } from "blork";

// Use your checker to check function args.
function myFunc(str)
{
	// Validate the function's args!
	args(arguments, ["catty"]);

	// Big success.
	return "It passed!";
}

// Passes.
myFunc("That cat is chasing string"); // Returns "It passed!"

// Fails.
myFunc("A dog sits over there"); // Throws ValueError "arguments[1]: Must be string containing "cat" (received "A dog sits over there")"
```

### throws(): Set a custom error constructor

To change the error object Blork throws when a type doesn't match, use the `throws()` function. It accepts a single argument a custom class (can be _any_ class, not just classes extending `Error`).

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

This functionality is provided so you can ensure multiple versions of Blork in submodules of the same project don't interfere with each other, even if they have been (possibly purposefully) deduped in npm. This is how you can ensure if you've set a custom error for a set of checks, that custom error type is always thrown.

```js
import { blork } from "blork";

// Create a new set of functions from Blork.
const { check, args, add, throws } = blork();

// Set a new custom error on the new instance.
throws(class CustomError extends ValueError);

// Add a custom checker on the new instance.
add("mychecker", v => v === "abc", "'abc'");

// Try to use the custom checker.
check("123", "mychecker"); // Throws CustomChecker("Must be 'abc' (received '123')")
```

## Types

### String types

Types are generally accessed via a string reference. This list shows all Blork built-in checkers:

| Type string reference                | Description
|--------------------------------------|-------------------
| `null`                               | Value is **null**
| `undefined`, `undef`, `void`         | Value is **undefined**
| `defined`, `def`                     | Value is **not undefined**
| `boolean`, `bool`                    | Value is **true** or **false**
| `true`                               | Value is **true**
| `false`                              | Value is **false**
| `truthy`                             | Any truthy values (i.e. **== true**)
| `falsy`                              | Any falsy values (i.e. **== false**)
| `zero`                               | Value is **0**
| `one`                                | Value is **1**
| `nan`                                | Value is **NaN**
| `number`, `num`                      | Numbers excluding NaN/Infinity (using **typeof** and finite check) 
| `number+`, `num+`,                   | Numbers more than or equal to zero
| `number-`, `num-`                    | Numbers less than or equal to zero
| `integer`, `int`                     | Integers (using **Number.isInteger()**)
| `integer+`, `int+`                   | Positive integers including zero
| `integer-`, `int-`                   | Negative integers including zero
| `string`, `str`                      | Strings (using **typeof**)
| `string+`, `str+`                    | Non-empty strings (using **str.length**)
| `lowercase`, `lower`                 | Strings with no uppercase characters
| `lowercase+`, `lower+`               | Non-empty strings with no uppercase characters
| `uppercase`, `upper`                 | Strings with no lowercase characters
| `uppercase+`, `upper+`               | Non-empty strings with no lowercase characters
| `function`, `func`                   | Functions (using **instanceof Function**)
| `object`, `obj`                      | Plain objects (using **instanceof Object** and constructor check)
| `object+`, `obj+`                    | Plain objects with one or more properties (using **Object.keys().length**)
| `objectlike`                         | Any object-like object (using **instanceof Object**)
| `iterable`                           | Objects with a **Symbol.iterator** method (that can be used with **for..of** loops)
| `circular`                           | Objects with one or more _circular references_ (use `!circular` to disallow circular references)
| `array`, `arr`                       | Plain instances of Array (using **instanceof Array** and constructor check) 
| `array+`, `arr+`                     | Plain instances of **Array** with one or more items
| `arraylike`                          | Any object, not just arrays, with numeric **.length** property
| `arguments`, `args`                  | Arguments objects (any object, not just arrays, with numeric **.length** property)
| `map`                                | Instances of **Map**
| `map+`                               | Instances of **Map** with one or more items
| `weakmap`                            | Instances of **WeakMap**
| `set`                                | Instances of **Set**
| `set+`                               | Instances of **Set** with one or more items
| `weakset`                            | Instances of **WeakSet**
| `promise`                            | Instances of **Promise**
| `date`                               | Instances of **Date**
| `date+`, `future`                    | Instances of **Date** with a value in the future
| `date-`, `past`                      | Instances of **Date** with a value in the past
| `regex`, `regexp`                    | Instances of **RegExp** (regular expressions)
| `symbol`                             | Value is **Symbol** (using **typeof**)
| `any`, `mixed`                       | Allow any value (transparently passes through with no error)
| `json`, `jsonable`                   | **JSON-friendly** values (null, true, false, finite numbers, strings, plain objects, plain arrays)

```js
// Pass.
check("abc", "str"); // No error.
check("abc", "lower"); // No error.
check(100, "integer"); // No error.
check([1, 2, 3], "array+"); // No error.
check(new Date(2180, 1, 1), "future"); // No error.
check(new Map([[1, 1], [2, 2]]), "map+"); // No error.

// Fail.
check(123, "str"); // Throws ValueError "Must be string (received 123)"
check({}, "object+"); // Throws ValueError "Must be object with one or more properties (received Object(0))"
check([], "array+"); // Throws ValueError "Must be array with one or more items (received Array(0))"
```

### Optional string types

Any string type can be made optional by appending a `?` question mark to the type reference. This means the check will also accept `undefined` in addition to the specified type.

```js
// Pass.
check(undefined, "str?"); // No error.
check(undefined, "lower?"); // No error.
check(undefined, "int?"); // No error.
check([undefined, undefined, 123], ["number?"]); // No error.

// Fail.
check(123, "str?"); // Throws ValueError "Must be string (received 123)"
check(null, "str?"); // Throws ValueError "Must be string (received null)"
```

### Inverted string types

Any string type can be made optional by prepending a `!` question mark to the type reference. This means the check will only pass if the _inverse_ of its type is true.

```js
// Pass.
check(undefined, "!str"); // No error.
check("Abc", "!lower"); // No error.
check(123.456, "!integer"); // No error.
check([undefined, "abc", true, false], ["!number"]); // No error.

// Fail.
check(123, "!str"); // Throws ValueError "Must be not string (received "abc")"
check(true, "!bool"); // Throws ValueError "Must be not true or false (received true)"
check([undefined, "abc", true, 123], ["!number"]); // Throws ValueError "array[3]: Must be not number (received 123)"
```

### Combined string types

You can use `&` and `|` to join string types together, to form AND and OR chains of allowed types. This allows you to compose together more complex types like `number | string` or `date | number | null` or `string && custom-checker`

`|` is used to create an OR type, meaning any of the values is valid, e.g. `number|string` or `string | null`

```js
// Pass.
check(123, "str|num"); // No error.
check("a", "str|num"); // No error.

// Fail.
check(null, "str|num"); // Throws ValueError "Must be string or number (received null)"
check(null, "str|num|bool|func|obj"); // Throws ValueError "Must be string or number or boolean or function or object (received null)"
```

`&` is used to create an AND type, meaning the value must pass _all_ of the checks to be valid. This is primarily useful for custom checkers e.g. `lower & username-unique`.

```js
add("catty", v => v.toLowerCase().indexOf("cat")); // Checks that cat

// Pass.
check("this cat is crazy!", "lower & catty"); // No error.
check("THIS CAT IS CRAZY", "upper & catty"); // No error.

// Fail.
check("THIS CAT IS CRAZY", "lower & catty"); // Throws ValueError "Must be lowercase string and catty"
check("THIS DOG IS CRAZY", "string & catty"); // Throws ValueError "Must be string and catty"
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
check(true, Boolean); // No error.
check("abc", String); // No error.
check(123, Number); // No error.
check(new Date, Date); // No error.
check(new MyClass, MyClass); // No error.
check(Promise.resolved(true), Promise); // No error.
check([true, true, false], [Boolean]); // No error.
check({ name: 123 }, { name: Number }); // No error.

// Fail.
check("abc", Boolean); // Throws ValueError "Must be true or false (received "abc")"
check("abc", String); // Throws ValueError "Must be string (received "abc")"
check("abc", String, "myVar"); // Throws ValueError "myVar: Must be string (received "abc")"
check(new MyClass, OtherClass); // Throws ValueError "Must ben instance of OtherClass (received MyClass)"
check({ name: 123 }, { name: String }); // Throws ValueError "name: Must be string (received 123)"
check({ name: 123 }, { name: String }, "myObj"); // Throws ValueError "myObj[name]: Must be string (received 123)"
```

### Object literal type

To check the types of object properties, use a literal object as a type. You can also deeply nest these properties and the types will be checked recursively and will generate useful debuggable error messages.

_Note: it is fine for objects to contain additional properties that don't have a type specified._

```js
// Pass.
check({ name: "abc" }, { name: "str" }); // No error.
check({ name: "abc" }, { name: "str?", age: "num?" }); // No error.
check({ name: "abc", additional: true }, { name: "str" }); // Throws nothing (additional properties are fine).

// Fail.
check({ age: "apple" }, { age: "num" }); // Throws ValueError "age: Must be number (received "apple")"
check({ size: { height: 10, width: "abc" } }, { size: { height: "num", width: "num" } }); // Throws ValueError "size[width]: Must be number (received "abc")"
```

### Object literal type (with additional properties)

To check that the type of **any** properties conform to a single type, use an `_any` key. This allows you to check objects that don't have known keys (e.g. from user generated data). This is similar to how indexer keys work in Flow or Typescript.

```js
import { check } from "blork";

// Pass.
check({ a: 1, b: 2, c: 3 }, { _any: "num" }); // No error.
check({ name: "Dan", a: 1, b: 2, c: 3 }, { name: "str", _any: "num" }); // No error.

// Fail.
check({ a: 1, b: 2, c: "abc" }, { _any: "num" }); // Throws ValueError "c: Must be number (received "abc")"
```

If you wish you can use this functionality with the `undefined` type to ensure objects **do not** contain additional properties (object literal types by default are allowed to contain additional properties).

```js
// Pass.
check({ name: "Carl" }, { name: "str", _any: "undefined" }); // No error.

// Fail.
check({ name: "Jess", another: 28 }, { name: "str", _any: "undefined" }); // Throws ValueError "another: Must be undefined (received 28)"
```

### Array literal type

To check an array where all items conform to a specific type, pass an array as the type. Arrays and objects can be deeply nested to check types recursively.

```js
// Pass.
check(["abc", "abc"], ["str"]); // No error.
check([123, 123], ["num"]); // No error.
check([{ names: ["Alice", "John"] }], [{ names: ["str"] }]); // No error.

// Fail.
check(["abc", "abc", 123], ["str"]); // Throws ValueError "Array[2]: Must be number (received 123)"
check(["abc", "abc", 123], ["number"]); // Throws ValueError "Array[0]: Must be string (received "abc")"
```

### Array tuple type

Similarly, to check the format of tuples, pass an array with two or more items as the type. _If two or more types are in an type array, it is considered a tuple type and will be rejected if it does not conform exactly to the tuple._

```js
// Pass.
check([123, "abc"], ["num", "str"]); // No error.
check([123, "abc"], ["num", "str", "str?"]); // No error.

// Fail.
check([123], ["num", "str"]); // Throws ValueError "Array[1]: Must be string (received undefined)"
check([123, 123], ["num", "str"]); // Throws ValueError "Array[1]: Must be string (received 123)"
check([123, "abc", true], ["num", "str"]); // Throws ValueError "Array: Too many items (expected 2 but received 3)"
```

## Contributing

Please see (CONTRIBUTING.md)

## Roadmap

- [ ] Support `@decorator` syntax for class methods (PRs welcome)

## Changelog

- 5.0.0
  - Change from symbol `[ANY]` key to `_any` key for indexer property (for convenience and better Flow compatibility)
- 4.5.0
  - Add `checker()` function to return the boolean checker function itself.
- 4.4.0
  - Add `json` checker to check for JSON-friendly values (null, true, false, finite numbers, strings, plain objects, plain arrays)
- 4.3.0
  - Add `circular` checker to check for objects with circular references
  - Add `!` modifier to enable invert checking, e.g. `!num` (don't allow numbers) or `!circular` (don't allow circular references)
- 4.2.2
  - Use `.` dot notation in error message prefix when recursing into objects
- 4.2.1
  - Fix bug where optional types were throwing an incorrect error message
- 4.2.0
  - Rename `FormattedError` to `ValueError` (more descriptive and reusable name)
  - Make `ValueError` the default error thrown by Blork (not ValueError)
- 4.1.0
  - Allow custom error to be set for custom checkers via `add()`
  - Export `debug()` which allows any value to be converted to a string in a clean and clear format
  - Export `format()` which takes three arguments (message, value, prefix) and returns a consistently and beautifully formatted error message.
  - Export `FormattedError` which takes the same three arguments and applies `format()` so it always has beautiful errors
  - Export `BlorkError` (which is thrown when you're using Blork wrong) for the purposes of checking thrown errors against it
- 4.0.0
  - Major internal rewrite with API kept _almost_ the same
  - Add support for combining checkers with `|` and `&` syntax
  - `check()` and `args()` no longer return anything (previously returned the number of passing values)
  - Custom checkers should now return `boolean` (message/description for the checker can be passed in as third field to `add()`)