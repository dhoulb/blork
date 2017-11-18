"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function debug(value) {
    switch (value) {
        case null: return 'null';
        case undefined: return 'undefined';
        case true: return 'true';
        case false: return 'false';
        default: switch (typeof value) {
            case 'string': return JSON.stringify(value.length > 20 ? value.substr(0, 20) + '…' : value);
            case 'number': return value.toString();
            case 'function': return value.name ? 'function ' + value.name + '()' : 'anonymous function';
            case 'object': switch (value.constructor) {
                case Object:
                    const l = Object.entries(value).length;
                    l ? 'object {} with ' + l + ' props' : 'empty object';
                case Array: return value.length ? 'Array with ' + value.length + ' items' : 'empty array';
                case Map:
                case Set: return value.size ? 'empty ' + value.constructor.name : value.constructor.name + ' with ' + value.size + ' items';
                default: return value.constructor.name ? 'instance of ' + value.constructor.name : 'instance of anonymous class';
            }
        }
    }
}
exports.debug = debug;
function format(message, value, prefix) {
    return (prefix ? prefix + ': ' : '') + message + (typeof value !== undefined ? ' (received ' + debug(value) + ')' : '');
}
exports.format = format;
//# sourceMappingURL=helpers.js.map