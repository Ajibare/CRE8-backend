"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const contestController_1 = require("./contestController");
const router = (0, express_1.Router)();
// Public routes
router.get('/', contestController_1.getAllContests);
router.get('/active', contestController_1.getActiveContest);
router.get('/:id', contestController_1.getContestById);
router.get('/:id/statistics', contestController_1.getContestStatistics);
// Admin only routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), contestController_1.createContest);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), contestController_1.updateContest);
router.patch('/:id/status', auth_1.authenticate, (0, auth_1.authorize)('admin'), contestController_1.changeContestStatus);
router.post('/:id/tasks', auth_1.authenticate, (0, auth_1.authorize)('admin'), contestController_1.addWeeklyTask);
router.patch('/:id/tasks/:week/activate', auth_1.authenticate, (0, auth_1.authorize)('admin'), contestController_1.activateWeeklyTask);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), contestController_1.deleteContest);
exports.default = router;
//# sourceMappingURL=contestRoutes.js.map