import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../../middlewares/auth';
import {
  submitWork,
  getUserSubmissions,
  getContestSubmissions,
  getSubmissionById,
  reviewSubmission,
  getPendingSubmissions,
  getFeaturedSubmissions,
  rateSubmission
} from './submissionController';
import {
  updateSubmission,
  replaceSubmissionFile,
  deleteSubmission,
  getSubmissionForEdit
} from './submissionEditController';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
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
    } else {
      cb(new Error('Invalid file type. Only images, videos, audio, and documents are allowed.'));
    }
  }
});

// Public routes
router.get('/contest/:contestId', getContestSubmissions);
router.get('/featured', getFeaturedSubmissions);
router.get('/:id', getSubmissionById);

// Protected routes (require authentication)
router.get('/user/my-submissions', authenticate, getUserSubmissions);
router.post('/', authenticate, upload.single('file'), submitWork);
router.get('/:submissionId/edit', authenticate, getSubmissionForEdit);
router.put('/:submissionId', authenticate, updateSubmission);
router.post('/:submissionId/replace-file', authenticate, upload.single('file'), replaceSubmissionFile);
router.delete('/:submissionId', authenticate, deleteSubmission);
router.post('/:id/rate', authenticate, rateSubmission);

// Admin only routes
router.get('/admin/pending', authenticate, authorize('admin'), getPendingSubmissions);
router.patch('/:id/review', authenticate, authorize('admin'), reviewSubmission);

export default router;
