import express from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getUserById, updateAuditionStatus, updateContestStatus } from '../modules/admin/userManagementController';
import { reviewSubmission } from '../modules/admin/adminController';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// Get user by ID
router.get('/users/:id', getUserById);

// Update audition status (pass/fail)
router.post('/users/audition-status', updateAuditionStatus);

// Update contest status (pass/fail)
router.post('/users/contest-status', updateContestStatus);

// Submission review (approve/reject)
router.patch('/submissions/:id/review', reviewSubmission);

export default router;
