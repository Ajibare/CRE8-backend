"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const adminController_1 = require("./adminController");
const router = (0, express_1.Router)();
// Dashboard
router.get('/dashboard', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminController_1.getDashboardStats);
// User Management
router.get('/users', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminController_1.getUsers);
router.patch('/users/:id/status', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminController_1.updateUserStatus);
// Contest Management
router.get('/contests', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminController_1.getContests);
// Submission Management
router.get('/submissions', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminController_1.getSubmissions);
router.patch('/submissions/:id/review', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminController_1.reviewSubmission);
// Analytics
router.get('/analytics/voting', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminController_1.getVotingAnalytics);
router.get('/analytics/financial', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminController_1.getFinancialReports);
// Data Export
router.get('/export/:type', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminController_1.exportData);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map