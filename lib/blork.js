"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const checkers_1 = require("./checkers");
const helpers_1 = require("./helpers");
const errors_1 = require("./errors");
let errorConstructor = TypeError;
function check(value, type, prefix = '') {
    safe(prefix, 'string', 'arguments[2]', errors_1.BlorkError);
    return safe(value, type, prefix, errorConstructor);
}
exports.check = check;
function args(args, types) {
    safe(args, 'args', 'arguments[0]', errors_1.BlorkError);
    safe(types, 'array', 'arguments[1]', errors_1.BlorkError);
    let pass = 0;
    const l = types.length;
    for (let i = 0; i < l; i++)
        if (safe(args[i], types[i], 'arguments[' + i + ']', errorConstructor))
            pass++;
    if (args.length > l)
        throw new errorConstructor(helpers_1.format('Must not have more than ' + l + ' arguments', args.length, 'arguments'));
    return pass;
}
exports.args = args;
function add(name, checker) {
    safe(name, 'lower+', 'arguments[0]', errors_1.BlorkError);
    safe(checker, 'function', 'arguments[1]', errors_1.BlorkError);
    if (checkers_1.checkers[name])
        throw new errors_1.BlorkError("Checker '" + name + " already exists");
    checkers_1.checkers[name] = checker;
}
exports.add = add;
function throws(err) {
    safe(err, 'function', 'arguments[0]', errors_1.BlorkError);
    errorConstructor = err;
}
exports.throws = throws;
function safe(value, type, name, errorConstructor) {
    if (typeof type === 'string') {
        let checker = checkers_1.checkers[type];
        if (!checker) {
            if (type.length && type[type.length - 1] === '?') {
                checker = checkers_1.checkers[type.slice(0, -1)];
                if (checker && value === undefined)
                    return 0;
            }
            if (!checker)
                throw new errors_1.BlorkError("Checker '" + type + "' does not exist");
        }
        const result = checker(value);
        if (result === true)
            return 1;
        else if (typeof result === 'string')
            throw new errorConstructor(helpers_1.format(result, value, name));
        else
            throw new errors_1.BlorkError(helpers_1.format("Checker '" + type + "' did not return true or string", result));
    }
    else if (type instanceof Function) {
        let result = true;
        switch (type) {
            case Boolean:
                result = checkers_1.checkers.bool(value);
                break;
            case Number:
                result = checkers_1.checkers.num(value);
                break;
            case String:
                result = checkers_1.checkers.str(value);
                break;
            case Object:
                result = checkers_1.checkers.obj(value);
                break;
            default: if (!(value instanceof type))
                result = 'Must be instance of ' + (type.name || 'specified object');
        }
        if (typeof result === 'string')
            throw new errorConstructor(helpers_1.format(result, value, name));
        else
            return 1;
    }
    else if (type instanceof Array) {
        safe(value, 'array', name, errorConstructor);
        if (!name.length)
            name = 'Array';
        let pass = 0;
        if (type.length === 1) {
            const l = value.length;
            for (let i = 0; i < l; i++)
                if (safe(value[i], type[0], name + '[' + i + ']', errorConstructor))
                    pass++;
        }
        else {
            const l = type.length;
            for (let i = 0; i < l; i++)
                if (safe(value[i], type[i], name + '[' + i + ']', errorConstructor))
                    pass++;
            if (value.length > l)
                throw new errorConstructor(helpers_1.format('Must not have more than ' + l + ' array items', value.length, name));
        }
        return pass;
    }
    else if (type instanceof Object) {
        safe(value, 'object', name, errorConstructor);
        let pass = 0;
        for (const key in type)
            if (safe(value[key], type[key], (name ? name + '[' + key + ']' : key), errorConstructor))
                pass++;
        return pass;
    }
    else
        throw new errors_1.BlorkError(helpers_1.format('Checker type must be a string, function, array, or object', type));
}
//# sourceMappingURL=blork.js.map