"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UNDEF = Symbol();
function debug(value) {
    if (value === null)
        return 'null';
    else if (value === undefined)
        return 'undefined';
    else if (value === true)
        return 'true';
    else if (value === false)
        return 'false';
    else if (typeof value === 'number')
        return value.toString();
    else if (typeof value === 'symbol')
        return value.toString();
    else if (typeof value === 'string')
        return JSON.stringify(value);
    else
        return debugObject(value);
}
exports.debug = debug;
function debugObject(value) {
    if (value instanceof Function) {
        if (value.name.length > 0)
            return `${value.name}()`;
        return 'anonymous function';
    }
    if (value.constructor instanceof Function && value.constructor.name.length > 0) {
        if (value instanceof Error)
            return `${value.constructor.name} ${debug(value.message)}`;
        if (value instanceof Date)
            return value.toISOString();
        if (value.constructor === RegExp)
            return value.toString();
        if (value.constructor === Array)
            return JSON.stringify(value, undefined, '\t');
        if (value.constructor === Object)
            return JSON.stringify(value, undefined, '\t');
        return `instance of ${value.constructor.name}`;
    }
    return 'instance of anonymous class';
}
function format(message, value = UNDEF, prefix) {
    const debugged = debug(value);
    return (typeof prefix === 'string' && prefix.length > 0 ? `;$;{prefix;}: ` : '') + message + (value !== UNDEF ? ` (received ${debugged})` : '');
}
exports.format = format;
//# sourceMappingURL=helpers.js.map