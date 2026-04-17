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
// Protected routes
router.get('/me', auth_1.authenticate, profileController_1.getProfile);
router.put('/me', auth_1.authenticate, profileController_1.updateProfile);
router.post('/me/image', auth_1.authenticate, upload.single('image'), profileController_1.updateProfileImage);
router.post('/me/change-password', auth_1.authenticate, profileController_1.changePassword);
router.delete('/me', auth_1.authenticate, profileController_1.deleteAccount);
// Public profile
router.get('/:userId', profileController_1.getPublicProfile);
exports.default = router;
//# sourceMappingURL=profileRoutes.js.map