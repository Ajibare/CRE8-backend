"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContestStatus = exports.updateAuditionStatus = exports.getUserById = void 0;
const User_1 = __importDefault(require("../../database/models/User"));
const emailService_1 = require("../../utils/emailService");
// Get user details
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to fetch user', error });
    }
};
exports.getUserById = getUserById;
// Update audition status (Pass/Fail)
const updateAuditionStatus = async (req, res) => {
    try {
        const { userId, status, feedback } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.auditionStatus = status;
        // If passed, select for contest
        if (status === 'approved') {
            user.isSelectedForContest = true;
        }
        await user.save();
        // Send email notification
        const emailData = status === 'approved'
            ? emailService_1.emailTemplates.auditionPassed(user.name)
            : emailService_1.emailTemplates.auditionFailed(user.name, feedback);
        await (0, emailService_1.sendEmail)(user.email, emailData.subject, emailData.html);
        res.json({
            message: `User ${status === 'approved' ? 'passed' : 'failed'} audition`,
            user
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update audition status', error });
    }
};
exports.updateAuditionStatus = updateAuditionStatus;
// Update contest status (Pass/Fail)
const updateContestStatus = async (req, res) => {
    try {
        const { userId, status, feedback } = req.body;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // If passed, select for grand final
        if (status === 'approved') {
            user.isGrandFinalist = true;
        }
        await user.save();
        // Send email notification
        const emailData = status === 'approved'
            ? emailService_1.emailTemplates.contestPassed(user.name)
            : emailService_1.emailTemplates.contestFailed(user.name, feedback);
        await (0, emailService_1.sendEmail)(user.email, emailData.subject, emailData.html);
        res.json({
            message: `User ${status === 'approved' ? 'passed' : 'failed'} contest phase`,
            user
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Failed to update contest status', error });
    }
};
exports.updateContestStatus = updateContestStatus;
//# sourceMappingURL=userManagementController.js.map