import { Response } from 'express';
import User from '../../database/models/User';
import { hashPassword } from '../../utils/passwordUtils';
import { AuthRequest } from '../../middlewares/auth';

/**
 * Register a new admin user
 * Only existing admins can register new admins
 * No payment required, just email and password
 */
export const registerAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const admin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      creativeId: `ADM${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
      isVerified: true,
      isApproved: true,
      phone: 'N/A'
    });

    await admin.save();

    res.status(201).json({
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        creativeId: admin.creativeId
      }
    });

  } catch (error: any) {
    console.error('Admin registration error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: 'Validation Error', errors: messages });
    }
    
    res.status(500).json({
      message: 'Admin registration failed',
      error: error.message
    });
  }
};

/**
 * Get all admin users
 */
export const getAllAdmins = async (req: AuthRequest, res: Response) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      message: 'Admins retrieved successfully',
      admins
    });
  } catch (error: any) {
    console.error('Get admins error:', error);
    res.status(500).json({
      message: 'Failed to retrieve admins',
      error: error.message
    });
  }
};

/**
 * Delete an admin user
 */
export const deleteAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { adminId } = req.params;

    // Prevent deleting yourself
    if (adminId === req.user._id.toString()) {
      return res.status(400).json({
        message: 'Cannot delete your own account'
      });
    }

    const admin = await User.findOneAndDelete({
      _id: adminId,
      role: 'admin'
    });

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found'
      });
    }

    res.json({
      message: 'Admin deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete admin error:', error);
    res.status(500).json({
      message: 'Failed to delete admin',
      error: error.message
    });
  }
};
