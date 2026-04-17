"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const userManagementController_1 = require("../modules/admin/userManagementController");
const adminController_1 = require("../modules/admin/adminController");
const router = express_1.default.Router();
// All routes require admin authentication
router.use(auth_1.authenticate);
router.use((0, auth_1.authorize)('admin'));
// Get user by ID
router.get('/users/:id', userManagementController_1.getUserById);
// Update audition status (pass/fail)
router.post('/users/audition-status', userManagementController_1.updateAuditionStatus);
// Update contest status (pass/fail)
router.post('/users/contest-status', userManagementController_1.updateContestStatus);
// Submission review (approve/reject)
router.patch('/submissions/:id/review', adminController_1.reviewSubmission);
exports.default = router;
//# sourceMappingURL=adminUserRoutes.js.map