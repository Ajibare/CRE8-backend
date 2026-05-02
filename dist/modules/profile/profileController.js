"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBusinessVideo = exports.deleteAccount = exports.getPublicProfile = exports.changePassword = exports.updateProfileImage = exports.updateProfile = exports.getProfile = void 0;
const User_1 = __importDefault(require("../../database/models/User"));
const cloudinaryUtils_1 = require("../../utils/cloudinaryUtils");
const cloudinary_1 = require("cloudinary");
// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                creativeId: user.creativeId,
                category: user.category,
                profileImage: user.profileImage,
                bio: user.bio,
                country: user.country,
                state: user.state,
                city: user.city,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                experience: user.experience,
                education: user.education,
                skills: user.skills,
                portfolio: user.portfolio,
                socialLinks: user.socialLinks,
                isVerified: user.isVerified,
                isApproved: user.isApproved,
                auditionStatus: user.auditionStatus,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};
exports.getProfile = getProfile;
// Update user profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone, bio, country, state, city, dateOfBirth, gender, experience, education, skills, portfolio, socialLinks } = req.body;
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Update fields
        if (name)
            user.name = name;
        if (phone)
            user.phone = phone;
        if (bio !== undefined)
            user.bio = bio;
        if (country)
            user.country = country;
        if (state)
            user.state = state;
        if (city)
            user.city = city;
        if (dateOfBirth)
            user.dateOfBirth = new Date(dateOfBirth);
        if (gender)
            user.gender = gender;
        if (experience)
            user.experience = experience;
        if (education)
            user.education = education;
        if (skills)
            user.skills = skills;
        if (portfolio)
            user.portfolio = portfolio;
        if (socialLinks)
            user.socialLinks = { ...user.socialLinks, ...socialLinks };
        await user.save();
        res.json({
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                creativeId: user.creativeId,
                category: user.category,
                profileImage: user.profileImage,
                bio: user.bio,
                country: user.country,
                state: user.state,
                city: user.city,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                experience: user.experience,
                education: user.education,
                skills: user.skills,
                portfolio: user.portfolio,
                socialLinks: user.socialLinks,
                isVerified: user.isVerified,
                isApproved: user.isApproved,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            message: 'Failed to update profile',
            error: error.message
        });
    }
};
exports.updateProfile = updateProfile;
// Update profile image
const updateProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }
        const user = await User_1.default.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Delete old profile image if exists
        if (user.profileImage) {
            try {
                // Extract public_id from Cloudinary URL
                const urlParts = user.profileImage.split('/');
                const filename = urlParts[urlParts.length - 1];
                const publicId = `funtech/profiles/${filename.split('.')[0]}`;
                await (0, cloudinaryUtils_1.deleteFromCloudinary)(publicId);
            }
            catch (error) {
                console.log('Error deleting old profile image:', error);
            }
        }
        // Upload new image
        const result = await (0, cloudinaryUtils_1.uploadToCloudinary)(req.file.buffer, {
            folder: 'funtech/profiles',
            resource_type: 'image'
        });
        user.profileImage = result.secure_url;
        await user.save();
        res.json({
            message: 'Profile image updated successfully',
            profileImage: user.profileImage
        });
    }
    catch (error) {
        console.error('Update profile image error:', error);
        res.status(500).json({
            message: 'Failed to update profile image',
            error: error.message
        });
    }
};
exports.updateProfileImage = updateProfileImage;
// Change password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }
        const user = await User_1.default.findById(req.user._id).select('+password');
        if (!user || !user.password) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify current password
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            message: 'Failed to change password',
            error: error.message
        });
    }
};
exports.changePassword = changePassword;
// Get public profile (for other users to view)
const getPublicProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User_1.default.findById(userId).select('name creativeId category profileImage bio country state city experience education skills portfolio socialLinks isVerified isApproved createdAt');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Only show approved and verified users
        if (!user.isVerified || !user.isApproved) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get public profile error:', error);
        res.status(500).json({
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};
exports.getPublicProfile = getPublicProfile;
// Delete account
const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ message: 'Password is required to delete account' });
        }
        const user = await User_1.default.findById(req.user._id).select('+password');
        if (!user || !user.password) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Verify password
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password is incorrect' });
        }
        // Delete profile image from Cloudinary
        if (user.profileImage) {
            try {
                const urlParts = user.profileImage.split('/');
                const filename = urlParts[urlParts.length - 1];
                const publicId = `funtech/profiles/${filename.split('.')[0]}`;
                await (0, cloudinaryUtils_1.deleteFromCloudinary)(publicId);
            }
            catch (error) {
                console.log('Error deleting profile image:', error);
            }
        }
        // Delete user
        await User_1.default.findByIdAndDelete(req.user._id);
        res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            message: 'Failed to delete account',
            error: error.message
        });
    }
};
exports.deleteAccount = deleteAccount;
// Upload business video for Business Support Program users
const uploadBusinessVideo = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No video file provided' });
        }
        // Check if user is a business support user
        if (req.user.category !== 'Business Support Program') {
            return res.status(403).json({ message: 'Only Business Support Program users can upload business videos' });
        }
        // Upload video to Cloudinary
        const result = await cloudinary_1.v2.uploader.upload_stream({
            resource_type: 'video',
            folder: 'business-videos',
            allowed_formats: ['mp4', 'mov', 'avi', 'webm'],
            transformation: [
                { width: 1280, height: 720, crop: 'limit' },
                { quality: 'auto' }
            ]
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return res.status(500).json({ message: 'Failed to upload video' });
            }
            if (result) {
                // Update user with video URL
                User_1.default.findByIdAndUpdate(req.user._id, { businessMedia: result.secure_url }, { new: true }).then(() => {
                    res.json({
                        message: 'Business video uploaded successfully',
                        businessMedia: result.secure_url,
                        thumbnail: result.thumbnail_url
                    });
                }).catch((updateError) => {
                    console.error('User update error:', updateError);
                    res.status(500).json({ message: 'Failed to save video URL' });
                });
            }
        });
        // Stream the buffer to Cloudinary
        const stream = require('stream');
        const bufferStream = new stream.PassThrough();
        bufferStream.end(req.file.buffer);
        bufferStream.pipe(result);
    }
    catch (error) {
        console.error('Business video upload error:', error);
        res.status(500).json({
            message: 'Failed to upload business video',
            error: error.message
        });
    }
};
exports.uploadBusinessVideo = uploadBusinessVideo;
//# sourceMappingURL=profileController.js.map