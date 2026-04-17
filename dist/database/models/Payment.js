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
const PaymentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow null for guest voters
    },
    type: {
        type: String,
        enum: ['registration', 'voting', 'live_show', 'premium_access'],
        required: [true, 'Payment type is required'],
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
        default: 'pending',
    },
    reference: {
        type: String,
        required: [true, 'Reference is required'],
        unique: true,
    },
    gatewayReference: {
        type: String,
        sparse: true,
    },
    gateway: {
        type: String,
        enum: ['paystack', 'flutterwave'],
        required: [true, 'Gateway is required'],
        default: 'paystack',
    },
    metadata: {
        creativeId: String,
        contestantId: String,
        votes: Number,
        bundleType: String,
        description: String,
    },
    paidAt: {
        type: Date,
    },
    verifiedAt: {
        type: Date,
    },
    failureReason: {
        type: String,
    },
}, {
    timestamps: true,
});
PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ reference: 1 });
PaymentSchema.index({ gatewayReference: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ type: 1 });
PaymentSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('Payment', PaymentSchema);
//# sourceMappingURL=Payment.js.map