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
const ContestSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Contest title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Contest description is required'],
    },
    status: {
        type: String,
        enum: ['audition', 'active', 'voting', 'finished'],
        default: 'audition',
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
    },
    registrationFee: {
        type: Number,
        required: [true, 'Registration fee is required'],
        default: 2000,
    },
    prizes: {
        first: {
            type: Number,
            required: true,
            default: 1500000,
        },
        second: {
            type: Number,
            required: true,
            default: 500000,
        },
        third: {
            type: Number,
            required: true,
            default: 250000,
        },
    },
    categories: [{
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
                'Advertising'
            ],
        }],
    currentWeek: {
        type: Number,
        default: 0,
    },
    totalWeeks: {
        type: Number,
        required: true,
        default: 8,
    },
    weeklyTasks: [{
            week: {
                type: Number,
                required: true,
            },
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            dueDate: {
                type: Date,
                required: true,
            },
            isActive: {
                type: Boolean,
                default: false,
            },
        }],
    settings: {
        allowVoting: {
            type: Boolean,
            default: true,
        },
        votingCost: {
            type: Number,
            default: 100,
        },
        maxVotesPerUser: {
            type: Number,
            default: 10,
        },
        requireApprovalForSubmissions: {
            type: Boolean,
            default: true,
        },
    },
}, {
    timestamps: true,
});
ContestSchema.index({ status: 1 });
ContestSchema.index({ startDate: 1 });
ContestSchema.index({ endDate: 1 });
exports.default = mongoose_1.default.model('Contest', ContestSchema);
//# sourceMappingURL=Contest.js.map