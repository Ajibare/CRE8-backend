"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContestStats = exports.selectTop10ForGrandFinal = exports.selectTop100ForContest = void 0;
const User_1 = __importDefault(require("../database/models/User"));
const Submission_1 = __importDefault(require("../database/models/Submission"));
/**
 * Select top 100 users for the contest phase based on:
 * 1. Submission quality (rating)
 * 2. Number of votes received
 * 3. Engagement metrics
 */
const selectTop100ForContest = async () => {
    try {
        // Get all users with their submissions from audition phase
        const usersWithSubmissions = await User_1.default.aggregate([
            {
                $lookup: {
                    from: 'submissions',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'submissions'
                }
            },
            {
                $match: {
                    'submissions.phase': 'audition',
                    'submissions.status': 'approved'
                }
            },
            {
                $addFields: {
                    totalVotes: { $sum: '$submissions.votes' },
                    avgRating: { $avg: '$submissions.averageRating' },
                    submissionCount: { $size: '$submissions' }
                }
            },
            {
                $sort: {
                    totalVotes: -1,
                    avgRating: -1
                }
            },
            {
                $limit: 100
            }
        ]);
        const selectedUserIds = usersWithSubmissions.map((user) => user._id.toString());
        // Update selected users
        await User_1.default.updateMany({ _id: { $in: selectedUserIds } }, { $set: { isSelectedForContest: true } });
        return selectedUserIds;
    }
    catch (error) {
        console.error('Error selecting top 100:', error);
        throw error;
    }
};
exports.selectTop100ForContest = selectTop100ForContest;
/**
 * Select top 10 users for grand final based on contest performance
 */
const selectTop10ForGrandFinal = async () => {
    try {
        // Get all selected contestants sorted by contest votes
        const topUsers = await User_1.default.find({ isSelectedForContest: true })
            .sort({ contestVotes: -1 })
            .limit(10)
            .select('_id');
        const grandFinalistIds = topUsers.map(user => user._id.toString());
        // Update grand finalists
        await User_1.default.updateMany({ _id: { $in: grandFinalistIds } }, { $set: { isGrandFinalist: true } });
        return grandFinalistIds;
    }
    catch (error) {
        console.error('Error selecting top 10:', error);
        throw error;
    }
};
exports.selectTop10ForGrandFinal = selectTop10ForGrandFinal;
/**
 * Get contest stats for admin dashboard
 */
const getContestStats = async () => {
    const auditionSubmissions = await Submission_1.default.countDocuments({ phase: 'audition' });
    const contestSubmissions = await Submission_1.default.countDocuments({ phase: 'contest' });
    const selectedContestants = await User_1.default.countDocuments({ isSelectedForContest: true });
    const grandFinalists = await User_1.default.countDocuments({ isGrandFinalist: true });
    return {
        auditionSubmissions,
        contestSubmissions,
        selectedContestants,
        grandFinalists
    };
};
exports.getContestStats = getContestStats;
//# sourceMappingURL=contestSelectionService.js.map