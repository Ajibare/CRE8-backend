import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth';
import {
  getProfile,
  updateProfile,
  updateProfileImage,
  changePassword,
  getPublicProfile,
  deleteAccount
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

// Protected routes
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.post('/me/image', authenticate, upload.single('image'), updateProfileImage);
router.post('/me/change-password', authenticate, changePassword);
router.delete('/me', authenticate, deleteAccount);

// Public profile
router.get('/:userId', getPublicProfile);

export default router;
