# Blork! Mini runtime type checking in Javascript

[![Build Status](https://travis-ci.org/dhoulb/blork.svg?branch=master)](https://travis-ci.org/dhoulb/blork)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![npm](https://img.shields.io/npm/dm/blork.svg)](https://www.npmjs.com/package/blork)

A mini type checker for locking down the external edges of your code. Mainly for use in modules when you don"t know who'll be using the code. Minimal boilerplate code keeps your functions hyper readable and lets them be their beautiful minimal best selves (...or something?)

Blork is fully unit tested and 100% covered (if you're into that!). Heaps of love has been put into the _niceness_ and consistency of error messages, so hopefully you'll enjoy that too.

## Installation

```sh
npm install blork
```

## Usage

### check(): Check individual values

The `check()` function allows you to test that individual values correspond to a type, and throw a `TypeError` if not. This is primarily designed for checking function arguments but can be used for any purpose.

`check()` accepts four arguments:

1. `value` The value to check
2. `type` The type to check the value against (full reference list of types is available below)
3. `prefix` An optional string name/prefix for the value, which is prepended to any error message thrown to help debugging
4. `error` An optional custom error type to throw if the check fails

```js
import { check } from "blork";

// Checks that pass.
check("Sally", "string"); // No error.
check("Sally", String); // No error.

// Checks that fail.
check("Sally", "number"); // Throws ValueError "Must be number (received "Sally")"
check("Sally", Boolean); // Throws ValueError "Must be true or false (received "Sally")"

// Checks that fail (with a prefix set).
check("Sally", "num", "name"); // Throws ValueError "name: Must be number (received "Sally")"
check(true, "str", "status"); // Throws ValueError "status: Must be string (received true)"

// Checks that fail (with a custom error thrown).
check(123, "str", "num", ReferenceError); // Throws ReferenceError "num: Must be string (received 123)"
```

## Type modifiers

`type` will mostly be specified with a type string (a full list of string types is available below), and these string types can also be modified using other characters:

- Appending `?` question mark to any type string makes it optional (which means it also allows `undefined`). 
- Prepending a `!` exclaimation mark to any type string makes it inverted (e.g. `!string` means anything except string).
- Multiple types can be combined with `|` and `&` for OR and AND conditions (optionally grouped with `()` parens to resolve ambiguity).
- Appending a `+` means non-empty (e.g. `arr+` `str+` means non-empty arrays and strings respectively).


```js
// Optional types.
check(undefined, "number"); // Throws ValueError "Must be finite number (received undefined)"
check(undefined, "number?"); // No error.

// Note that null does not count as optional.
check(null, "number?"); // Throws ValueError "Must be finite number (received null)"

// Inverted types.
check(123, "!str"); // No error.
check(123, "!int"); // Throws ValueError "Must be not integer (received 123)"

// Combined OR types.
check(1234, "int | str"); // No error.
check(null, "int | str"); // Throws ValueError "Must be integer or string (received null)"

// Combined AND types.
check("abc", "string & !falsy"); // No error.
check("", "string & !falsy"); // Throws ValueError "Must be string and not falsy (received "")"

// Non-empty types.
check("abc", "str+"); // No error.
check("", "str+"); // Throws ValueError "Must be non-empty string (received "")"

// Size types.
check([1, 2, 3], "arr{2,4}"); // No error.
check([1], "arr{2,3}"); // Throws ValueError "Must be plain array (minimum 2) (maximum 3) (received [1])"
check([1, 3, 3, 4], "arr{,3}"); // Throws ValueError "Must be plain array (maximum 3) (received [1])"
check([1, 2], "arr{3,}"); // Throws ValueError "Must be plain array (minimum 2) (received [1])"

// Array types.
check([1, 2, 3], "num[]"); // No error.
check(["a", "b"], "num[]"); // Throws ValueError "Must be plain array containing finite number (received ["a", "b"])"

// Tuple types.
check([1, "a"], "[int, str]"); // No error.
check([1, false], "[int, str]"); // Throws ValueError "Must be plain array tuple containing integer, string (received [1, false])"

// Object types.
check({ a: 1 }, "{ camel: integer }"); // No error.
check({ "$": 1 }, "{ camel: integer }"); // Throws ValueError "Must be plain object with camelCase string keys containing integer (received { "$": 1 })"
```

### Checking objects and arrays

Blork can also perform deep checks on objects and arrays to ensure the schema is correct deeply. You can use literal arrays or literal objects with `check()` or `args()` to do so:

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

### args(): Check function arguments

The primary use case of Blork is validating function input arguments. The `args()` function is provided for this purpose and can be passed four arguments:

1. `arguments` | The **arguments** object provided automatically to functions in Javascript
2. `types` | An array identifying the types for the arguments (list of types is available below)
3. `prefix` An optional string name/prefix for the value, which is prepended to any error message thrown to help debugging
4. `error` An optional custom error type to throw if the check fails

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
myFunc(123); // Throws ValueError "myFunc(): arguments[0]: Must be string (received 123)"
myFunc("abc", "abc"); // Throws ValueError "myFunc(): arguments[1]: Must be number (received "abc")"
myFunc(); // Throws ValueError "myFunc(): arguments[0]: Must be string (received undefined)"
myFunc("abc", 123, true); // Throws ValueError "myFunc(): arguments: Too many arguments (expected 2) (received 3)"
```

### assert(): Check a random true/false statement.

Check a random true/false statement using the `assert()` function. This allows you to make other assertions with a similar argument order to `check()`. This is mainly just syntactic sugar, but is neater than messy `if (x) throw new X;` type statements.

Takes up to four arguments:

1. `assertion` The true/false value that is the assertion.
2. `description` A description of the positive assertion. Must fit the phrase `Must ${description}`, e.g. "be unique" or "be equal to dog".
3. `prefix` An optional string name/prefix for the value, which is prepended to any error message thrown to help debugging
4. `error` An optional custom error type to throw if the check fails

```js
import { assert } from "blork";

// Assertion that passes.
assert(isUnique(val1), "unique"); // Pass.

// Assertion that fails.
assert(isUnique(val2), "be unique"); // Throws ValueError "Must be unique"
assert(isUnique(val2), "be unique", "val2"); // Throws ValueError "val2: Must be unique"
assert(isUnique(val2), "be unique", "val2", ReferenceError); // Throws ReferenceError "val2: Must be unique"
```

### add(): Add a custom checker type

Register your own checker using the `add()` function. This is great if 1) you're going to be applying the same check over and over, or 2) want to integrate your own checks with Blork's built-in types so your code looks clean.

`add()` accepts four arguments:

1. `name` The name of the custom checker (only kebab-case strings allowed).
2. `checker` A function that accepts a single argument, `value`, and returns `true` or `false`.
3. `description` A description of the type of value that's valid. Must fit the phrase `Must be ${description}`, e.g. "positive number" or "unique string". Defaults to name.
4. `error=undefined` A custom class that is thrown when this checker fails (can be [VALUES]_ class, not just classes extending `Error`). An error set with `add() takes precedence for this checker over the error set through `throws()`.

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
myFunc("A dog sits over there"); // Throws ValueError "myFunc(): arguments[1]: Must be string containing "cat" (received "A dog sits over there")"
```

### throws(): Set a custom error constructor

To change the error object Blork throws when a type doesn't match, use the `throws()` function. It accepts a single argument a custom class (can be [VALUES]_ class, not just classes extending `Error`).

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

### debug(): Debug any value as a string.

Blork exposes its debugger helper function `debug()`, which it uses to format error messages correctly. `debug()` accepts any argument and will return a clear string interpretation of the value. 

`debug()` deals well with large and nested objects/arrays by inserting linebreaks and tabs if line length would be unreasonable. Output is also kept cleanish by only debugging 3 levels deep, truncating long strings, and not recursing into circular references.

```js
import debug from "blork";

// Debug primitives.
debug(undefined); // Returns `undefined`
debug(null); // Returns `null`
debug(true); // Returns `true`
debug(false); // Returns `false`
debug(123); // Returns `123`
debug("abc"); // Returns `"abc"`
debug(Symbol("abc")); // Returns `Symbol("abc")`

// Debug functions.
debug(function dog() {}); // Returns `dog()`
debug(function() {}); // Returns `anonymous function()`

// Debug objects.
debug({}); // Returns `{}`
debug({ a: 123 }); // Returns `{ "a": 123 }`
debug(new Promise()); // Returns `Promise {}`
debug(new MyClass()); // Returns `MyClass {}`
debug(new class {}()); // Returns `anonymous class {}`
```

### ValueError: Great debuggable error class

Internally, when there's a problem with a value, Blork will throw a `ValueError`. This value extends `TypeError` and standardises error message formats, so errors are consistent and provide the detail a developer should need to debug the issue error quickly and easily.

It accepts three values:

1. `message` The error message describing the issue with the value, e.g. `"Must be string"`
2. `value` The actual value that was incorrect so a debugged version of this value can appear in the error message, e.g. `(received 123)`
3. `prefix` A string prefix for the error that should identify the location the error occurred and the name of the value, e.g. `"myFunction(): name"`

```js
import { ValueError } from "blork";

// Function that checks its argument.
function myFunc(name) {
	// If name isn't a string, throw a ValueError.
	// (This is essentially what check() does behind the scenes.)
	if (typeof name !== "string") throw new ValueError("Must be string", name, "myFunc(): name");
}

// Call with incorrect name.
myFunc(123); // Throws ValueError "myFunc(): name: Must be a string (received 123)"
```

## Types

This section lists all types that are available in Blork. A number of different formats can be used for types:

- **String types** (e.g. `"promise"` and `"integer"`)
- **String modifiers** that modify those string types (e.g. `"?"` and `"!"`)
- **Constant** and **constructor** shorthand types (e.g. `null` and `String`)
- **Object** and **Array** literal types (e.g. `{}` and `[]`)

### String types

| Type string                      | Description                  
|----------------------------------|------------
| `primitive`                      | Any **primitive** value (undefined, null, booleans, strings, finite numbers)
| `null`                           | Value is **null**
| `undefined`, `undef`, `void`     | Value is **undefined**
| `defined`, `def`                 | Value is **not undefined**
| `boolean`, `bool`                | Value is **true** or **false**
| `true`                           | Value is **true**
| `false`                          | Value is **false**
| `truthy`                         | Any truthy values (i.e. **== true**)
| `falsy`                          | Any falsy values (i.e. **== false**)
| `zero`                           | Value is **0**
| `one`                            | Value is **1**
| `nan`                            | Value is **NaN**
| `number`, `num`                  | Any numbers except NaN/Infinity (using **Number.isFinite()**)
| `+number`, `+num`,               | Numbers more than or equal to zero
| `-number`, `-num`                | Numbers less than or equal to zero
| `integer`, `int`                 | Integers (using **Number.isInteger()**)
| `+integer`, `+int`               | Positive integers including zero
| `-integer`, `-int`               | Negative integers including zero
| `string`, `str`                  | Any strings (using **typeof**)
| `alphabetic`                     | alphabetic string (non-empty and alphabetic only)
| `numeric`                        | numeric strings (non-empty and numerals 0-9 only)
| `alphanumeric`                   | alphanumeric strings (non-empty and alphanumeric only)
| `lower`                          | lowercase strings (non-empty and lowercase alphabetic only)
| `upper`                          | UPPERCASE strings (non-empty and UPPERCASE alphabetic only)
| `camel`                          | camelCase strings e.g. variable/function names (non-empty alphanumeric with lowercase first letter)
| `pascal`                         | PascalCase strings e.g. class names (non-empty alphanumeric with uppercase first letter)
| `snake`                          | snake_case strings (non-empty alphanumeric lowercase)
| `screaming`                      | SCREAMING_SNAKE_CASE strings e.g. environment vars (non-empty uppercase alphanumeric)
| `kebab`, `slug`                  | kebab-case strings e.g. URL slugs (non-empty alphanumeric lowercase)
| `train`                          | Train-Case strings e.g. HTTP-Headers (non-empty with uppercase first letters)
| `function`, `func`               | Functions (using **instanceof Function**)
| `object`, `obj`                  | Plain objects (using **typeof && !null** and constructor check)
| `objectlike`                     | Any object-like object (using **typeof && !null**)
| `iterable`                       | Objects with a **Symbol.iterator** method (that can be used with **for..of** loops)
| `circular`                       | Objects with one or more _circular references_ (use `!circular` to disallow circular references)
| `array`, `arr`                   | Plain arrays (using **instanceof Array** and constructor check)
| `arraylike`, `arguments`, `args` | Array-like objects, e.g. **arguments** (any object with numeric **.length** property, not just arrays)
| `map`                            | Instances of **Map**
| `weakmap`                        | Instances of **WeakMap**
| `set`                            | Instances of **Set**
| `weakset`                        | Instances of **WeakSet**
| `promise`                        | Instances of **Promise**
| `date`                           | Instances of **Date**
| `future`                         | Instances of **Date** with a value in the future
| `past`                           | Instances of **Date** with a value in the past
| `regex`, `regexp`                | Instances of **RegExp** (regular expressions)
| `symbol`                         | Value is **Symbol** (using **typeof**)
| `empty`                          | Value is empty (e.g. **v.length === 0** (string/array), **v.size === 0** (Map/Set), `Object.keys(v) === 0` (objects), or `!v` (anything else)
| `any`, `mixed`                   | Allow any value (transparently passes through with no error)
| `json`, `jsonable`               | Values that can be successfully converted to JSON _and back again!_ (null, true, false, finite numbers, strings, plain objects, plain arrays)

### String modifiers

String modifier types can be applied to any string type from the list above to modify that type's behaviour.

| Type modifier       | Description
|---------------------|------------
| `(type)`            | Grouped type, e.g. `(num | str)[]`
| `type1 & type2`     | AND combined type, e.g. `str & upper`
| `type1 | type2`     | OR combined type, e.g. `num | str`
| `type[]`            | Array type (all array entries must match type)
| `[type1, type2]`    | Tuple type (must match tuple exactly)
| `{ type }`          | Object value type (all own props must match type
| `{ keyType: type }` | Object key:value type (keys and own props must match types)
| `!type`             | Inverted type (opposite is allowed), e.g. `!str`
| `type?`             | Optional type (allows type or `undefined`), e.g. `str?`
| `type+`             | Non-empty type, e.g. `str+` or `num[]+`

Any string type can be made into an array of that type by appending `[]` brackets to the type reference. This means the check looks for a plain array whose contents only include the specified type.

```js
// Pass.
check(["a", "b"], "str[]"); // No error.
check([1, 2, 3], "int[]"); // No error.
check([], "int[]"); // No error (empty is fine).
check([1], "int[]+"); // No error (non-empty).

// Fail.
check([1, 2], "str[]"); // Throws ValueError "Must be plain array containing: string (received [1, 2])"
check(["a"], "int[]"); // Throws ValueError "Must be plain array containing: integer (received ["a"])"
check([], "int[]+"); // Throws ValueError "Must be non-empty plain array containing: integer (received [])"
```

Array tuples can be specified by surrounding types in `[]` brackets.

```js
// Pass.
check([true, false], "[bool, bool]") // No error.
check(["a", "b"], "[str, str]") // No error.
check([1, 2, 3], "[num, num, num]"); // No error.

// Fail.
check([true, true], "[str, str]") // Throws ValueError "Must be plain array tuple containing: string, string (received [true, true])"
check([true], "[bool, bool]") // Throws ValueError "Must be plain array tuple containing: boolean, boolean (received [true])"
check(["a", "b", "c"], "[str, str]") // Throws ValueError "Must be plain array tuple containing: string, string (received ["a", "b", "c"])"
```

Check for objects only containing strings of a specified type by surrounding the type in `{}` braces. This means the check looks for a plain object whose contents only include the specified type (whitespace is optional).

```js
// Pass.
check({ a: "a", b: "b" }, "{str}"); // No error.
check({ a: 1, b: 2 }, "{int}"); // No error.
check({}, "{int}"); // No error (empty is fine).
check({ a: 1 }, "{int}+"); // No error (non-empty).

// Fail.
check({ a: 1, b: 2 }, "{str}"); // Throws ValueError "Must be plain object containing: string (received [1, 2])"
check({ a: "a" }, "{int}"); // Throws ValueError "Must be plain object containing: integer (received ["a"])"
check({}, "{int}+"); // Throws ValueError "Must be non-empty plain object containing: integer (received [])"
```

A type for the keys can also be specified by using `{ key: value }` format.

```js
// Pass.
check({ myVar: 123 }, "{ camel: integer }");
check({ "my-var": 123 }, "{ kebab: integer }");
```

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

Any type can be made non-empty by appending a `+` plus sign to the type reference. This means the check will only pass if the value is non-empty. Specifically this works as follows:

- Strings: `.length` is more than 0
- Map and Set objects: `.size` is more than 0
- Objects and arrays: If it has a `.length` property Number of own properties is not zero (using `typeof === "object"` && `Object.keys()`)
- Booleans and numbers: Use truthyness (e.g. `true` is non-empty, `false` and `0` is empty)

This is equivalent to the inverse of the `empty` type.

```js
// Pass.
check("abc", "str+"); // No error.
check([1], "arr+"); // No error.
check({ a: 1 }, "obj+"); // No error.

// Fail.
check(123, "str+"); // Throws ValueError "Must be non-empty string (received "")"
check([], "arr+"); // Throws ValueError "Must be non-empty plain array (received [])"
check({}, "obj+"); // Throws ValueError "Must be non-empty plain object (received {})"
```

To specify a size for the type, you can prepend minimum/maximum with e.g. `{12}`, `{4,8}`, `{4,}` or `{,8}` (e.g. RegExp style quantifiers). This allows you to specify e.g. a string with 12 characters, an array with between 10 and 20 items, or an integer with a minimum value of 4.

```js
// Pass.
check("abc", "str{3}"); // No error (string with exact length 3 characters).
check(4, "num{,4}"); // No error (number with maximum value 4).
check(["a", "b"], "arr{1,}"); // No error (array with more than 1 item).
check([1, 2, 3], "num[]{2,4}"); // No error (array of numbers with between 2 and 4 items).

// Fail.
check("ab", "str{3}"); // Throws ValueError "Must be string with size 3"
check(4, "num{,4}"); // Throws ValueError "Must be finite number with maximum size 4"
check(["a", "b"], "arr{1,}"); // Throws ValueError "Must be array with minimum size 1"
check([1, 2, 3], "num[]{2,4}"); // Throws ValueError "Must be plain array containing finite number with size between 2 and 4"
```

Any string type can inverted by prepending a `!` exclamation mark to the type reference. This means the check will only pass if the _inverse_ of its type is true.

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
// Add a checker that confirms a string contains the word "cat"
add("catty", v => v.toLowerCase().indexOf("cat") >= 0);

// Pass.
check("this cat is crazy!", "lower & catty"); // No error.
check("THIS CAT IS CRAZY", "upper & catty"); // No error.

// Fail.
check("THIS CAT IS CRAZY", "lower & catty"); // Throws ValueError "Must be lowercase string and catty"
check("THIS DOG IS CRAZY", "string & catty"); // Throws ValueError "Must be string and catty"
```

Note: Built in checkers like `lower` or `int+` already check the basic type of a value (e.g. string and number), so there's no need to use `string & lower` or `number & int+` — internally the value will be checked twice. Spaces around the `&` or `|` are optional.

`()` parentheses can be used to create a 'grouped type'. This is useful to specify an array that allows several types, to make an invert/optional type of several types, or to state an explicit precence order for `&` and `|`.

```js
// Pass.
check([123, "abc"], "(str|num)[]"); // No error.
check({ a: 123, b: "abc" }, "!(str|num)"); // No error.
check("", "(int & truthy) | (str & falsy)"); // No error.
check(12, "(int & truthy) | (str & falsy)"); // No error.
```

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

Using `Object` and `Array` constructors will work also and will allow any object that is `instanceof Object` or `instanceof Array`. _Note: this is not the same as e.g. the `'object'` and `'array'` string types, which only allow **plain** objects and arrays._

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

To check that the type of **any** properties conform to a single type, use the `VALUES` symbol and create a `[VALUES]` key. This allows you to check objects that don't have known keys (e.g. from user generated data). This is similar to how indexer keys work in Flow or Typescript.

```js
import { check, VALUES } from "blork";

// Pass.
check(
	{ a: 1, b: 2, c: 3 },
	{ [VALUES]: "num" }
); // No error.
check(
	{ name: "Dan", a: 1, b: 2, c: 3 },
	{ name: "str", [VALUES]: "num" }
); // No error.

// Fail.
check(
	{ a: 1, b: 2, c: "abc" },
	{ [VALUES]: "num" }
); // Throws ValueError "c: Must be number..."
check(
	{ name: "Dan", a: 1, b: 2, c: 3 },
	{ name: "str", [VALUES]: "bool" }
); // Throws ValueError "a: Must be boolean..."
```

You can use this functionality with the `undefined` type to ensure objects **do not** contain additional properties (object literal types by default are allowed to contain additional properties).

```js
// Pass.
check(
	{ name: "Carl" },
	{ name: "str", [VALUES]: "undefined" }
); // No error.

// Fail.
check(
	{ name: "Jess", another: 28 },
	{ name: "str", [VALUES]: "undefined" }
); // Throws ValueError "another: Must be undefined..."
```

To check that the keys of any additional properties conform to a single type, use the `KEYS` symbol and create a `[KEYS]` key. This allows you to ensure that keys conform to a specific string type, e.g. **camelCase**, **kebab-case** or **UPPERCASE** (see string types above).

```js
import { check, VALUES } from "blork";

// Pass.
check({ MYVAL: 1 }, { [KEYS]: "upper" }); // UPPERCASE keys — no error.
check({ myVal: 1 }, { [KEYS]: "camel" }); // camelCase keys — no error.
check({ MyVal: 1 }, { [KEYS]: "pascal" }); // PascalCase keys — no error.
check({ my-val: 1 }, { [KEYS]: "kebab" }); // kebab-case keys — no error.

// Fail.
check({ MYVAL: 1 }, { [KEYS]: "upper" }); // UPPERCASE keys — no error.
check({ myVal: 1 }, { [KEYS]: "camel" }); // camelCase keys — no error.
check({ MyVal: 1 }, { [KEYS]: "pascal" }); // PascalCase keys — no error.
check({ my-val: 1 }, { [KEYS]: "kebab" }); // kebab-case keys — no error.
```

Normally object literal types check that the object is a **plain object**. If you wish to allow the object to be a different object (in order to check specific keys on that object at the same time), use the `CLASS` symbol and create a `[CLASS]` key.

```js
import { check, CLASS } from "blork";

// Make a fancy new class.
class MyClass {
	constructor () {
		this.num = 123;
	}
}

// Pass.
check(
	new MyClass,
	{ num: 123, [CLASS]: MyClass }
); // No error.

// Fail.
check(
	{ num: 123, },
	{ num: 123, [CLASS]: MyClass }
); // Throws ValueError "Must be instance of MyClass..."
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

- 8.0.0
  - Remove `props()` functionality (bloat)
  - Prepend function name to `ValueError` errors, e.g. `MyClass.myFunc(): Must be string...`
  - Add `destack()` method that parses `Error.stack` across major browsers
- 7.6.0
  - Allow `prefix` and `error` arguments for `check()` and `args()`
  - Add `assert()` function
- 7.5.0
  - Enable tuple arrays via `[type1, type2]` syntax
- 7.4.0
  - Make properties created with `props()` enumerable
  - Return the original object from `props()` (for chaining)
- 7.2.0
  - Add grouping for string types via parentheses, e.g. `(str | num)`
  - Add `empty` type to detect emptiness in strings, arrays, Map, Set, and objects
  - Add `alphabetic`, `numeric` and `alphanumeric` string types for specific strings
- 7.1.0
  - Add object and array string modifiers (using `type[]`, `{type}` and `{ keyType: type }` syntax)
- 7.0.0
  - Add `VALUES`, `KEYS`, and `CLASS` symbol constants
  - Remove `_any` key and use `VALUES` to provide the same functionality
  - Add `KEYS` functionality to check type or case of object keys, e.g. camelCase or kebab-case
  - Add `CLASS` functionality to check the class of an object
  - Add string case checkers for e.g. variable names (kebab-case, camelCase, snake_case etc)
  - `upper` and `lower` checkers work differently (all characters must be UPPERCASE/lowercase)
  - Rename `int+`, `int-` checkers to `+int` and `-int`
  - Add '+' modifier to check for non-empty values with any checker
  - Remove hardcoded '+' checkers like `lower+`, `object+`
  - Remove `uppercase` and `lowercase` checkers for consistency
- 6.0.0
  - Remove `prop()` function and add `props()` function instead (`prop()` was impossible to type with Flow)
- 5.1.0
  - Add `prop()` function that defines a locked object property that must match a Blork type
- 5.0.0
  - Change from symbol `[ANY]` key to `[VALUES]` key for indexer property (for convenience and better Flow compatibility)
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