"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./database");
// Import routes
const authRoutes_1 = __importDefault(require("./modules/auth/authRoutes"));
const paymentRoutes_1 = __importDefault(require("./modules/payments/paymentRoutes"));
const paymentInitiationRoutes_1 = __importDefault(require("./modules/payments/paymentInitiationRoutes"));
const contestRoutes_1 = __importDefault(require("./modules/contest/contestRoutes"));
const submissionRoutes_1 = __importDefault(require("./modules/submissions/submissionRoutes"));
const votingRoutes_1 = __importDefault(require("./modules/voting/votingRoutes"));
const adminRoutes_1 = __importDefault(require("./modules/admin/adminRoutes"));
const profileRoutes_1 = __importDefault(require("./modules/profile/profileRoutes"));
const referralRoutes_1 = __importDefault(require("./modules/referrals/referralRoutes"));
const contestantRoutes_1 = __importDefault(require("./modules/contestants/contestantRoutes"));
const contestAdminRoutes_1 = __importDefault(require("./routes/contestAdminRoutes"));
const adminAuthRoutes_1 = __importDefault(require("./routes/adminAuthRoutes"));
const adminUserRoutes_1 = __importDefault(require("./routes/adminUserRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3001',
    ],
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
// General middleware
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/contests', contestRoutes_1.default);
app.use('/api/submissions', submissionRoutes_1.default);
app.use('/api/voting', votingRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/profile', profileRoutes_1.default);
app.use('/api/referrals', referralRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/payments', paymentInitiationRoutes_1.default);
app.use('/api/contestants', contestantRoutes_1.default);
app.use('/api/contest-admin', contestAdminRoutes_1.default);
app.use('/api/admin-auth', adminAuthRoutes_1.default);
app.use('/api/admin', adminUserRoutes_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});
// Start server
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map