"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BlorkError extends Error {
    constructor() {
        super(...arguments);
        this.message = 'Invalid configuration';
        this.name = BlorkError.name;
    }
}
BlorkError[Symbol.toStringTag] = BlorkError.name;
exports.BlorkError = BlorkError;
//# sourceMappingURL=errors.js.map