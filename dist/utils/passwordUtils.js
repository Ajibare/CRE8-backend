"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResetTokenHash = exports.generateResetToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const hashPassword = async (password) => {
    const salt = await bcryptjs_1.default.genSalt(12);
    return bcryptjs_1.default.hash(password, salt);
};
exports.hashPassword = hashPassword;
const comparePassword = async (password, hashedPassword) => {
    return bcryptjs_1.default.compare(password, hashedPassword);
};
exports.comparePassword = comparePassword;
const generateResetToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateResetToken = generateResetToken;
const generateResetTokenHash = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.generateResetTokenHash = generateResetTokenHash;
//# sourceMappingURL=passwordUtils.js.map