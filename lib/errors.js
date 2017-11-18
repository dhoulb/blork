"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BlorkError extends Error {
}
BlorkError.message = "Blork: You're using it wrong!";
BlorkError[Symbol.toStringTag] = 'BlorkError';
exports.BlorkError = BlorkError;
//# sourceMappingURL=errors.js.map