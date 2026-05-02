"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../../middlewares/auth");
const profileController_1 = require("./profileController");
const router = (0, express_1.Router)();
// Configure multer for memory storage
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for profile images
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only image files are allowed for profile pictures'));
        }
    }
});
// Configure multer for video uploads (100MB limit)
const videoUpload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
    fileFilter: (req, file, cb) => {
        // Accept video files only
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only video files are allowed'));
        }
    }
});
// Protected routes
router.get('/me', auth_1.authenticate, profileController_1.getProfile);
router.put('/me', auth_1.authenticate, profileController_1.updateProfile);
router.post('/me/image', auth_1.authenticate, upload.single('image'), profileController_1.updateProfileImage);
router.post('/me/change-password', auth_1.authenticate, profileController_1.changePassword);
router.delete('/me', auth_1.authenticate, profileController_1.deleteAccount);
router.post('/me/business-video', auth_1.authenticate, videoUpload.single('video'), profileController_1.uploadBusinessVideo);
// Public profile
router.get('/:userId', profileController_1.getPublicProfile);
exports.default = router;
//# sourceMappingURL=profileRoutes.js.map