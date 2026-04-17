"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../../middlewares/auth");
const submissionController_1 = require("./submissionController");
const submissionEditController_1 = require("./submissionEditController");
const router = (0, express_1.Router)();
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images, videos, audio, and documents
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/avi',
            'video/mov',
            'video/wmv',
            'audio/mp3',
            'audio/wav',
            'audio/m4a',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation'
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only images, videos, audio, and documents are allowed.'));
        }
    }
});
// Public routes
router.get('/contest/:contestId', submissionController_1.getContestSubmissions);
router.get('/featured', submissionController_1.getFeaturedSubmissions);
router.get('/:id', submissionController_1.getSubmissionById);
// Protected routes (require authentication)
router.get('/user/my-submissions', auth_1.authenticate, submissionController_1.getUserSubmissions);
router.post('/', auth_1.authenticate, upload.single('file'), submissionController_1.submitWork);
router.get('/:submissionId/edit', auth_1.authenticate, submissionEditController_1.getSubmissionForEdit);
router.put('/:submissionId', auth_1.authenticate, submissionEditController_1.updateSubmission);
router.post('/:submissionId/replace-file', auth_1.authenticate, upload.single('file'), submissionEditController_1.replaceSubmissionFile);
router.delete('/:submissionId', auth_1.authenticate, submissionEditController_1.deleteSubmission);
router.post('/:id/rate', auth_1.authenticate, submissionController_1.rateSubmission);
// Admin only routes
router.get('/admin/pending', auth_1.authenticate, (0, auth_1.authorize)('admin'), submissionController_1.getPendingSubmissions);
router.patch('/:id/review', auth_1.authenticate, (0, auth_1.authorize)('admin'), submissionController_1.reviewSubmission);
exports.default = router;
//# sourceMappingURL=submissionRoutes.js.map