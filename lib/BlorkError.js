/**
 * BlorkError
 *
 * Blork normally throws TypeError (or a custom error) when the value you're checking is invalid.
 * But! A BlorkError is thrown when you're using Blork wrong.
 * - The type you're checking against (not the value you're checking) is invalid or doesn't exist.
 */
class BlorkError extends Error {}
BlorkError.name = "BlorkError";
BlorkError.message = "Incorrect Blork configuration";

// Exports.
module.exports = BlorkError;
