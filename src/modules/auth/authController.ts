import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../../database/models/User';
import Payment from '../../database/models/Payment';
import { generateCreativeId } from '../../utils/generateCreativeId';
import { generateReference } from '../../utils/generateReference';
import { sendEmail, emailTemplates } from '../../utils/sendEmail';
import { AuthRequest } from '../../middlewares/auth';
import { hashPassword, comparePassword, generateResetToken, generateResetTokenHash } from '../../utils/passwordUtils';
import { paymentTypes } from '../../config/paystack';

export const register = async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      email, 
      password,
      phone, 
      category,
      country,
      state,
      city,
      dateOfBirth,
      gender,
      bio,
      experience,
      education,
      skills,
      portfolio,
      socialLinks,
      voucherCode,
      referralCode,
      socialFollowStatus,
      socialVerified
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // If user exists but hasn't completed registration (no password), allow them to complete it
      // This handles users who paid first then came to register
      if (!existingUser.password) {
        // Complete user registration with all data
        existingUser.name = name;
        existingUser.password = await hashPassword(password);
        existingUser.phone = phone;
        existingUser.category = category;
        existingUser.country = country;
        existingUser.state = state;
        existingUser.city = city;
        existingUser.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : undefined;
        existingUser.gender = gender;
        existingUser.bio = bio;
        existingUser.experience = experience;
        existingUser.education = education;
        existingUser.skills = skills;
        existingUser.portfolio = portfolio;
        existingUser.socialLinks = socialLinks;
        existingUser.socialFollowStatus = socialFollowStatus;
        existingUser.voucherUsed = voucherCode;
        existingUser.referralCode = referralCode ? referralCode.toUpperCase() : undefined;
        // Generate creative ID for the new user
        const creativeId = await generateCreativeId();
        existingUser.creativeId = creativeId;
        await existingUser.save();

        // Send welcome email
        try {
          await sendEmail(
            existingUser.email,
            'Welcome to FUNTECH Creative Innovation!',
            emailTemplates.welcome(existingUser.name, creativeId)
          );
          console.log('Welcome email sent to:', existingUser.email);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }

        return res.status(200).json({
          message: 'Registration completed successfully! Your account is now active.',
          userId: existingUser._id,
          existingUser: true
        });
      }
      
      // User already exists and has completed registration - reject
      return res.status(400).json({
        message: 'An account with this email already exists. Please login instead.'
      });
    }

    // Validate social media verification (must be true)
    if (!socialVerified) {
      return res.status(400).json({ 
        message: 'You must follow all our social media platforms to continue' 
      });
    }

    // Validate social media follow status if provided (legacy check)
    if (socialFollowStatus) {
      const requiredPlatforms = ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'];
      const allFollowed = requiredPlatforms.every(platform => socialFollowStatus[platform]);
      if (!allFollowed) {
        return res.status(400).json({ 
          message: 'You must follow all our social media platforms to continue' 
        });
      }
    }

    // Calculate payment amount
    let amount: number = paymentTypes.REGISTRATION;
    let discount = 0;

    if (voucherCode) {
      // For now, we'll apply a standard discount if voucher code is provided
      // In production, this should validate the voucher against the database
      discount = 500; // #500 discount
      amount = paymentTypes.REGISTRATION - discount;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate creative ID for the new user
    const creativeId = await generateCreativeId();

    // Create new user (all duplicate emails are rejected above)
    const user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        creativeId,
        category,
        country,
        state,
        city,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        gender,
        bio,
        experience,
        education,
        skills,
        portfolio,
        socialLinks,
        socialFollowStatus,
        voucherUsed: voucherCode,
        referralCode: referralCode ? referralCode.toUpperCase() : undefined,
        role: 'creative',
      });
      await user.save();

      // Send welcome email to newly registered user
      try {
        await sendEmail(
          user.email,
          'Welcome to FUNTECH Creative Innovation!',
          emailTemplates.welcome(user.name, user.creativeId!)
        );
        console.log('Welcome email sent to:', user.email);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }

      // Generate payment reference
      const reference = generateReference();

      res.status(201).json({
        message: 'Registration initiated. Please complete payment to activate your account.',
        userId: user._id,
        paymentReference: reference,
        amount,
        discount,
        voucherApplied: !!voucherCode,
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      // Check if it's a validation error
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((err: any) => err.message);
        return res.status(400).json({ message: 'Validation Error', errors: messages });
      }
      // Check if it's a duplicate key error
      if (error.code === 11000) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  }
