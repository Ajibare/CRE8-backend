import mongoose from 'mongoose';
import User from '../models/User';
import dotenv from 'dotenv';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/funtech');
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@funtech.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists:');
      console.log('Email: admin@funtech.com');
      console.log('Password: admin123');
      console.log('Role:', existingAdmin.role);
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@funtech.com',
      password: 'admin123',
      role: 'admin',
      isVerified: true,
      isApproved: true,
      phone: '+1234567890',
      country: 'Nigeria',
      state: 'Lagos'
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('');
    console.log('Login Credentials:');
    console.log('-------------------');
    console.log('Email: admin@funtech.com');
    console.log('Password: admin123');
    console.log('Role: admin');
    console.log('');
    console.log('You can now login at: http://localhost:3000/login');
    console.log('Then navigate to: http://localhost:3000/admin/dashboard');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
