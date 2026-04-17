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
const VoteSchema = new mongoose_1.Schema({
    voterId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Allow null for guest voters
    },
    contestantId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Contestant ID is required'],
    },
    submissionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Submission',
    },
    votesCount: {
        type: Number,
        required: [true, 'Votes count is required'],
        min: 1,
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: 0,
    },
    paymentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Payment',
        required: [true, 'Payment ID is required'],
    },
    ipAddress: {
        type: String,
        required: [true, 'IP address is required'],
    },
    userAgent: {
        type: String,
        required: [true, 'User agent is required'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    voteBundle: {
        votes: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        type: {
            type: String,
            enum: ['single', 'bundle_5', 'bundle_10', 'bundle_25'],
            required: true,
        },
    },
}, {
    timestamps: true,
});
VoteSchema.index({ voterId: 1, contestantId: 1 });
VoteSchema.index({ contestantId: 1 });
VoteSchema.index({ paymentId: 1 });
VoteSchema.index({ createdAt: -1 });
VoteSchema.index({ ipAddress: 1 });
exports.default = mongoose_1.default.model('Vote', VoteSchema);
//# sourceMappingURL=Vote.js.map