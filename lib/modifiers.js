// Regexs.
const R_AND_SPLIT = /\s*&+\s*/; // Allow whitespace either side of &
const R_OR_SPLIT = /\s*\|+\s*/; // Allow whitespace either side of |

// List of available modifiers in priority order.
module.exports = [
	// AND combined type.
	{
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

	// Inverted type.
	{
		// `!` exclamation followed by one or more non-whitespace.
		regex: /^!(\S+)/,
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
		regex: /(\S+)\+$/,
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
		regex: /(.+)\?$/,
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
