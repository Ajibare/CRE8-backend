"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContestStatistics = exports.deleteContest = exports.activateWeeklyTask = exports.addWeeklyTask = exports.changeContestStatus = exports.updateContest = exports.getContestById = exports.getActiveContest = exports.getAllContests = exports.createContest = void 0;
const Contest_1 = __importDefault(require("../../database/models/Contest"));
const User_1 = __importDefault(require("../../database/models/User"));
// Create a new contest (Admin only)
const createContest = async (req, res) => {
    try {
        const { title, description, startDate, endDate, registrationFee, prizes, categories, totalWeeks, weeklyTasks, settings } = req.body;
        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            return res.status(400).json({ message: 'End date must be after start date' });
        }
        // Check if there's an active contest
        const activeContest = await Contest_1.default.findOne({
            status: { $in: ['audition', 'active', 'voting'] }
        });
        if (activeContest) {
            return res.status(400).json({
                message: 'There is already an active contest. Please finish it before creating a new one.'
            });
        }
        const contest = new Contest_1.default({
            title,
            description,
            startDate: start,
            endDate: end,
            registrationFee,
            prizes,
            categories,
            totalWeeks: totalWeeks || 8,
            weeklyTasks: weeklyTasks || [],
            settings: {
                allowVoting: settings?.allowVoting ?? true,
                votingCost: settings?.votingCost ?? 100,
                maxVotesPerUser: settings?.maxVotesPerUser ?? 10,
                requireApprovalForSubmissions: settings?.requireApprovalForSubmissions ?? true,
            }
        });
        await contest.save();
        res.status(201).json({
            message: 'Contest created successfully',
            contest
        });
    }
    catch (error) {
        console.error('Create contest error:', error);
        res.status(500).json({
            message: 'Failed to create contest',
            error: error.message
        });
    }
};
exports.createContest = createContest;
// Get all contests
const getAllContests = async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        const contests = await Contest_1.default.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit) * Number(page))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Contest_1.default.countDocuments(filter);
        res.json({
            contests,
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
exports.getAllContests = getAllContests;
// Get active contest
const getActiveContest = async (req, res) => {
    try {
        const contest = await Contest_1.default.findOne({
            status: { $in: ['audition', 'active', 'voting'] }
        }).populate('weeklyTasks');
        if (!contest) {
            return res.status(404).json({ message: 'No active contest found' });
        }
        res.json({ contest });
    }
    catch (error) {
        console.error('Get active contest error:', error);
        res.status(500).json({
            message: 'Failed to fetch active contest',
            error: error.message
        });
    }
};
exports.getActiveContest = getActiveContest;
// Get contest by ID
const getContestById = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest_1.default.findById(id).populate('weeklyTasks');
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        res.json({ contest });
    }
    catch (error) {
        console.error('Get contest error:', error);
        res.status(500).json({
            message: 'Failed to fetch contest',
            error: error.message
        });
    }
};
exports.getContestById = getContestById;
// Update contest (Admin only)
const updateContest = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Validate dates if provided
        if (updates.startDate || updates.endDate) {
            const contest = await Contest_1.default.findById(id);
            if (!contest) {
                return res.status(404).json({ message: 'Contest not found' });
            }
            const start = updates.startDate ? new Date(updates.startDate) : contest.startDate;
            const end = updates.endDate ? new Date(updates.endDate) : contest.endDate;
            if (start >= end) {
                return res.status(400).json({ message: 'End date must be after start date' });
            }
        }
        const contest = await Contest_1.default.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true, runValidators: true });
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        res.json({
            message: 'Contest updated successfully',
            contest
        });
    }
    catch (error) {
        console.error('Update contest error:', error);
        res.status(500).json({
            message: 'Failed to update contest',
            error: error.message
        });
    }
};
exports.updateContest = updateContest;
// Change contest status (Admin only)
const changeContestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!['audition', 'active', 'voting', 'finished'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const contest = await Contest_1.default.findById(id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        // Business logic for status changes
        if (status === 'active' && contest.status === 'audition') {
            // Activate first week's task
            if (contest.weeklyTasks.length > 0) {
                contest.weeklyTasks[0].isActive = true;
                contest.currentWeek = 1;
            }
        }
        if (status === 'voting' && contest.status === 'active') {
            // Deactivate all weekly tasks
            contest.weeklyTasks.forEach(task => {
                task.isActive = false;
            });
        }
        contest.status = status;
        await contest.save();
        res.json({
            message: `Contest status changed to ${status}`,
            contest
        });
    }
    catch (error) {
        console.error('Change contest status error:', error);
        res.status(500).json({
            message: 'Failed to change contest status',
            error: error.message
        });
    }
};
exports.changeContestStatus = changeContestStatus;
// Add weekly task to contest (Admin only)
const addWeeklyTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { week, title, description, dueDate } = req.body;
        const contest = await Contest_1.default.findById(id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        // Check if week already exists
        const existingTask = contest.weeklyTasks.find(task => task.week === week);
        if (existingTask) {
            return res.status(400).json({ message: `Week ${week} task already exists` });
        }
        contest.weeklyTasks.push({
            week,
            title,
            description,
            dueDate: new Date(dueDate),
            isActive: false
        });
        // Sort tasks by week
        contest.weeklyTasks.sort((a, b) => a.week - b.week);
        await contest.save();
        res.json({
            message: 'Weekly task added successfully',
            contest
        });
    }
    catch (error) {
        console.error('Add weekly task error:', error);
        res.status(500).json({
            message: 'Failed to add weekly task',
            error: error.message
        });
    }
};
exports.addWeeklyTask = addWeeklyTask;
// Activate weekly task (Admin only)
const activateWeeklyTask = async (req, res) => {
    try {
        const { id, week } = req.params;
        const contest = await Contest_1.default.findById(id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        // Deactivate all tasks
        contest.weeklyTasks.forEach(task => {
            task.isActive = false;
        });
        // Activate specified task
        const task = contest.weeklyTasks.find(task => task.week === Number(week));
        if (!task) {
            return res.status(404).json({ message: 'Weekly task not found' });
        }
        task.isActive = true;
        contest.currentWeek = Number(week);
        await contest.save();
        res.json({
            message: `Week ${week} task activated successfully`,
            contest
        });
    }
    catch (error) {
        console.error('Activate weekly task error:', error);
        res.status(500).json({
            message: 'Failed to activate weekly task',
            error: error.message
        });
    }
};
exports.activateWeeklyTask = activateWeeklyTask;
// Delete contest (Admin only)
const deleteContest = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest_1.default.findById(id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        // Only allow deletion of finished contests
        if (contest.status !== 'finished') {
            return res.status(400).json({
                message: 'Only finished contests can be deleted'
            });
        }
        await Contest_1.default.findByIdAndDelete(id);
        res.json({
            message: 'Contest deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete contest error:', error);
        res.status(500).json({
            message: 'Failed to delete contest',
            error: error.message
        });
    }
};
exports.deleteContest = deleteContest;
// Get contest statistics
const getContestStatistics = async (req, res) => {
    try {
        const { id } = req.params;
        const contest = await Contest_1.default.findById(id);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        // Get participant count
        const participantCount = await User_1.default.countDocuments({
            isVerified: true,
            isApproved: true
        });
        const statistics = {
            contest: {
                title: contest.title,
                status: contest.status,
                currentWeek: contest.currentWeek,
                totalWeeks: contest.totalWeeks,
                startDate: contest.startDate,
                endDate: contest.endDate
            },
            participants: participantCount,
            prizes: contest.prizes,
            categories: contest.categories,
            settings: contest.settings
        };
        res.json({ statistics });
    }
    catch (error) {
        console.error('Get contest statistics error:', error);
        res.status(500).json({
            message: 'Failed to fetch contest statistics',
            error: error.message
        });
    }
};
exports.getContestStatistics = getContestStatistics;
//# sourceMappingURL=contestController.js.map