"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const internal_1 = require("./internal");
const checkers_1 = require("./checkers");
const helpers_1 = require("./helpers");
const errors_1 = require("./errors");
let errorConstructor = TypeError;
function check(value, type, prefix = '') {
    internal_1.internalCheck(prefix, 'string', 'arguments[2]', errors_1.BlorkError);
    return internal_1.internalCheck(value, type, prefix, errorConstructor);
}
exports.check = check;
function args(argsObj, types) {
    internal_1.internalCheckString(argsObj, 'args', 'arguments[0]', errors_1.BlorkError);
    internal_1.internalCheckString(types, 'array', 'arguments[1]', errors_1.BlorkError);
    const l = types.length;
    let pass = 0;
    for (let i = 0; i < l; i++)
        if (internal_1.internalCheck(argsObj[i], types[i], `arguments[${i}]`, errorConstructor))
            pass++;
    if (argsObj.length > l) {
        throw new errorConstructor(helpers_1.format(`Too many arguments (expected ${l})`, argsObj.length, 'arguments'));
    }
    return pass;
}
exports.args = args;
function add(name, checker) {
    internal_1.internalCheckString(name, 'lower+', 'arguments[0]', errors_1.BlorkError);
    internal_1.internalCheckString(checker, 'function', 'arguments[1]', errors_1.BlorkError);
    if (checkers_1.checkers[name]) {
        throw new errors_1.BlorkError(`Blork type '${name}' already exists`);
    }
    checkers_1.checkers[name] = checker;
}
exports.add = add;
function throws(err) {
    internal_1.internalCheckString(err, 'function', 'arguments[0]', errors_1.BlorkError);
    errorConstructor = err;
}
exports.throws = throws;
//# sourceMappingURL=blork.js.map