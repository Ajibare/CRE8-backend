"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReference = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateReference = (prefix = 'FUN') => {
    const timestamp = Date.now().toString();
    const randomBytes = crypto_1.default.randomBytes(3).toString('hex').toUpperCase();
    return `${prefix}${timestamp}${randomBytes}`;
};
exports.generateReference = generateReference;
//# sourceMappingURL=generateReference.js.map