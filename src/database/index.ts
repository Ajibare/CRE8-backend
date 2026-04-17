import mongoose from 'mongoose';
import { default as User } from './models/User';
import { default as Contest } from './models/Contest';
import { default as Submission } from './models/Submission';
import { default as Vote } from './models/Vote';
import { default as Payment } from './models/Payment';
import { default as Voucher } from './models/Voucher';

// Cached connection for serverless (Vercel)
declare global {
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

const connectDB = async (): Promise<typeof mongoose> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/funtech-creative';

  if (cached!.conn) {
    console.log('Using cached MongoDB connection');
    return cached!.conn;
  }

  if (!cached!.promise) {
    cached!.promise = mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    }).then((mongoose) => {
      console.log('MongoDB Connected:', mongoose.connection.host);
      return mongoose;
    }).catch((error) => {
      console.error('Error connecting to MongoDB:', error);
      cached!.promise = null; // Reset so next attempt can retry
      throw error;
    });
  }

  cached!.conn = await cached!.promise;
  return cached!.conn;
};

export { connectDB, User, Contest, Submission, Vote, Payment };
