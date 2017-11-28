/**
 * Blork! Typescript types
 * @author Dave Houlbrooke <dave@shax.com
 */

// Types.

	// Types can be string, function, array, or object.
	export type Types = string | TypeFunction | TypesArray | TypesObject;
	export type TypeFunction = () => void;
	export interface TypesArray extends Array<Types> {}
	export interface TypesObject { [key: string]: Types; }

// Checkers.

	// Checkers can return true or string.
	export type CheckerReturns = true | string;

	// Checker function interface.
	export type CheckerFunction = (v: any) => CheckerReturns; // tslint:disable-line:no-any

// Other.

	// An error constructor.
	// A constructor function that must accept string message (and return/generate any object).
	export interface ErrorConstructor { new (message: string): object; }

	// Arguments object interface.
	// An object (not an array) that has a numeric length property and string keys with any values.
	export interface ArgumentsObject { [key: string]: any; length: number; } // tslint:disable-line:no-any
