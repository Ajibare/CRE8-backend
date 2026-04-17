"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubmissionForEdit = exports.deleteSubmission = exports.replaceSubmissionFile = exports.updateSubmission = void 0;
const Submission_1 = __importDefault(require("../../database/models/Submission"));
const cloudinaryUtils_1 = require("../../utils/cloudinaryUtils");
// Update submission
const updateSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { title, description, tags } = req.body;
        const userId = req.user._id;
        // Find submission
        const submission = await Submission_1.default.findOne({
            _id: submissionId,
            userId
        });
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        // Update fields
        if (title)
            submission.title = title;
        if (description !== undefined)
            submission.description = description;
        if (tags) {
            submission.tags = typeof tags === 'string'
                ? tags.split(',').map((tag) => tag.trim())
                : tags;
        }
        await submission.save();
        res.json({
            message: 'Submission updated successfully',
            submission
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
// Replace submission file
const replaceSubmissionFile = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user._id;
        // Find submission
        const submission = await Submission_1.default.findOne({
            _id: submissionId,
            userId
        });
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'New file is required' });
        }
        // Delete old file from Cloudinary
        if (submission.fileUrl) {
            try {
                // Extract public_id from URL
                const urlParts = submission.fileUrl.split('/');
                const filename = urlParts[urlParts.length - 1];
                const folder = urlParts.slice(urlParts.indexOf('submissions')).join('/').replace(filename, '');
                const publicId = `funtech/${folder}${filename.split('.')[0]}`;
                await (0, cloudinaryUtils_1.deleteFromCloudinary)(publicId);
            }
            catch (error) {
                console.log('Error deleting old file:', error);
            }
        }
        // Upload new file
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
        // Update submission with new file info
        submission.fileUrl = uploadResult.secure_url;
        submission.fileType = fileType;
        submission.fileSize = req.file.size;
        submission.thumbnailUrl = uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg') || uploadResult.secure_url;
        submission.status = 'pending';
        submission.feedback = undefined;
        submission.reviewedAt = undefined;
        await submission.save();
        res.json({
            message: 'File replaced successfully',
            submission
        });
    }
    catch (error) {
        console.error('Replace submission file error:', error);
        res.status(500).json({
            message: 'Failed to replace file',
            error: error.message
        });
    }
};
exports.replaceSubmissionFile = replaceSubmissionFile;
// Delete submission
const deleteSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user._id;
        // Find submission
        const submission = await Submission_1.default.findOne({
            _id: submissionId,
            userId
        });
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        // Delete file from Cloudinary
        if (submission.fileUrl) {
            try {
                const urlParts = submission.fileUrl.split('/');
                const filename = urlParts[urlParts.length - 1];
                const folder = urlParts.slice(urlParts.indexOf('submissions')).join('/').replace(filename, '');
                const publicId = `funtech/${folder}${filename.split('.')[0]}`;
                await (0, cloudinaryUtils_1.deleteFromCloudinary)(publicId);
            }
            catch (error) {
                console.log('Error deleting file from Cloudinary:', error);
            }
        }
        // Delete submission
        await Submission_1.default.findByIdAndDelete(submissionId);
        res.json({ message: 'Submission deleted successfully' });
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
// Get single submission for editing
const getSubmissionForEdit = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const userId = req.user._id;
        const submission = await Submission_1.default.findOne({
            _id: submissionId,
            userId
        });
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }
        res.json({
            submission,
            canEdit: true
        });
    }
    catch (error) {
        console.error('Get submission for edit error:', error);
        res.status(500).json({
            message: 'Failed to fetch submission',
            error: error.message
        });
    }
};
exports.getSubmissionForEdit = getSubmissionForEdit;
//# sourceMappingURL=submissionEditController.js.map