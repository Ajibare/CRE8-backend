"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const voucherSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discount: {
        type: Number,
        required: true,
        min: 0
    },
    type: {
        type: String,
        required: true,
        enum: ['REGISTRATION', 'VOTE', 'PREMIUM'],
        default: 'REGISTRATION'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    usedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    usedAt: {
        type: Date,
        default: null
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});
// Indexes for better performance
voucherSchema.index({ code: 1 });
voucherSchema.index({ isActive: 1, expiresAt: 1 });
voucherSchema.index({ usedBy: 1 });
// Methods
voucherSchema.methods.isExpired = function () {
    return this.expiresAt < new Date();
};
voucherSchema.methods.isUsed = function () {
    return this.usedBy !== null && this.usedAt !== null;
};
voucherSchema.methods.isValid = function () {
    return this.isActive && !this.isExpired() && !this.isUsed();
};
voucherSchema.methods.markAsUsed = function (userId) {
    this.usedBy = userId;
    this.usedAt = new Date();
    this.isActive = false;
    return this.save();
};
// Static methods
voucherSchema.statics.generateCode = function (prefix = 'FUNTECH') {
    // Generate 6-digit numeric code
    const digits = Math.floor(100000 + Math.random() * 900000);
    return digits.toString();
};
voucherSchema.statics.findByCode = function (code) {
    return this.findOne({ code: code.toUpperCase() });
};
voucherSchema.statics.validateVoucher = async function (code, type = 'REGISTRATION') {
    const voucher = await this.findByCode(code);
    if (!voucher) {
        return { valid: false, message: 'Invalid voucher code' };
    }
    if (!voucher.isActive) {
        return { valid: false, message: 'Voucher is not active' };
    }
    if (voucher.isExpired()) {
        return { valid: false, message: 'Voucher has expired' };
    }
    if (voucher.isUsed()) {
        return { valid: false, message: 'Voucher has already been used' };
    }
    if (voucher.type !== type) {
        return { valid: false, message: `Voucher is not valid for ${type.toLowerCase()}` };
    }
    return { valid: true, voucher, discount: voucher.discount };
};
const Voucher = mongoose_1.default.model('Voucher', voucherSchema);
exports.default = Voucher;
//# sourceMappingURL=Voucher.js.map