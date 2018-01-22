"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BlorkError extends Error {
    constructor(message) {
        super(message);
        this.message = 'Invalid configuration';
        this.name = BlorkError.name;
        if (message)
            this.message = message;
    }
}
BlorkError[Symbol.toStringTag] = BlorkError.name;
exports.BlorkError = BlorkError;
//# sourceMappingURL=errors.js.map