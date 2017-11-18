// Checker function interface.
// A function that must return true or string.
export interface CheckerFunction {
    (v:any): true|string;
}

// An error constructor.
// A constructor function that must accept string message (and return/generate any object).
export interface ErrorConstructor {
    new (message:string): Object;
}

// Arguments object interface.
// An object (not an array) that has a numeric length property and string keys with any values.
export interface ArgumentsObject {
	[key:string]: any;
	length: number;
}

// A list of types.
// An array that can contain strings ('bool'), functions (Boolean), or other nested TypesObjects or TypesArrays.
export interface TypesArray extends Array<string|Function|TypesObject|TypesArray> {}

// A set of named types.
// An object with string keys that can contain strings ('bool'), functions (Boolean), or other nested TypesObjects or TypesArrays.
export interface TypesObject {
	[key:string]: string|Function|TypesArray|TypesObject;
}