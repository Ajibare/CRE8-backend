"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAdmin = exports.getAllAdmins = exports.registerAdmin = void 0;
const User_1 = __importDefault(require("../../database/models/User"));
const passwordUtils_1 = require("../../utils/passwordUtils");
/**
 * Register a new admin user
 * Only existing admins can register new admins
 * No payment required, just email and password
 */
const registerAdmin = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Name, email, and password are required'
            });
        }
        // Check if user already exists
        const existingUser = await User_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: 'User already exists with this email'
            });
        }
        // Hash password
        const hashedPassword = await (0, passwordUtils_1.hashPassword)(password);
        // Create admin user
        const admin = new User_1.default({
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
    }
    catch (error) {
        console.error('Admin registration error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({ message: 'Validation Error', errors: messages });
        }
        res.status(500).json({
            message: 'Admin registration failed',
            error: error.message
        });
    }
};
exports.registerAdmin = registerAdmin;
/**
 * Get all admin users
 */
const getAllAdmins = async (req, res) => {
    try {
        const admins = await User_1.default.find({ role: 'admin' })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json({
            message: 'Admins retrieved successfully',
            admins
        });
    }
    catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({
            message: 'Failed to retrieve admins',
            error: error.message
        });
    }
};
exports.getAllAdmins = getAllAdmins;
/**
 * Delete an admin user
 */
const deleteAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;
        // Prevent deleting yourself
        if (adminId === req.user._id.toString()) {
            return res.status(400).json({
                message: 'Cannot delete your own account'
            });
        }
        const admin = await User_1.default.findOneAndDelete({
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
    }
    catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({
            message: 'Failed to delete admin',
            error: error.message
        });
    }
};
exports.deleteAdmin = deleteAdmin;
//# sourceMappingURL=adminAuthController.js.map