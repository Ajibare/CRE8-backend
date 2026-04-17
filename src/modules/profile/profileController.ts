import { Request, Response } from 'express';
import User from '../../database/models/User';
import { AuthRequest } from '../../middlewares/auth';
import { deleteFromCloudinary, uploadToCloudinary } from '../../utils/cloudinaryUtils';

// Get user profile
export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
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
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch profile',
      error: error.message 
    });
  }
};

// Update user profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      phone,
      bio,
      country,
      state,
      city,
      dateOfBirth,
      gender,
      experience,
      education,
      skills,
      portfolio,
      socialLinks
    } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (country) user.country = country;
    if (state) user.state = state;
    if (city) user.city = city;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth);
    if (gender) user.gender = gender;
    if (experience) user.experience = experience;
    if (education) user.education = education;
    if (skills) user.skills = skills;
    if (portfolio) user.portfolio = portfolio;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

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
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile',
      error: error.message 
    });
  }
};

// Update profile image
export const updateProfileImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const user = await User.findById(req.user._id);
    
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
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.log('Error deleting old profile image:', error);
      }
    }

    // Upload new image
    const result = await uploadToCloudinary(req.file.buffer, {
      folder: 'funtech/profiles',
      resource_type: 'image'
    });

    user.profileImage = result.secure_url;
    await user.save();

    res.json({
      message: 'Profile image updated successfully',
      profileImage: user.profileImage
    });
  } catch (error: any) {
    console.error('Update profile image error:', error);
    res.status(500).json({ 
      message: 'Failed to update profile image',
      error: error.message 
    });
  }
};

// Change password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const bcrypt = await import('bcryptjs');
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      message: 'Failed to change password',
      error: error.message 
    });
  }
};

// Get public profile (for other users to view)
export const getPublicProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select(
      'name creativeId category profileImage bio country state city experience education skills portfolio socialLinks isVerified isApproved createdAt'
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only show approved and verified users
    if (!user.isVerified || !user.isApproved) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error: any) {
    console.error('Get public profile error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch profile',
      error: error.message 
    });
  }
};

// Delete account
export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'Password is required to delete account' });
    }

    const user = await User.findById(req.user._id).select('+password');
    
    if (!user || !user.password) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password
    const bcrypt = await import('bcryptjs');
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
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.log('Error deleting profile image:', error);
      }
    }

    // Delete user
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Delete account error:', error);
    res.status(500).json({ 
      message: 'Failed to delete account',
      error: error.message 
    });
  }
};
