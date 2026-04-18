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

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://www.funtechinnovations.com',
    'http://localhost:3001',
  ],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ensure DB connection before any request (critical for Vercel serverless)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('DB connection failed:', error);
    _res.status(503).json({ message: 'Database connection failed' });
  }
});

// Root route - handles both / and /api/
app.get('/', (req, res) => {
  res.status(200).json({ message: 'CRE8 Backend API', status: 'running', docs: '/api/' });
});
app.get('/api/', (req, res) => {
  res.status(200).json({ message: 'CRE8 Backend API', status: 'running', endpoints: ['/auth', '/contests', '/submissions', '/voting', '/admin', '/profile', '/referrals', '/payments', '/contestants', '/contest-admin', '/admin-auth'] });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    path: req.path,
    url: req.url,
    vercelEnv: process.env.VERCEL,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/voting', votingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payments', paymentInitiationRoutes);
app.use('/api/contestants', contestantRoutes);
app.use('/api/contest-admin', contestAdminRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/admin', adminUserRoutes);

// 404 handler
app.use((req, res) => {
  console.log('404 hit for:', req.method, req.path, 'Original URL:', req.originalUrl);
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to database on startup (for local dev)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  connectDB().then(() => {
    console.log('Database connected successfully');
  }).catch((err) => {
    console.error('Database connection failed:', err);
  });
}

// Export app for Vercel
export default app;
