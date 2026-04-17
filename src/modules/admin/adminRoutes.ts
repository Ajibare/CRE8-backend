import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth';
import {
  getDashboardStats,
  getUsers,
  updateUserStatus,
  getContests,
  getSubmissions,
  reviewSubmission,
  getVotingAnalytics,
  getFinancialReports,
  exportData
} from './adminController';

const router = Router();

// Dashboard
router.get('/dashboard', authenticate, authorize('admin'), getDashboardStats);

// User Management
router.get('/users', authenticate, authorize('admin'), getUsers);
router.patch('/users/:id/status', authenticate, authorize('admin'), updateUserStatus);

// Contest Management
router.get('/contests', authenticate, authorize('admin'), getContests);

// Submission Management
router.get('/submissions', authenticate, authorize('admin'), getSubmissions);
router.patch('/submissions/:id/review', authenticate, authorize('admin'), reviewSubmission);

// Analytics
router.get('/analytics/voting', authenticate, authorize('admin'), getVotingAnalytics);
router.get('/analytics/financial', authenticate, authorize('admin'), getFinancialReports);

// Data Export
router.get('/export/:type', authenticate, authorize('admin'), exportData);

export default router;
