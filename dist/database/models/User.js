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
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        default: '',
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        default: '',
        trim: true,
    },
    password: {
        type: String,
        minlength: 6,
        select: false, // Don't include password in queries by default
    },
    role: {
        type: String,
        enum: ['admin', 'creative', 'voter'],
        default: 'creative',
    },
    creativeId: {
        type: String,
        unique: true,
        sparse: true,
    },
    category: {
        type: String,
        enum: [
            'Design',
            'Video Editing',
            'Music',
            'Content Creation',
            'Photography',
            'Writing',
            'UI/UX Design',
            'Web Design',
            'Illustration',
            'Digital Art',
            'Fashion Design',
            'Creative Direction',
            'Advertising',
            'Art & Craft',
            'Business & Creative Strategist',
            'Business Support Program'
        ],
    },
    country: {
        type: String,
        default: '',
    },
    state: {
        type: String,
        default: '',
    },
    city: {
        type: String,
        default: '',
    },
    dateOfBirth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
    },
    profileImage: {
        type: String,
    },
    bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
    experience: {
        type: String,
        maxlength: [1000, 'Experience cannot exceed 1000 characters'],
    },
    education: {
        type: String,
        maxlength: [500, 'Education cannot exceed 500 characters'],
    },
    skills: [{
            type: String,
            trim: true,
        }],
    portfolio: {
        type: String,
    },
    socialLinks: {
        instagram: String,
        twitter: String,
        facebook: String,
        youtube: String,
        tiktok: String,
        linkedin: String,
    },
    socialFollowStatus: {
        instagram: { type: Boolean, default: false },
        facebook: { type: Boolean, default: false },
        twitter: { type: Boolean, default: false },
        youtube: { type: Boolean, default: false },
        tiktok: { type: Boolean, default: false },
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isApproved: {
        type: Boolean,
        default: false,
    },
    auditionStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    auditionDate: {
        type: Date,
    },
    // Contest phase fields
    isSelectedForContest: {
        type: Boolean,
        default: false,
    },
    contestVotes: {
        type: Number,
        default: 0,
    },
    isGrandFinalist: {
        type: Boolean,
        default: false,
    },
    grandFinalVotes: {
        type: Number,
        default: 0,
    },
    voucherUsed: {
        type: String,
    },
    referralCode: {
        type: String,
        index: true, // Index for faster queries
    },
    passwordResetToken: {
        type: String,
        select: false,
    },
    passwordResetExpires: {
        type: Date,
        select: false,
    },
    lastPasswordReset: {
        type: Date,
    },
    verificationToken: {
        type: String,
        select: false,
    },
    verificationExpires: {
        type: Date,
        select: false,
    },
}, {
    timestamps: true,
});
UserSchema.index({ email: 1 });
UserSchema.index({ creativeId: 1 });
UserSchema.index({ role: 1 });
exports.default = mongoose_1.default.model('User', UserSchema);
//# sourceMappingURL=User.js.map