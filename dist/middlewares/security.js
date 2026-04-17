"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInput = exports.validatePasswordStrength = exports.validateEmail = exports.requestLogger = exports.securityHeaders = exports.registrationLimiter = exports.loginLimiter = exports.passwordResetLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Rate limiting for password reset endpoints
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 password reset requests per windowMs
    message: {
        error: 'Too many password reset attempts. Please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Rate limiting for login attempts
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: {
        error: 'Too many login attempts. Please try again after 15 minutes.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate limiting for registration - DISABLED for production scale
// For millions of users, we don't want to limit legitimate registrations
const registrationLimiter = (req, res, next) => {
    // Skip rate limiting - allow unlimited registrations
    next();
};
exports.registrationLimiter = registrationLimiter;
// Security headers middleware
const securityHeaders = (req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    // Force HTTPS (in production)
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    // Content Security Policy
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
};
exports.securityHeaders = securityHeaders;
// Request logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${ip} - User-Agent: ${userAgent}`);
    next();
};
exports.requestLogger = requestLogger;
// Validate email format
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
// Validate password strength
const validatePasswordStrength = (password) => {
    if (password.length < 6) {
        return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    if (password.length > 128) {
        return { isValid: false, message: 'Password must be less than 128 characters long' };
    }
    // Check for common weak passwords
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123', 'password123'];
    if (commonPasswords.includes(password.toLowerCase())) {
        return { isValid: false, message: 'Password is too common. Please choose a stronger password' };
    }
    return { isValid: true };
};
exports.validatePasswordStrength = validatePasswordStrength;
// Sanitize input to prevent XSS
const sanitizeInput = (input) => {
    return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};
exports.sanitizeInput = sanitizeInput;
//# sourceMappingURL=security.js.map