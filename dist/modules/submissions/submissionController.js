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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateSubmission = exports.getFeaturedSubmissions = exports.getPendingSubmissions = exports.reviewSubmission = exports.deleteSubmission = exports.updateSubmission = exports.getSubmissionById = exports.getContestSubmissions = exports.getUserSubmissions = exports.submitWork = void 0;
const Submission_1 = __importDefault(require("../../database/models/Submission"));
const Contest_1 = __importDefault(require("../../database/models/Contest"));
const User_1 = __importDefault(require("../../database/models/User"));
const cloudinaryUtils_1 = require("../../utils/cloudinaryUtils");
const emailService_1 = require("../../utils/emailService");
const contestPhase_1 = require("../../utils/contestPhase");
// Submit work for a weekly task
const submitWork = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;
        const userId = req.user._id;
        // Validate required fields
        if (!title || !description || !category) {
            return res.status(400).json({ message: 'Title, description, and category are required' });
        }
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'File is required' });
        }
        // Check current contest phase
        const currentPhase = (0, contestPhase_1.getCurrentPhase)();
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        let phase = 'audition';
        let contestWeek;
        // Phase-based submission rules
        if (currentPhase === 'ENDED') {
            return res.status(403).json({ message: 'Submissions are currently closed' });
        }
        if (currentPhase === 'AUDITION') {
            // Check if user already submitted during audition
            const canSubmit = await (0, contestPhase_1.canSubmitInAudition)(userId, Submission_1.default);
            if (!canSubmit) {
                return res.status(403).json({ message: 'You can only submit one video during the audition phase' });
            }
            phase = 'audition';
        }
        if (currentPhase === 'CONTEST') {
            // Check if user is selected for contest
            const contestCheck = await (0, contestPhase_1.canSubmitInContest)(userId, Submission_1.default, user.isSelectedForContest || false);
            if (!contestCheck.canSubmit) {
                return res.status(403).json({ message: contestCheck.message });
            }
            phase = 'contest';
            // Calculate current contest week (1-4)
            const now = new Date();
            const contestStart = new Date('2025-05-31T00:00:00Z');
            const daysDiff = Math.floor((now.getTime() - contestStart.getTime()) / (1000 * 60 * 60 * 24));
            contestWeek = Math.min(Math.floor(daysDiff / 7) + 1, 4);
        }
        if (currentPhase === 'GRAND_FINAL') {
            return res.status(403).json({ message: 'The grand final phase does not accept new submissions' });
        }
        // Upload file to Cloudinary
        const uploadResult = await (0, cloudinaryUtils_1.uploadToCloudinary)(req.file.buffer, {
            folder: `funtech/submissions`,
            resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'auto',
        });
        // Determine file type
        let fileType;
        if (req.file.mimetype.startsWith('image/')) {
            fileType = 'image';
        }
        else if (req.file.mimetype.startsWith('video/')) {
            fileType = 'video';
        }
        else if (req.file.mimetype.startsWith('audio/')) {
            fileType = 'audio';
        }
        else {
            fileType = 'document';
        }
        // Create submission
        const submission = new Submission_1.default({
            userId,
            title,
            description,
            category,
            fileUrl: uploadResult.secure_url,
            fileType,
            fileSize: req.file.size,
            thumbnailUrl: uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg') || uploadResult.secure_url,
            tags: tags ? tags.split(',').map((tag) => tag.trim()) : [],
            status: 'pending',
            phase,
            contestWeek
        });
        await submission.save();
        res.status(201).json({
            message: 'Work submitted successfully',
            submission
        });
    }
    catch (error) {
        console.error('Submit work error:', error);
        res.status(500).json({
            message: 'Failed to submit work',
            error: error.message
        });
    }
};
exports.submitWork = submitWork;
// Get user's submissions
const getUserSubmissions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status } = req.query;
        const filter = { userId };
        if (status)
            filter.status = status;
        const submissions = await Submission_1.default.find(filter)
            .sort({ submittedAt: -1 });
        res.json({ submissions });
    }
    catch (error) {
        console.error('Get user submissions error:', error);
        res.status(500).json({
            message: 'Failed to fetch submissions',
            error: error.message
        });
    }
};
exports.getUserSubmissions = getUserSubmissions;
// Get submissions for a contest (public)
const getContestSubmissions = async (req, res) => {
    try {
        const { contestId } = req.params;
        const { week, status, page = 1, limit = 20 } = req.query;
        // Validate contest exists
        const contest = await Contest_1.default.findById(contestId);
        if (!contest) {
            return res.status(404).json({ message: 'Contest not found' });
        }
        const filter = { contestId };
        if (week)
            filter.week = Number(week);
        if (status)
            filter.status = status;
        else
            filter.status = 'approved'; // Only show approved submissions by default
        const submissions = await Submission_1.default.find(filter)
            .populate('userId', 'name creativeId category profileImage')
            .sort({ votes: -1, submittedAt: -1 })
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
        console.error('Get contest submissions error:', error);
        res.status(500).json({
            message: 'Failed to fetch submissions',
            error: error.message
        });
    }
};
exports.getContestSubmissions = getContestSubmissions;
// Get submission by ID
const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission_1.default.findById(id)
            .populate('userId', 'name creativeId category profileImage');
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        res.json({ submission });
    }
    catch (error) {
        console.error('Get submission error:', error);
        res.status(500).json({
            message: 'Failed to fetch submission',
            error: error.message
        });
    }
};
exports.getSubmissionById = getSubmissionById;
// Update submission (user can only update their own pending submissions)
const updateSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, tags } = req.body;
        const userId = req.user._id;
        const submission = await Submission_1.default.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        // Check if user owns the submission
        if (submission.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'You can only update your own submissions' });
        }
        // Check if submission is still pending
        if (submission.status !== 'pending') {
            return res.status(400).json({ message: 'Can only update pending submissions' });
        }
        // Update submission
        const updates = {};
        if (title)
            updates.title = title;
        if (description)
            updates.description = description;
        if (tags)
            updates.tags = tags.split(',').map((tag) => tag.trim());
        const updatedSubmission = await Submission_1.default.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true, runValidators: true });
        res.json({
            message: 'Submission updated successfully',
            submission: updatedSubmission
        });
    }
    catch (error) {
        console.error('Update submission error:', error);
        res.status(500).json({
            message: 'Failed to update submission',
            error: error.message
        });
    }
};
exports.updateSubmission = updateSubmission;
// Delete submission (user can only delete their own pending submissions)
const deleteSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const submission = await Submission_1.default.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        // Check if user owns the submission or is admin
        if (submission.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'You can only delete your own submissions' });
        }
        // Check if submission is still pending (users can only delete pending submissions)
        if (submission.status !== 'pending' && req.user.role !== 'admin') {
            return res.status(400).json({ message: 'Can only delete pending submissions' });
        }
        // Delete file from Cloudinary
        try {
            await (0, cloudinaryUtils_1.deleteFromCloudinary)(submission.fileUrl);
        }
        catch (error) {
            console.error('Failed to delete file from Cloudinary:', error);
        }
        await Submission_1.default.findByIdAndDelete(id);
        res.json({
            message: 'Submission deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete submission error:', error);
        res.status(500).json({
            message: 'Failed to delete submission',
            error: error.message
        });
    }
};
exports.deleteSubmission = deleteSubmission;
// Admin: Review submission (approve/reject)
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
        // Update submission
        submission.status = status;
        submission.feedback = feedback;
        submission.reviewedAt = new Date();
        await submission.save();
        // If submission is rejected, also fail the user in contest phase
        if (status === 'rejected') {
            try {
                const user = await User_1.default.findById(submission.userId);
                if (user) {
                    user.isSelectedForContest = false;
                    await user.save();
                    // Send contest failure email
                    try {
                        const { emailTemplates } = await Promise.resolve().then(() => __importStar(require('../../utils/emailService')));
                        await Promise.resolve().then(() => __importStar(require('../../utils/emailService'))).then(({ sendEmail }) => {
                            return sendEmail(user.email, emailTemplates.contestFailed(user.name, feedback || 'Submission did not meet contest requirements').subject, emailTemplates.contestFailed(user.name, feedback || 'Submission did not meet contest requirements').html);
                        });
                    }
                    catch (emailErr) {
                        console.error('Failed to send contest failure email:', emailErr);
                    }
                }
            }
            catch (userError) {
                console.error('Failed to update user contest status:', userError);
            }
        }
        // Send email notification to user
        try {
            const user = await User_1.default.findById(submission.userId);
            if (user && user.email) {
                await (0, emailService_1.sendSubmissionReviewEmail)(user.email, user.name, submission.title, status, feedback);
            }
        }
        catch (emailError) {
            console.error('Failed to send review email:', emailError);
            // Don't fail the request if email fails
        }
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
// Admin: Get all submissions for review
const getPendingSubmissions = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const submissions = await Submission_1.default.find({ status: 'pending' })
            .populate('userId', 'name creativeId category profileImage')
            .sort({ submittedAt: 1 })
            .limit(Number(limit) * Number(page))
            .skip((Number(page) - 1) * Number(limit));
        const total = await Submission_1.default.countDocuments({ status: 'pending' });
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
        console.error('Get pending submissions error:', error);
        res.status(500).json({
            message: 'Failed to fetch pending submissions',
            error: error.message
        });
    }
};
exports.getPendingSubmissions = getPendingSubmissions;
// Get featured submissions (for homepage)
const getFeaturedSubmissions = async (req, res) => {
    try {
        const { contestId, limit = 6 } = req.query;
        const filter = { status: 'approved' };
        if (contestId)
            filter.contestId = contestId;
        const submissions = await Submission_1.default.find(filter)
            .populate('userId', 'name creativeId category profileImage')
            .sort({ votes: -1, submittedAt: -1 })
            .limit(Number(limit));
        res.json({ submissions });
    }
    catch (error) {
        console.error('Get featured submissions error:', error);
        res.status(500).json({
            message: 'Failed to fetch featured submissions',
            error: error.message
        });
    }
};
exports.getFeaturedSubmissions = getFeaturedSubmissions;
// Rate a submission
const rateSubmission = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user._id;
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
        const submission = await Submission_1.default.findById(id);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        // Check if user already rated
        const existingRating = submission.ratings.find(r => r.userId.toString() === userId.toString());
        if (existingRating) {
            return res.status(400).json({ message: 'You have already rated this submission' });
        }
        // Add rating
        submission.ratings.push({
            userId,
            rating,
            comment
        });
        // Calculate average rating
        const totalRating = submission.ratings.reduce((sum, r) => sum + r.rating, 0);
        submission.averageRating = totalRating / submission.ratings.length;
        await submission.save();
        res.json({
            message: 'Rating submitted successfully',
            submission
        });
    }
    catch (error) {
        console.error('Rate submission error:', error);
        res.status(500).json({
            message: 'Failed to rate submission',
            error: error.message
        });
    }
};
exports.rateSubmission = rateSubmission;
//# sourceMappingURL=submissionController.js.map