import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB } from './database';

// Import routes
import authRoutes from './modules/auth/authRoutes';
import paymentRoutes from './modules/payments/paymentRoutes';
import voucherRoutes from './modules/vouchers/voucherRoutes';
import paymentInitiationRoutes from './modules/payments/paymentInitiationRoutes';
import contestRoutes from './modules/contest/contestRoutes';
import submissionRoutes from './modules/submissions/submissionRoutes';
import votingRoutes from './modules/voting/votingRoutes';
import adminRoutes from './modules/admin/adminRoutes';
import profileRoutes from './modules/profile/profileRoutes';
import referralRoutes from './modules/referrals/referralRoutes';
import contestantRoutes from './modules/contestants/contestantRoutes';
import contestAdminRoutes from './routes/contestAdminRoutes';
import adminAuthRoutes from './routes/adminAuthRoutes';
import adminUserRoutes from './routes/adminUserRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',
  ],
  credentials: true,
}));

// API routes prefix - use /api for local dev, no prefix for Vercel
const apiPrefix = process.env.VERCEL ? '' : '/api';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(`${apiPrefix}/`, limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/debug', (req, res) => {
  res.status(200).json({
    path: req.path,
    url: req.url,
    apiPrefix,
    vercelEnv: process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/contests`, contestRoutes);
app.use(`${apiPrefix}/submissions`, submissionRoutes);
app.use(`${apiPrefix}/voting`, votingRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/profile`, profileRoutes);
app.use(`${apiPrefix}/referrals`, referralRoutes);
app.use(`${apiPrefix}/payments`, paymentRoutes);
app.use(`${apiPrefix}/payments`, paymentInitiationRoutes);
app.use(`${apiPrefix}/contestants`, contestantRoutes);
app.use(`${apiPrefix}/contest-admin`, contestAdminRoutes);
app.use(`${apiPrefix}/admin-auth`, adminAuthRoutes);
app.use(`${apiPrefix}/admin`, adminUserRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to database
const connectDatabase = async () => {
  try {
    await connectDB();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
};

// Start server (for local development)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const startServer = async () => {
    try {
      await connectDatabase();
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };
  startServer();
} else {
  // For Vercel: connect to DB and export app
  connectDatabase().catch(console.error);
}

// Export for Vercel serverless
export default app;
