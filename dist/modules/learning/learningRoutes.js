"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const learningController_1 = require("./learningController");
const router = (0, express_1.Router)();
// Public routes (authentication required)
router.get('/', auth_1.authenticate, learningController_1.getAllLearnings);
router.get('/categories', auth_1.authenticate, learningController_1.getCategories);
router.get('/:id', auth_1.authenticate, learningController_1.getLearningById);
exports.default = router;
//# sourceMappingURL=learningRoutes.js.map