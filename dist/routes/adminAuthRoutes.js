"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const adminAuthController_1 = require("../modules/auth/adminAuthController");
const router = (0, express_1.Router)();
// Register new admin (requires authentication as admin OR admin key)
router.post('/register', adminAuthController_1.registerAdmin);
// Get all admins (requires admin authentication)
router.get('/all', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminAuthController_1.getAllAdmins);
// Delete an admin (requires admin authentication)
router.delete('/:adminId', auth_1.authenticate, (0, auth_1.authorize)('admin'), adminAuthController_1.deleteAdmin);
exports.default = router;
//# sourceMappingURL=adminAuthRoutes.js.map