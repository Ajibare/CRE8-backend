"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("../database/models/User"));
const authRoutes_1 = __importDefault(require("../modules/auth/authRoutes"));
const database_1 = require("../database");
// Test setup
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/auth', authRoutes_1.default);
describe('Authentication Endpoints', () => {
    beforeAll(async () => {
        // Connect to test database
        await (0, database_1.connectDB)();
    });
    beforeEach(async () => {
        // Clean up database before each test
        await User_1.default.deleteMany({});
    });
    afterAll(async () => {
        // Close database connection
        await mongoose_1.default.connection.close();
    });
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                phone: '+2348000000000',
                category: 'Design'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            expect(response.body.message).toBe('Registration initiated. Please complete payment to activate your account.');
            expect(response.body.userId).toBeDefined();
            expect(response.body.paymentReference).toBeDefined();
        });
        it('should return error for duplicate email', async () => {
            const userData = {
                name: 'Test User',
                email: 'test@example.com',
                phone: '+2348000000000',
                category: 'Design'
            };
            // Create first user
            await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
            // Try to create duplicate
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            expect(response.body.message).toBe('User already exists with this email');
        });
        it('should validate required fields', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({})
                .expect(400);
            expect(response.body.errors).toBeDefined();
        });
    });
    describe('POST /api/auth/forgot-password', () => {
        beforeEach(async () => {
            // Create a test user
            const user = new User_1.default({
                name: 'Test User',
                email: 'test@example.com',
                phone: '+2348000000000',
                category: 'Design',
                password: await require('bcryptjs').hash('password123', 12)
            });
            await user.save();
        });
        it('should send password reset email for existing user', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test@example.com' })
                .expect(200);
            expect(response.body.message).toContain('password reset link has been sent');
        });
        it('should return same message for non-existing user (security)', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' })
                .expect(200);
            expect(response.body.message).toContain('password reset link has been sent');
        });
        it('should validate email format', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'invalid-email' })
                .expect(400);
            expect(response.body.errors).toBeDefined();
        });
    });
    describe('POST /api/auth/reset-password', () => {
        let resetToken;
        let userEmail;
        beforeEach(async () => {
            // Create a test user with reset token
            const user = new User_1.default({
                name: 'Test User',
                email: 'test@example.com',
                phone: '+2348000000000',
                category: 'Design',
                password: await require('bcryptjs').hash('oldpassword123', 12)
            });
            // Generate reset token
            const crypto = require('crypto');
            resetToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
            user.passwordResetToken = tokenHash;
            user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
            userEmail = user.email;
            await user.save();
        });
        it('should reset password successfully', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/reset-password')
                .send({
                token: resetToken,
                email: userEmail,
                newPassword: 'newpassword123'
            })
                .expect(200);
            expect(response.body.message).toBe('Password reset successful');
        });
        it('should reject invalid token', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/reset-password')
                .send({
                token: 'invalid-token',
                email: userEmail,
                newPassword: 'newpassword123'
            })
                .expect(400);
            expect(response.body.message).toBe('Invalid or expired reset token');
        });
        it('should validate password strength', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/reset-password')
                .send({
                token: resetToken,
                email: userEmail,
                newPassword: '123' // Too short
            })
                .expect(400);
            expect(response.body.message).toBe('Password must be at least 6 characters long');
        });
    });
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            const user = new User_1.default({
                name: 'Test User',
                email: 'test@example.com',
                phone: '+2348000000000',
                category: 'Design',
                password: await require('bcryptjs').hash('password123', 12),
                isVerified: true
            });
            await user.save();
        });
        it('should login successfully with correct credentials', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123'
            })
                .expect(200);
            expect(response.body.message).toBe('Login successful');
            expect(response.body.token).toBeDefined();
            expect(response.body.user.email).toBe('test@example.com');
        });
        it('should reject invalid credentials', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'wrongpassword'
            })
                .expect(401);
            expect(response.body.message).toBe('Invalid credentials');
        });
        it('should reject login for unverified user', async () => {
            // Create unverified user
            const user = new User_1.default({
                name: 'Unverified User',
                email: 'unverified@example.com',
                phone: '+2348000000001',
                category: 'Design',
                password: await require('bcryptjs').hash('password123', 12),
                isVerified: false
            });
            await user.save();
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'unverified@example.com',
                password: 'password123'
            })
                .expect(401);
            expect(response.body.message).toBe('Please complete registration payment first');
        });
    });
    describe('POST /api/auth/logout', () => {
        let authToken;
        beforeEach(async () => {
            // Create and login a user to get token
            const user = new User_1.default({
                name: 'Test User',
                email: 'test@example.com',
                phone: '+2348000000000',
                category: 'Design',
                password: await require('bcryptjs').hash('password123', 12),
                isVerified: true
            });
            await user.save();
            const loginResponse = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send({
                email: 'test@example.com',
                password: 'password123'
            });
            authToken = loginResponse.body.token;
        });
        it('should logout successfully', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body.message).toBe('Logout successful');
            expect(response.body.timestamp).toBeDefined();
        });
        it('should require authentication', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/logout')
                .expect(401);
            expect(response.body.message).toBe('Access denied. No token provided.');
        });
    });
    describe('Rate Limiting', () => {
        it('should limit password reset requests', async () => {
            // Create a test user
            const user = new User_1.default({
                name: 'Test User',
                email: 'test@example.com',
                phone: '+2348000000000',
                category: 'Design'
            });
            await user.save();
            // Make multiple requests to trigger rate limiting
            for (let i = 0; i < 3; i++) {
                await (0, supertest_1.default)(app)
                    .post('/api/auth/forgot-password')
                    .send({ email: 'test@example.com' });
            }
            // Fourth request should be rate limited
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test@example.com' })
                .expect(429);
            expect(response.body.error).toContain('Too many password reset attempts');
        });
    });
});
//# sourceMappingURL=auth.test.js.map