// };

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Find user with password included
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log('User found:', { email: user.email, hasPassword: !!user.password, isVerified: user.isVerified });

    // Check if user has password set (some users might have registered without password)
    if (!user.password) {
      console.log('User has no password set:', email);
      return res.status(401).json({ message: 'Please complete registration first. Your payment was received but you need to finish setting up your account.' });
    }

    // Validate password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      console.log('User not verified:', email);
      return res.status(401).json({ message: 'Please complete registration payment first' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        creativeId: user.creativeId,
        category: user.category,
        role: user.role,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { bio, socialLinks } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio, socialLinks },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email address is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Check if user already has a recent reset request (prevent spam)
    if (user.passwordResetExpires && user.passwordResetExpires > new Date()) {
      return res.status(429).json({ 
        message: 'A password reset link has already been sent. Please check your email or wait 10 minutes before trying again.' 
      });
    }

    // Generate secure reset token
    const resetToken = generateResetToken();
    const resetTokenHash = generateResetTokenHash(resetToken);
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save reset token to database
    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Create reset URL with security parameters
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    // Enhanced email template
    const resetEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin: 0;">FUNTECH Creative Challenge</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #666; line-height: 1.6;">Hi ${user.name},</p>
          <p style="color: #666; line-height: 1.6;">We received a request to reset the password for your FUNTECH Creative Challenge account associated with this email address.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #FF6B35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Reset My Password
            </a>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-top: 20px;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              <strong>Security Notice:</strong> This link will expire in <strong>10 minutes</strong> for your security.
            </p>
          </div>
        </div>
        
        <div style="background: #f1f3f4; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="color: #666; margin: 0 0 10px 0;">If you didn't request this password reset, please:</p>
          <ul style="color: #666; text-align: left; display: inline-block;">
            <li>Ignore this email</li>
            <li>Your account remains secure</li>
            <li>Contact support if you have concerns</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            This is an automated message from FUNTECH Creative Challenge. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    // Try to send email, but don't fail if email service has issues
    try {
      await sendEmail(
        user.email,
        'Password Reset Request - FUNTECH Creative Challenge',
        resetEmailHtml
      );
      console.log(`Password reset email sent to: ${email}`);
    } catch (emailError: any) {
      console.error('Failed to send password reset email:', emailError);
      // Log the reset link so developer can see it in development
      const resetLink = `${process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      console.log('========== PASSWORD RESET LINK (Development) ==========');
      console.log('Reset Link:', resetLink);
      console.log('For email:', email);
      console.log('=======================================================');
    }

    // Always return success for security (don't reveal if email exists)
    res.json({ 
      message: 'If an account with that email exists, a password reset link has been sent.',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    res.status(500).json({ 
      message: 'Failed to process password reset request',
      error: error?.message || 'Unknown error'
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, email, newPassword } = req.body;

    // Validate input
    if (!token || !email || !newPassword) {
      return res.status(400).json({ 
        message: 'Reset token, email, and new password are required' 
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Hash the token to compare with stored token
    const tokenHash = generateResetTokenHash(token);

    // Find user with valid reset token
    const user = await User.findOne({
      email,
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires +password');

    if (!user) {
      console.log(`Invalid reset token attempt for email: ${email}`);
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Check if new password is same as old password
    if (user.password) {
      const isSamePassword = await comparePassword(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({ 
          message: 'New password must be different from the current password' 
        });
      }
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.lastPasswordReset = new Date();
    await user.save();

    // Log the password reset for security
    console.log(`Password reset successful for user: ${user.email} at ${new Date().toISOString()}`);

    // Send confirmation email
    const confirmationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin: 0;">FUNTECH Creative Challenge</h1>
        </div>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #155724; margin-top: 0;">Password Reset Successful! </h2>
          <p style="color: #155724; line-height: 1.6;">Hi ${user.name},</p>
          <p style="color: #155724; line-height: 1.6;">Your password has been successfully reset for your FUNTECH Creative Challenge account.</p>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #155724; margin: 0; font-weight: bold;">Account Details:</p>
            <p style="color: #155724; margin: 5px 0;">Email: ${user.email}</p>
            <p style="color: #155724; margin: 5px 0;">Reset Time: ${new Date().toLocaleString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; font-size: 16px;">
              Sign In to Your Account
            </a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h3 style="color: #495057; margin-top: 0;">Security Tips:</h3>
          <ul style="color: #6c757d; line-height: 1.6;">
            <li>Keep your password secure and don't share it with anyone</li>
            <li>Use a unique password for this account</li>
            <li>Enable two-factor authentication if available</li>
            <li>Log out from shared devices after use</li>
          </ul>
        </div>
        
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Important:</strong> If you didn't make this change, please contact our support team immediately at support@funtechcreative.com
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="color: #999; margin: 0; font-size: 12px;">
            This is an automated message from FUNTECH Creative Challenge. Please do not reply to this email.
          </p>
        </div>
      </div>
    `;

    await sendEmail(
      user.email,
      'Password Reset Successful - FUNTECH Creative Challenge',
      confirmationEmailHtml
    );

    res.json({ 
      message: 'Password reset successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // In a stateless JWT system, logout is typically handled on the client side
    // by removing the token from storage. However, we can implement token blacklisting
    // or track active sessions if needed for future enhancements.
    
    // For now, we'll just return success and let the client handle token removal
    res.json({ 
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Failed to logout' });
  }
};

export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new JWT token
    const newToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        creativeId: user.creativeId,
        category: user.category,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: 'Failed to refresh token' });
  }
};

export const completeRegistration = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate Creative ID if not already generated
    if (!user.creativeId) {
      user.creativeId = await generateCreativeId();
    }

    user.isVerified = true;
    await user.save();

    // Send welcome email
    await sendEmail(
      user.email,
      'Welcome to FUNTECH Creative Challenge!',
      emailTemplates.welcome(user.name, user.creativeId!)
    );

    res.json({
      message: 'Registration completed successfully',
      creativeId: user.creativeId,
    });
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({ message: 'Failed to complete registration' });
  }
};
