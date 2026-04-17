"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("./authController");
const auth_1 = require("../../middlewares/auth");
const validation_1 = require("../../middlewares/validation");
const security_1 = require("../../middlewares/security");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Root route
router.get('/', (req, res) => {
    res.json({ message: 'Auth API', endpoints: ['/register', '/login', '/forgot-password', '/reset-password', '/logout', '/refresh-token', '/profile', '/complete-registration'] });
});
// Validation for forgot password
const forgotPasswordValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
];
// Validation for reset password
const resetPasswordValidation = [
    (0, express_validator_1.body)('token')
        .notEmpty()
        .withMessage('Reset token is required'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];
// Apply security headers to all routes
router.use(security_1.securityHeaders);
// Public routes with rate limiting
router.post('/register', security_1.registrationLimiter, validation_1.registerValidation, validation_1.validateRequest, authController_1.register);
router.post('/login', security_1.loginLimiter, validation_1.loginValidation, validation_1.validateRequest, authController_1.login);
router.post('/forgot-password', security_1.passwordResetLimiter, forgotPasswordValidation, validation_1.validateRequest, authController_1.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validation_1.validateRequest, authController_1.resetPassword);
// Protected routes
router.post('/logout', auth_1.authenticate, authController_1.logout);
router.post('/refresh-token', auth_1.authenticate, authController_1.refreshToken);
router.get('/profile', auth_1.authenticate, authController_1.getProfile);
router.put('/profile', auth_1.authenticate, authController_1.updateProfile);
router.post('/complete-registration', auth_1.authenticate, authController_1.completeRegistration);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map