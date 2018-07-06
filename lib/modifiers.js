const BlorkError = require("./errors/BlorkError");

// Regexs.
// `&` ampersand with possible whitespace either side that isn't not enclosed in parenthesis or braces (via `(?!` lookahead).
const R_AND_SPLIT = /\s*&+\s*(?![^(]*\))(?![^{]*\})(?![^[]*\])/;
// `|` ampersand with possible whitespace either side that isn't not enclosed in parenthesis or braces (via `(?!` lookahead).
const R_OR_SPLIT = /\s*\|+\s*(?![^(]*\))(?![^{]*\})(?![^[]*\])/;
// Split commas in a tuple.
const R_TUPLE_SPLIT = /\s*,\s*/;

// List of available modifiers.
// In priority order (which basically works the same as operator precidence in programming languages).
module.exports = [
	// Prevent nested parentheses.
	{
		// `(` two opening parentheses in a row without a `)` closing parenthesis between them.
		regex: /\([^)]*\(/,
		callback(matches) {
			// Return false so a "Checker not found" error is thrown.
			throw new BlorkError("Blork type cannot include nested parentheses", matches.input);
		}
	},

	// Grouped type, e.g. `(num | str)`
	{
		// `()` parenthesis surrounding the entire string with no parenthesis inbetween.
		regex: /^\(([^()]+)\)(?![^{]*\})$/,
		callback(matches, find) {
			// Find the real checker.
			const checker = find(matches[1]);

			// Create a parensChecker.
			const parensChecker = v => checker(v);

			// Description message is the same as the original checker..
			parensChecker.desc = checker.desc;

			// Return it.
			return parensChecker;
		}
	},

	// AND combined type, e.g. `upper & str`
	{
		// `&` ampersand appears anywhere in the type, except when enclosed in any parenthesis (via `(?!` lookahead).
		regex: /&(?![^(]*\))(?![^{]*\})(?![^[]*\])/,
		callback(matches, find) {
			// Split type and get corresponding checker for each.
			const ands = matches.input.split(R_AND_SPLIT).map(find);

			// Check each checker.
			const andChecker = v => {
				// Loop through and call each checker.
				for (const checker of ands) if (!checker(v)) return false; // Fail.
				return true; // Otherwise pass.
			};

			// Description message joins the descriptions for the checkers.
			const descs = ands.map(checker => checker.desc);
			andChecker.desc = `(${descs.join(" and ")})`;

			// Return it.
			return andChecker;
		}
	},

	// OR combined type, e.g. `str | num`
	{
		// `|` pipe appears anywhere in the type, except when enclosed in parenthesis or braces (via `(?!` lookahead).
		regex: /\|(?![^(]*\))(?![^{]*\})(?![^[]*\])/,
		callback(matches, find) {
			// Split type and get corresponding checker for each.
			const ors = matches.input.split(R_OR_SPLIT).map(find);

			// Check each checker.
			const orChecker = v => {
				// Loop through and call each checker.
				for (const checker of ors) if (checker(v)) return true; // Pass.
				return false; // Otherwise fail.
			};

			// Description message joins the descriptions for the checkers.
			const descs = ors.map(checker => checker.desc);
			orChecker.desc = `(${descs.join(" or ")})`;

			// Return it.
			return orChecker;
		}
	},

	// Tuple type, e.g. `[str, num]`
	{
		// `[]` enclosing the entire type with no [] in between.
		regex: /^\[\s*([^[\]]+)\s*\]$/,
		callback(matches, find) {
			// Get normal checker.
			const arrayChecker = find("array");
			const tupleCheckers = matches[1].split(R_TUPLE_SPLIT).map(find);

			// Create array type checker.
			const arrayTupleChecker = v => {
				// Must be an array.
				if (!arrayChecker(v)) return false;

				// Tuple length must be exactly the same.
				if (v.length !== tupleCheckers.length) return false;

				// Tuple array
				// Loop through types and match each with a value recursively.
				return v.every((w, i) => tupleCheckers[i](w));
			};

			// Description message prepends "plain array containing";
			const descs = tupleCheckers.map(c => c.desc).join(", ");
			arrayTupleChecker.desc = `${arrayChecker.desc} tuple containing ${descs}`;

			// Return it.
			return arrayTupleChecker;
		}
	},

	// Array type, e.g. `str[]`
	{
		// `[]` suffix at the end of a type.
		regex: /^(.+)\[\]$/,
		callback(matches, find) {
			// Get normal checker.
			const arrayChecker = find("array");
			const itemChecker = find(matches[1]);

			// Create array type checker.
			const arrayItemChecker = v => {
				// Must be an array.
				if (!arrayChecker(v)) return false;

				// Check every item in the array matches type.
				return v.every(w => itemChecker(w));
			};

			// Description message prepends "plain array containing";
			arrayItemChecker.desc = `${arrayChecker.desc} containing ${itemChecker.desc}`;

			// Return it.
			return arrayItemChecker;
		}
	},

	// Object type, e.g. `{ camel: num }`
	{
		// `{` and `}` surrounding the type
		// e.g. `{ num }`, or `{ camel: num }` (whitespace optional).
		regex: /^\{\s*(?:(.+):\s*)?(.+?)\s*\}$/,
		callback(matches, find) {
			// Get normal checker.
			const objectChecker = find("object");
			const keyChecker = matches[1] && matches[1].length ? find(matches[1]) : false;
			const valueChecker = find(matches[2]);

			// Create array type checker.
			const objectKeyValueChecker = v => {
				// Must be an array.
				if (!objectChecker(v)) return false;

				// Check every item in the object matches type.
				return Object.keys(v).every(
					keyChecker
						? // Key and value check.
							k => keyChecker(k) && valueChecker(v[k])
						: // Just value check.
							k => valueChecker(v[k])
				);
			};

			// Description message prepends "plain object containing";
			objectKeyValueChecker.desc = keyChecker
				? // Key and value check.
					`${objectChecker.desc} with ${keyChecker.desc} keys containing ${valueChecker.desc}`
				: // Just value check.
					`${objectChecker.desc} containing ${valueChecker.desc}`;

			// Return it.
			return objectKeyValueChecker;
		}
	},

	// Inverted type, e.g. `!num`
	{
		// `!` exclamation followed by one or characters.
		regex: /^!(.+)$/,
		callback(matches, find) {
			// Get normal checker.
			const checker = find(matches[1]);

			// Create an optional checker for this optional type.
			// Returns 0 if undefined, or passes through to the normal checker.
			const invertedChecker = v => !checker(v);

			// Description message joins the descriptions for the checkers.
			invertedChecker.desc = `anything except ${checker.desc}`;

			// Return it.
			return invertedChecker;
		}
	},

	// Non-empty type, e.g. `arr+`
	{
		// One or more non-whitespace followed by `+` plus.
		regex: /^(.+)\+$/,
		callback(matches, find) {
			// Get normal checker.
			const emptyChecker = find("empty");
			const checker = find(matches[1]);

			// Create a length checker for this optional type.
			// Returns true if checker passes and there's a numeric length or size property with a value of >0.
			const lengthChecker = v => {
				// Must pass the checker first.
				if (!checker(v)) return false;
				// Then use the (inverse) empty checker.
				return !emptyChecker(v);
			};

			// Description message joins the descriptions for the checkers.
			lengthChecker.desc = `non-empty ${checker.desc}`;

			// Return it.
			return lengthChecker;
		}
	},

	// Optional type, e.g. `num?`
	{
		// One or more non-whitespace followed by `?` question mark.
		regex: /^(.+)\?$/,
		callback(matches, find) {
			// Get normal checker.
			const checker = find(matches[1]);

			// Create an optional checker for this optional type.
			// Returns 0 if undefined, or passes through to the normal checker.
			const optionalChecker = v => (v === undefined ? true : checker(v));

			// Description message joins the descriptions for the checkers.
			optionalChecker.desc = `(${checker.desc} or empty)`;

			// Return it.
			return optionalChecker;
		}
	}
];
