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
		check: blorker.check.bind(blorker),
		args: blorker.args.bind(blorker),
		throws: blorker.throws.bind(blorker),
		add: blorker.add.bind(blorker)
	};
};
