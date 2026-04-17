import mongoose from 'mongoose';
import { default as User } from './models/User';
import { default as Contest } from './models/Contest';
import { default as Submission } from './models/Submission';
import { default as Vote } from './models/Vote';
import { default as Payment } from './models/Payment';
import { default as Voucher } from './models/Voucher';

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/funtech-creative';
    
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection errors
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    console.error('Make sure MongoDB is running. Install from: https://www.mongodb.com/try/download/community');
    console.error('Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
    // Don't exit - let the server start without DB for now
    // process.exit(1);
  }
};

export { connectDB, User, Contest, Submission, Vote, Payment };
