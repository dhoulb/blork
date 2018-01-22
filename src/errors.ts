/**
 * Blork! Error types
 * @author Dave Houlbrooke <dave@shax.com
 */

/**
 * BlorkError
 *
 * Blork normally throws TypeError (or a custom error) when the value you're checking is invalid.
 * But! A BlorkError is thrown when you're using Blork wrong.
 * - The type you're checking against (not the value you're checking) is invalid or doesn't exist.
 */
export class BlorkError extends Error {

	// Makes the object appear like [object BlorkError] instead of [object Error]
	public static [Symbol.toStringTag] = BlorkError.name;

	/** Error message. */
	public message = 'Invalid configuration';

	/** Error name */
	public name = BlorkError.name;

	// Construct.
	public constructor(message: string) {

		// Super.
		super(message);

		// Save message.
		if (message) this.message = message;

	}

}
