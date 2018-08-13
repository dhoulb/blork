const Blorker = require("../classes/Blorker");
const checkers = require("../checkers");

/**
 * Create a new instance of Blork.
 *
 * Allows new instances of args() and check() to exist.
 * Separate instances have their own independent throws() error class and list of additional checkers.
 *
 * @returns {object} An object that can be destructured into { check, args, add, throws } functions.
 */
module.exports = function blork() {
	// Vars.
	const blorker = new Blorker(checkers);

	// Returns.
	return {
		assert: blorker.Blorker$assert,
		check: blorker.Blorker$check,
		args: blorker.Blorker$args,
		add: blorker.Blorker$add,
		checker: blorker.Blorker$checker,
		throws: blorker.Blorker$throws
	};
};
