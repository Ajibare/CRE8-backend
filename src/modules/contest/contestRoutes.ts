import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth';
import {
  createContest,
  getAllContests,
  getActiveContest,
  getContestById,
  updateContest,
  changeContestStatus,
  addWeeklyTask,
  activateWeeklyTask,
  deleteContest,
  getContestStatistics
} from './contestController';

const router = Router();

// Public routes
router.get('/', getAllContests);
router.get('/active', getActiveContest);
router.get('/:id', getContestById);
router.get('/:id/statistics', getContestStatistics);

// Admin only routes
router.post('/', authenticate, authorize('admin'), createContest);
router.put('/:id', authenticate, authorize('admin'), updateContest);
router.patch('/:id/status', authenticate, authorize('admin'), changeContestStatus);
router.post('/:id/tasks', authenticate, authorize('admin'), addWeeklyTask);
router.patch('/:id/tasks/:week/activate', authenticate, authorize('admin'), activateWeeklyTask);
router.delete('/:id', authenticate, authorize('admin'), deleteContest);

export default router;
