import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth';
import {
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
  getPublicProfile,
  deleteAccount,
  uploadBusinessVideo
} from './profileController';

const router = Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for profile images
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for profile pictures'));
    }
  }
});

// Configure multer for video uploads (100MB limit)
const videoUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
  fileFilter: (req, file, cb) => {
    // Accept video files only
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// Protected routes
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.post('/me/image', authenticate, upload.single('image'), updateProfileImage);
router.post('/me/change-password', authenticate, changePassword);
router.delete('/me', authenticate, deleteAccount);
router.post('/me/business-video', authenticate, videoUpload.single('video'), uploadBusinessVideo);

// Public profile
router.get('/:userId', getPublicProfile);

export default router;
