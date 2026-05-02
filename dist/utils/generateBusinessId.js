"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBusinessId = void 0;
const User_1 = __importDefault(require("../database/models/User"));
const generateBusinessId = async () => {
    const prefix = 'BUS';
    // Find the highest business ID with BUS prefix
    const lastUser = await User_1.default.findOne({
        creativeId: { $regex: `^${prefix}\d{6}$` }
    }).sort({ creativeId: -1 });
    let sequenceNumber = 1;
    if (lastUser && lastUser.creativeId) {
        // Extract the sequence number from the last ID (e.g., BUS000123 -> 123)
        const lastSequence = parseInt(lastUser.creativeId.substring(3));
        sequenceNumber = lastSequence + 1;
    }
    // Format with leading zeros (6 digits)
    const paddedSequence = sequenceNumber.toString().padStart(6, '0');
    return `${prefix}${paddedSequence}`;
};
exports.generateBusinessId = generateBusinessId;
//# sourceMappingURL=generateBusinessId.js.map