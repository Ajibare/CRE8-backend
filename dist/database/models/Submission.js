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
const SubmissionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    title: {
        type: String,
        required: [true, 'Submission title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: 1000,
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
    },
    fileUrl: {
        type: String,
        required: [true, 'File URL is required'],
    },
    fileType: {
        type: String,
        enum: ['image', 'video', 'audio', 'document'],
        required: [true, 'File type is required'],
    },
    fileSize: {
        type: Number,
        required: [true, 'File size is required'],
    },
    thumbnailUrl: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    feedback: {
        type: String,
        maxlength: 500,
    },
    votes: {
        type: Number,
        default: 0,
    },
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
    },
    ratings: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5,
            },
            comment: {
                type: String,
                maxlength: 300,
            },
        }],
    tags: [{
            type: String,
            trim: true,
        }],
    phase: {
        type: String,
        enum: ['audition', 'contest', 'grand_final'],
        required: true,
    },
    contestWeek: {
        type: Number,
        min: 1,
        max: 4,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    },
    reviewedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});
SubmissionSchema.index({ userId: 1, contestId: 1, week: 1 }, { unique: true });
SubmissionSchema.index({ contestId: 1, week: 1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ votes: -1 });
exports.default = mongoose_1.default.model('Submission', SubmissionSchema);
//# sourceMappingURL=Submission.js.map