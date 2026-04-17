import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth';
import {
  initiateVotingPayment,
  handleVotingCallback,
  getVotingBundles,
  getUserVotingHistory,
  getSubmissionVotes,
  getContestLeaderboard,
  getVotingStatistics,
  checkVotingPatterns
} from './votingController';

const router = Router();

// Public routes
router.get('/bundles', getVotingBundles);
router.get('/contest/:contestId/leaderboard', getContestLeaderboard);
router.get('/contest/:contestId/statistics', getVotingStatistics);
router.get('/submission/:submissionId/votes', getSubmissionVotes);
router.get('/patterns/check', checkVotingPatterns);

// Protected routes (require authentication)
router.get('/history', authenticate, getUserVotingHistory);

// Public voting route (allow guest voters)
router.post('/initiate', initiateVotingPayment);

// Payment callback (webhook)
router.get('/callback', handleVotingCallback);

// Admin only routes
router.get('/patterns/check', authorize('admin'), checkVotingPatterns);

export default router;
