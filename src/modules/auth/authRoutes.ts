import { Router } from 'express';
import { register, login, getProfile, updateProfile, completeRegistration, forgotPassword, resetPassword, logout, refreshToken } from './authController';
import { authenticate } from '../../middlewares/auth';
import { registerValidation, loginValidation, validateRequest } from '../../middlewares/validation';
import { passwordResetLimiter, loginLimiter, registrationLimiter, securityHeaders } from '../../middlewares/security';
import { body } from 'express-validator';

const router = Router();

// Root route
router.get('/', (req, res) => {
  res.json({ message: 'Auth API', endpoints: ['/register', '/login', '/forgot-password', '/reset-password', '/logout', '/refresh-token', '/profile', '/complete-registration'] });
});

// Validation for forgot password
const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
];

// Validation for reset password
const resetPasswordValidation = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

// Apply security headers to all routes
router.use(securityHeaders);

// Public routes with rate limiting
router.post('/register', registrationLimiter, registerValidation, validateRequest, register);
router.post('/login', loginLimiter, loginValidation, validateRequest, login);
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

// Protected routes
router.post('/logout', authenticate, logout);
router.post('/refresh-token', authenticate, refreshToken);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.post('/complete-registration', authenticate, completeRegistration);

export default router;
