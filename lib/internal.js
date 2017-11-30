"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("./errors");
const helpers_1 = require("./helpers");
const checkers_1 = require("./checkers");
function internalCheck(value, type, name, err) {
    if (typeof type === 'string')
        return internalCheckString(value, type, name, err);
    if (type instanceof Function)
        return internalCheckFunction(value, type, name, err);
    if (type instanceof Array)
        return internalCheckArray(value, type, name, err);
    if (type instanceof Object)
        return internalCheckObject(value, type, name, err);
    throw new errors_1.BlorkError(helpers_1.format('Blork type must be a string, function, array, or object', type));
}
exports.internalCheck = internalCheck;
function internalCheckString(value, type, name, err) {
    let checker = checkers_1.checkers[type];
    if (!checker) {
        if (type.length > 0 && type[type.length - 1] === '?') {
            checker = checkers_1.checkers[type.slice(0, -1)];
            if (checker && value === undefined)
                return 0;
        }
        if (!checker)
            throw new errors_1.BlorkError(`Blork type '${type}' does not exist`);
    }
    const result = checker(value);
    if (typeof result === 'string')
        throw new err(helpers_1.format(result, value, name));
    return 1;
}
exports.internalCheckString = internalCheckString;
function internalCheckFunction(value, type, name, err) {
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
            result = `Must be instance of ${(type.name || 'specified object')}`;
    }
    if (result === true)
        return 1;
    throw new err(helpers_1.format(result, value, name));
}
exports.internalCheckFunction = internalCheckFunction;
function internalCheckArray(value, type, name, err) {
    if (value instanceof Array) {
        const prefix = name.length ? name : 'Array';
        let pass = 0;
        if (type.length === 1) {
            const l = value.length;
            for (let i = 0; i < l; i++)
                if (internalCheck(value[i], type[0], `${prefix}[${i}]`, err))
                    pass++;
        }
        else {
            const l = type.length;
            for (let i = 0; i < l; i++)
                if (internalCheck(value[i], type[i], `${prefix}[${i}]`, err))
                    pass++;
            if (value.length > l)
                throw new err(helpers_1.format(`Too many array items (expected ${l})`, value.length, prefix));
        }
        return pass;
    }
    else
        throw new err(helpers_1.format('Must be an array', value, name));
}
exports.internalCheckArray = internalCheckArray;
function internalCheckObject(value, type, name, err) {
    if (typeof value !== 'object' || value === null)
        throw new err(helpers_1.format('Must be an object', value, name));
    let pass = 0;
    for (const key in type)
        if (internalCheck(value[key], type[key], name ? `${name}[${key}]` : key, err))
            pass++;
    return pass;
}
exports.internalCheckObject = internalCheckObject;
//# sourceMappingURL=internal.js.map