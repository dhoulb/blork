// Regexs.
const R_AND_SPLIT = /\s*&+\s*/; // Allow whitespace either side of &
const R_OR_SPLIT = /\s*\|+\s*/; // Allow whitespace either side of |

// List of available modifiers.
// In priority order (which basically works the same as operator precidence in programming languages).
module.exports = [
	// AND combined type.
	{
		// `&` ampersand appears anywhere in the type.
		regex: /&/,
		callback(matches, find) {
			// Split type and get corresponding checker for each.
			const ands = matches.input.split(R_AND_SPLIT).map(find);

			// Check each checker.
			const andChecker = value => {
				// Loop through and call each checker.
				for (const checker of ands) if (!checker(value)) return false; // Fail.
				return true; // Otherwise pass.
			};

			// Description message joins the descriptions for the checkers.
			andChecker.desc = ands.map(checker => checker.desc).join(" and ");

			// Return it.
			return andChecker;
		}
	},

	// OR combined type.
	{
		// `|` pipe appears anywhere in the type.
		regex: /\|/,
		callback(matches, find) {
			// Split type and get corresponding checker for each.
			const ors = matches.input.split(R_OR_SPLIT).map(find);

			// Check each checker.
			const orChecker = value => {
				// Loop through and call each checker.
				for (const checker of ors) if (checker(value)) return true; // Pass.
				return false; // Otherwise fail.
			};

			// Description message joins the descriptions for the checkers.
			orChecker.desc = ors.map(checker => checker.desc).join(" or ");

			// Return it.
			return orChecker;
		}
	},

	// Array type.
	{
		// `[]` suffix at the end of a type.
		regex: /^(\S+)\[\]$/,
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
			arrayItemChecker.desc = `plain array containing only ${itemChecker.desc}`;

			// Return it.
			return arrayItemChecker;
		}
	},

	// Object type.
	{
		// `{` and `}` surrounding the type.
		// e.g. `{ num }`, or `{ camel: num }` (whitespace optional).
		regex: /^\{\s*((\S+):\s*)?(\S+)\s*\}$/,
		callback(matches, find) {
			// Get normal checker.
			const objectChecker = find("object");
			const keyChecker = matches[2] && matches[2].length ? find(matches[2]) : false;
			const valueChecker = find(matches[3]);

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
					`plain object with ${keyChecker.desc} keys containing only ${valueChecker.desc}`
				: // Just value check.
					`plain object containing only ${valueChecker.desc}`;

			// Return it.
			return objectKeyValueChecker;
		}
	},

	// Inverted type.
	{
		// `!` exclamation followed by one or more non-whitespace.
		regex: /^!(\S+)$/,
		callback(matches, find) {
			// Get normal checker.
			const checker = find(matches[1]);

			// Create an optional checker for this optional type.
			// Returns 0 if undefined, or passes through to the normal checker.
			const invertedChecker = v => !checker(v);

			// Description message joins the descriptions for the checkers.
			invertedChecker.desc = `not ${checker.desc}`;

			// Return it.
			return invertedChecker;
		}
	},

	// Non-empty type.
	{
		// One or more non-whitespace followed by `+` plus.
		regex: /^(\S+)\+$/,
		callback(matches, find) {
			// Get normal checker.
			const checker = find(matches[1]);

			// Create a length checker for this optional type.
			// Returns true if checker passes and there's a numeric length or size property with a value of >0.
			const lengthChecker = v => {
				// Must pass the checker.
				if (!checker(v)) return false;
				// Map and Set use .size
				if (v instanceof Map || v instanceof Set) return v.size > 0;
				// String and Array use .length
				if (typeof v === "string" || v instanceof Array) return v.length > 0;
				// Objects use key length.
				if (typeof v === "object" && v !== null) return Object.keys(v).length > 0;
				// Everything else (numbers, booleans, null, undefined) do a falsy check.
				return !!v;
			};

			// Description message joins the descriptions for the checkers.
			lengthChecker.desc = `non-empty ${checker.desc}`;

			// Return it.
			return lengthChecker;
		}
	},

	// Optional type.
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
			optionalChecker.desc = `${checker.desc} or empty`;

			// Return it.
			return optionalChecker;
		}
	}
];
