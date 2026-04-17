"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportData = exports.getFinancialReports = exports.getVotingAnalytics = exports.reviewSubmission = exports.getSubmissions = exports.getContests = exports.updateUserStatus = exports.getUsers = exports.getDashboardStats = void 0;
const User_1 = __importDefault(require("../../database/models/User"));
const Contest_1 = __importDefault(require("../../database/models/Contest"));
const Submission_1 = __importDefault(require("../../database/models/Submission"));
const Vote_1 = __importDefault(require("../../database/models/Vote"));
const Payment_1 = __importDefault(require("../../database/models/Payment"));
// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
    try {
        const [totalUsers, verifiedUsers, totalContests, activeContests, totalSubmissions, pendingSubmissions, totalVotes, totalRevenue, recentUsers, recentSubmissions, recentVotes] = await Promise.all([
            User_1.default.countDocuments(),
            User_1.default.countDocuments({ isVerified: true }),
            Contest_1.default.countDocuments(),
            Contest_1.default.countDocuments({ status: { $in: ['audition', 'active', 'voting'] } }),
            Submission_1.default.countDocuments(),
            Submission_1.default.countDocuments({ status: 'pending' }),
            Vote_1.default.countDocuments({ isVerified: true }),
            Payment_1.default.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            User_1.default.find().sort({ createdAt: -1 }).limit(5),
            Submission_1.default.find().sort({ createdAt: -1 }).limit(5),
            Vote_1.default.find().sort({ createdAt: -1 }).limit(5)
        ]);
        res.json({
            stats: {
                users: {
                    total: totalUsers,
                    verified: verifiedUsers,
                    pending: totalUsers - verifiedUsers
                },
                contests: {
                    total: totalContests,
                    active: activeContests,
                    completed: totalContests - activeContests
                },
                submissions: {
                    total: totalSubmissions,
                    pending: pendingSubmissions,
                    approved: totalSubmissions - pendingSubmissions
                },
                voting: {
                    totalVotes: totalVotes,
                    totalRevenue: totalRevenue[0]?.total || 0
                }
            },
            recent: {
                users: recentUsers,
                submissions: recentSubmissions,
                votes: recentVotes
            }
        });
    }
    catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            message: 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};
