"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UNDEF = Symbol();
function debug(value) {
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'undefined';
    if (value === true)
        return 'true';
    if (value === false)
        return 'false';
    if (typeof value === 'string') {
        const max = 20;
        return JSON.stringify(value.length > max ? `${value.substr(0, max)}…` : value);
    }
    if (typeof value === 'number')
        return value.toString();
    if (typeof value === 'symbol')
        return value.toString();
    if (value instanceof Function) {
        if (value.name.length > 0)
            return `function ${value.name}()`;
        return 'anonymous function';
    }
    if (value instanceof Array)
        return value.length > 0 ? `${value.constructor.name} with ${value.length} items` : `empty ${value.constructor.name}`;
    if (value instanceof Object) {
        if (value.constructor instanceof Function && value.constructor.name.length > 0) {
            if (value.constructor === Object) {
                const l = Object.keys(value).length;
                return l > 0 ? `Object with ${l} props` : 'empty Object';
            }
            return `instance of ${value.constructor.name}`;
        }
        return 'instance of anonymous class';
    }
    return 'unknown value';
}
exports.debug = debug;
function format(message, value = UNDEF, prefix) {
    const debugged = debug(value);
    return (typeof prefix === 'string' && prefix.length > 0 ? `${prefix}: ` : '') + message + (value !== UNDEF ? ` (received ${debugged})` : '');
}
exports.format = format;
//# sourceMappingURL=helpers.js.map