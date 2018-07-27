const BlorkError = require("./errors/BlorkError");

// Regexs.
// `&` ampersand with possible whitespace either side that isn't not enclosed in parenthesis or braces (via `(?!` lookahead).
const R_AND_SPLIT = /\s*&+\s*(?![^(]*\))(?![^{]*\})(?![^[]*\])/;
// `|` ampersand with possible whitespace either side that isn't not enclosed in parenthesis or braces (via `(?!` lookahead).
const R_OR_SPLIT = /\s*\|+\s*(?![^(]*\))(?![^{]*\})(?![^[]*\])/;
// Split commas in a tuple.
const R_TUPLE_SPLIT = /\s*,\s*/;

// Functions.
// Wrap any checkers (that need to be wrapped) in () parens.
function wrapModified(checker) {
	return checker.modified ? `(${checker.desc})` : checker.desc;
}
function wrapCombined(checker) {
	return checker.combined ? `(${checker.desc})` : checker.desc;
}

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
			const valueChecker = find(matches[1]);

			// Create a checker.
			const checker = v => valueChecker(v);

			// Checker settings.
			checker.desc = valueChecker.desc;
			checker.modified = valueChecker.modified;
			checker.combined = valueChecker.combined;

			// Return it.
			return checker;
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
			const checker = v => {
				// Loop through and call each checker.
				for (let i = 0; i < ands.length; i++) if (!ands[i](v)) return false; // Fail.
				return true; // Otherwise pass.
			};

			// Checker settings.
			checker.desc = ands
				// Get checker descriptions and wrap any that have been modified.
				.map(c => wrapModified(c))
				// Join them with " and "
				.join(" and ");
			checker.modified = true;
			checker.combined = true;

			// Return it.
			return checker;
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
			const checker = v => {
				// Loop through and call each checker.
				for (let i = 0; i < ors.length; i++) if (ors[i](v)) return true; // Pass.
				return false; // Otherwise fail.
			};

			// Checker settings.
			checker.desc = ors
				// Get checker descriptions and wrap any that have been modified.
				.map(c => wrapModified(c))
				// Join them with " or "
				.join(" or ");
			checker.modified = true;
			checker.combined = true;

			// Return it.
			return checker;
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
			const checker = v => {
				// Must be an array.
				if (!arrayChecker(v)) return false;

				// Tuple length must be exactly the same.
				if (v.length !== tupleCheckers.length) return false;

				// Tuple array
				// Loop through types and match each with a value recursively.
				return v.every((w, i) => tupleCheckers[i](w));
			};

			// Map checker descriptions.
			const descs = tupleCheckers.map(c => c.desc).join(", ");

			// Checker settings.
			checker.desc = `plain array tuple containing ${descs}`;
			checker.modified = true;

			// Return it.
			return checker;
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
			const checker = v => {
				// Must be an array.
				if (!arrayChecker(v)) return false;

				// Check every item in the array matches type.
				return v.every(w => itemChecker(w));
			};

			// Checker settings.
			checker.desc = `plain array containing ${wrapCombined(itemChecker)}`;
			checker.modified = true;

			// Return it.
			return checker;
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
			const checker = v => {
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

			// Checker settings.
			checker.desc = keyChecker
				? // Key and value check.
					`plain object with ${wrapCombined(keyChecker)} keys containing ${wrapCombined(valueChecker)}`
				: // Just value check.
					`plain object containing ${wrapCombined(valueChecker)}`;
			checker.modified = true;

			// Return it.
			return checker;
		}
	},

	// Inverted type, e.g. `!num`
	{
		// `!` exclamation followed by one or characters.
		regex: /^!(.+)$/,
		callback(matches, find) {
			// Get normal checker.
			const valueChecker = find(matches[1]);

			// Create an optional checker for this optional type.
			// Returns 0 if undefined, or passes through to the normal checker.
			const checker = v => !valueChecker(v);

			// Checker settings.
			checker.modified = true;
			checker.desc = `anything except ${wrapCombined(valueChecker)}`;

			// Return it.
			return checker;
		}
	},

	// Non-empty type, e.g. `arr+`
	{
		// One or more non-whitespace followed by `+` plus.
		regex: /^(.+)\+$/,
		callback(matches, find) {
			// Get normal checker.
			const emptyChecker = find("empty");
			const valueChecker = find(matches[1]);

			// Create a length checker for this optional type.
			// Returns true if checker passes and there's a numeric length or size property with a value of >0.
			const checker = v => {
				// Must pass the checker first.
				if (!valueChecker(v)) return false;
				// Then use the (inverse) empty checker.
				return !emptyChecker(v);
			};

			// Checker settings.
			checker.modified = true;
			checker.desc = `non-empty ${wrapCombined(valueChecker)}`;

			// Return it.
			return checker;
		}
	},

	// Optional type, e.g. `num?`
	{
		// One or more non-whitespace followed by `?` question mark.
		regex: /^(.+)\?$/,
		callback(matches, find) {
			// Get normal checker.
			const valueChecker = find(matches[1]);

			// Create an optional checker for this optional type.
			// Returns 0 if undefined, or passes through to the normal checker.
			const checker = v => (v === undefined ? true : valueChecker(v));

			// Checker settings.
			checker.modified = true;
			checker.combined = true;
			checker.desc = `${wrapCombined(valueChecker)} or empty`;

			// Return it.
			return checker;
		}
	}
];
