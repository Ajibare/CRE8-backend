"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const votingController_1 = require("./votingController");
const router = (0, express_1.Router)();
// Public routes
router.get('/bundles', votingController_1.getVotingBundles);
router.get('/contest/:contestId/leaderboard', votingController_1.getContestLeaderboard);
router.get('/contest/:contestId/statistics', votingController_1.getVotingStatistics);
router.get('/submission/:submissionId/votes', votingController_1.getSubmissionVotes);
router.get('/patterns/check', votingController_1.checkVotingPatterns);
// Protected routes (require authentication)
router.get('/history', auth_1.authenticate, votingController_1.getUserVotingHistory);
// Public voting route (allow guest voters)
router.post('/initiate', votingController_1.initiateVotingPayment);
// Payment callback (webhook)
router.get('/callback', votingController_1.handleVotingCallback);
// Admin only routes
router.get('/patterns/check', (0, auth_1.authorize)('admin'), votingController_1.checkVotingPatterns);
exports.default = router;
//# sourceMappingURL=votingRoutes.js.map