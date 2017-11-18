"use strict";

// An issue with the way the user is calling Blork.
export class BlorkError extends Error
{
	static message = "Blork: You're using it wrong!";
	static [Symbol.toStringTag] = 'BlorkError';
}