exports.getDashboardStats = getDashboardStats;
// Get user management data
const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, role, search } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (role)
            filter.role = role;
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { creativeId: { $regex: search, $options: 'i' } }
            ];
        }
        const users = await User_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit) * Number(page))
            .skip((Number(page) - 1) * Number(limit))
            .select('-password');
        const total = await User_1.default.countDocuments(filter);
        res.json({
            users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            message: 'Failed to fetch users',
            error: error.message
        });
    }
};
exports.getUsers = getUsers;
// Approve or reject user
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        if (!['approved', 'rejected', 'suspended'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const user = await User_1.default.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.isApproved = status === 'approved';
        await user.save();
        res.json({
            message: `User ${status} successfully`,
            user
        });
    }
    catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            message: 'Failed to update user status',
            error: error.message
        });
    }
};
exports.updateUserStatus = updateUserStatus;
// Get contest management data
const getContests = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        const contests = await Contest_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit) * Number(page))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Contest_1.default.countDocuments(filter);
        // Add statistics for each contest
        const contestsWithStats = await Promise.all(contests.map(async (contest) => {
            const [participantCount, submissionCount, voteCount] = await Promise.all([
                User_1.default.countDocuments({ isVerified: true, isApproved: true }),
                Submission_1.default.countDocuments({ contestId: contest._id }),
                Vote_1.default.countDocuments({ contestId: contest._id, isVerified: true })
            ]);
            return {
                ...contest.toObject(),
                stats: {
                    participants: participantCount,
                    submissions: submissionCount,
                    votes: voteCount
                }
            };
        }));
        res.json({
            contests: contestsWithStats,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get contests error:', error);
        res.status(500).json({
            message: 'Failed to fetch contests',
            error: error.message
        });
    }
};
exports.getContests = getContests;
// Get submission management data
const getSubmissions = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, contestId } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (contestId)
            filter.contestId = contestId;
        const submissions = await Submission_1.default.find(filter)
            .populate('userId', 'name creativeId category profileImage')
            .sort({ createdAt: -1 })
            .limit(Number(limit) * Number(page))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Submission_1.default.countDocuments(filter);
        res.json({
            submissions,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Get submissions error:', error);
        res.status(500).json({
            message: 'Failed to fetch submissions',
            error: error.message
        });
    }
};
exports.getSubmissions = getSubmissions;
// Review submission
const reviewSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, feedback } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const submission = await Submission_1.default.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        submission.status = status;
        submission.feedback = feedback;
        submission.reviewedAt = new Date();
        await submission.save();
        // Send notification to user (you can implement this later)
        // await sendNotification(submission.userId, {
        //   type: 'submission_reviewed',
        //   message: `Your submission has been ${status}`,
        //   data: { submissionId: submission._id, status, feedback }
        // });
        res.json({
            message: `Submission ${status} successfully`,
            submission
        });
    }
    catch (error) {
        console.error('Review submission error:', error);
        res.status(500).json({
            message: 'Failed to review submission',
            error: error.message
        });
    }
};
exports.reviewSubmission = reviewSubmission;
// Get voting analytics
const getVotingAnalytics = async (req, res) => {
    try {
        const { contestId, startDate, endDate } = req.query;
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.createdAt = {};
            if (startDate)
                dateFilter.createdAt.$gte = new Date(startDate);
            if (endDate)
                dateFilter.createdAt.$lte = new Date(endDate);
        }
        const filter = { isVerified: true, ...dateFilter };
        if (contestId)
            filter.contestId = contestId;
        const [totalVotes, totalRevenue, votesByDay, topVoters, topContestants, voteBundles] = await Promise.all([
            Vote_1.default.countDocuments(filter),
            Vote_1.default.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Vote_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        votes: { $sum: '$votesCount' },
                        revenue: { $sum: '$amount' }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Vote_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$voterId',
                        totalVotes: { $sum: '$votesCount' },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { totalVotes: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $project: {
                        userName: '$user.name',
                        userEmail: '$user.email',
                        totalVotes: 1,
                        totalAmount: 1
                    }
                }
            ]),
            Vote_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$contestantId',
                        totalVotes: { $sum: '$votesCount' },
                        totalAmount: { $sum: '$amount' }
                    }
                },
                { $sort: { totalVotes: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'contestant'
                    }
                },
                {
                    $project: {
                        contestantName: '$contestant.name',
                        contestantId: '$contestant.creativeId',
                        totalVotes: 1,
                        totalAmount: 1
                    }
                }
            ]),
            Vote_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$voteBundle.type',
                        count: { $sum: 1 },
                        totalVotes: { $sum: '$votesCount' },
                        totalRevenue: { $sum: '$amount' }
                    }
                }
            ])
        ]);
        res.json({
            analytics: {
                totalVotes,
                totalRevenue: totalRevenue[0]?.total || 0,
                votesByDay,
                topVoters,
                topContestants,
                voteBundles
            }
        });
    }
    catch (error) {
        console.error('Get voting analytics error:', error);
        res.status(500).json({
            message: 'Failed to fetch voting analytics',
            error: error.message
        });
    }
};
exports.getVotingAnalytics = getVotingAnalytics;
// Get financial reports
const getFinancialReports = async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.paidAt = {};
            if (startDate)
                dateFilter.paidAt.$gte = new Date(startDate);
            if (endDate)
                dateFilter.paidAt.$lte = new Date(endDate);
        }
        const filter = { status: 'completed', ...dateFilter };
        if (type)
            filter.type = type;
        const [totalRevenue, revenueByType, revenueByDay, registrationsRevenue, votingRevenue, paymentMethods] = await Promise.all([
            Payment_1.default.aggregate([
                { $match: filter },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Payment_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$type',
                        total: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ]),
            Payment_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
                        revenue: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Payment_1.default.aggregate([
                { $match: { ...filter, type: { $in: ['REGISTRATION', 'REGISTRATION_WITH_VOUCHER'] } } },
                { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
            ]),
            Payment_1.default.aggregate([
                { $match: { ...filter, type: 'VOTE_SINGLE' } },
                { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
            ]),
            Payment_1.default.aggregate([
                { $match: filter },
                {
                    $group: {
                        _id: '$paymentMethod',
                        total: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                }
            ])
        ]);
        res.json({
            financial: {
                totalRevenue: totalRevenue[0]?.total || 0,
                revenueByType,
                revenueByDay,
                registrations: registrationsRevenue[0] || { total: 0, count: 0 },
                voting: votingRevenue[0] || { total: 0, count: 0 },
                paymentMethods
            }
        });
    }
    catch (error) {
        console.error('Get financial reports error:', error);
        res.status(500).json({
            message: 'Failed to fetch financial reports',
            error: error.message
        });
    }
};
exports.getFinancialReports = getFinancialReports;
// Export data to CSV
const exportData = async (req, res) => {
    try {
        const { type, startDate, endDate } = req.query;
        let data = [];
        let filename = '';
        switch (type) {
            case 'users':
                data = await User_1.default.find({}).select('-password');
                filename = 'users.csv';
                break;
            case 'submissions':
                data = await Submission_1.default.find({}).populate('userId', 'name email');
                filename = 'submissions.csv';
                break;
            case 'votes':
                data = await Vote_1.default.find({}).populate('voterId', 'name email');
                filename = 'votes.csv';
                break;
            case 'payments':
                data = await Payment_1.default.find({ status: 'completed' });
                filename = 'payments.csv';
                break;
            default:
                return res.status(400).json({ message: 'Invalid export type' });
        }
        // Convert to CSV (simplified - you might want to use a proper CSV library)
        const csv = data.map(item => JSON.stringify(item)).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(csv);
    }
    catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({
            message: 'Failed to export data',
            error: error.message
        });
    }
};
exports.exportData = exportData;
//# sourceMappingURL=adminController.js.map