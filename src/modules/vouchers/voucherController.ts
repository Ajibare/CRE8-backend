import { Request, Response } from 'express';
import Voucher from '../../database/models/Voucher';
import User from '../../database/models/User';
import { voucherConfig } from '../../config/flutterwave';
import { generateCreativeId } from '../../utils/generateCreativeId';
import { sendEmail } from '../../utils/sendEmail';

// Validate voucher code
export const validateVoucher = async (req: Request, res: Response) => {
  try {
    const { code, type = 'REGISTRATION' } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Voucher code is required' });
    }

    // Validate voucher
    const validation = await Voucher.validateVoucher(code, type);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        message: validation.message,
        valid: false
      });
    }

    res.json({
      valid: true,
      discount: validation.discount,
      message: 'Voucher is valid'
    });

  } catch (error) {
    console.error('Voucher validation error:', error);
    res.status(500).json({ message: 'Failed to validate voucher' });
  }
};

// Create new voucher (admin only)
export const createVoucher = async (req: Request, res: Response) => {
  try {
    const { discount, type = 'REGISTRATION', expiryDays = voucherConfig.expiryDays } = req.body;

    if (!discount || discount <= 0) {
      return res.status(400).json({ message: 'Valid discount amount is required' });
    }

    // Generate unique 6-digit voucher code
    const code = Voucher.generateCode();
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    const voucher = new Voucher({
      code,
      discount,
      type,
      expiresAt,
      createdBy: (req as any).user._id // Assuming admin user
    });

    await voucher.save();

    res.status(201).json({
      message: 'Voucher created successfully',
      voucher: {
        code: voucher.code,
        discount: voucher.discount,
        type: voucher.type,
        expiresAt: voucher.expiresAt
      }
    });

  } catch (error) {
    console.error('Create voucher error:', error);
    res.status(500).json({ message: 'Failed to create voucher' });
  }
};

// Apply voucher during registration
export const applyVoucherToRegistration = async (req: Request, res: Response) => {
  try {
    const { voucherCode, userData } = req.body;

    if (!voucherCode || !userData) {
      return res.status(400).json({ 
        message: 'Voucher code and user data are required' 
      });
    }

    // Validate voucher
    const validation = await Voucher.validateVoucher(voucherCode, 'REGISTRATION');
    
    if (!validation.valid) {
      return res.status(400).json({ 
        message: validation.message,
        valid: false
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Calculate final amount
    const baseAmount = 2000;
    const discount = validation.discount || 0;
    const finalAmount = baseAmount - discount;

    res.json({
      valid: true,
      discount,
      baseAmount,
      finalAmount,
      message: 'Voucher applied successfully'
    });

  } catch (error) {
    console.error('Apply voucher error:', error);
    res.status(500).json({ message: 'Failed to apply voucher' });
  }
};

// Complete registration with voucher
export const completeRegistrationWithVoucher = async (req: Request, res: Response) => {
  try {
    const { voucherCode, userData, paymentReference } = req.body;

    if (!voucherCode || !userData || !paymentReference) {
      return res.status(400).json({ 
        message: 'Voucher code, user data, and payment reference are required' 
      });
    }

    // Validate voucher again
    const validation = await Voucher.validateVoucher(voucherCode, 'REGISTRATION');
    
    if (!validation.valid) {
      return res.status(400).json({ 
        message: validation.message 
      });
    }

    // Create user
    const user = new User({
      ...userData,
      voucherUsed: voucherCode,
      isVerified: true, // Verified after payment
      auditionStatus: 'pending'
    });

    // Generate Creative ID
    user.creativeId = await generateCreativeId();
    
    await user.save();

    // Mark voucher as used
    await validation.voucher!.markAsUsed(user._id);

    // Set audition date (3 days from now)
    const auditionDate = new Date();
    auditionDate.setDate(auditionDate.getDate() + 3);
    user.auditionDate = auditionDate;
    await user.save();

    // Send confirmation email with audition details
    const confirmationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin: 0;">FUNTECH Creative Challenge</h1>
        </div>
        
        <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
          <h2 style="color: #155724; margin-top: 0;">Registration Successful! </h2>
          <p style="color: #155724; line-height: 1.6;">Hi ${user.name},</p>
          <p style="color: #155724; line-height: 1.6;">Congratulations! Your registration for the FUNTECH Creative Challenge has been completed successfully.</p>
          
          <div style="background: #ffffff; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #155724; margin: 0; font-weight: bold;">Registration Details:</p>
            <p style="color: #155724; margin: 5px 0;">Creative ID: <strong>${user.creativeId}</strong></p>
            <p style="color: #155724; margin: 5px 0;">Category: ${user.category}</p>
            <p style="color: #155724; margin: 5px 0;">Voucher Used: ${voucherCode}</p>
            <p style="color: #155724; margin: 5px 0;">Amount Paid: #${2000 - (validation.discount || 0)}</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Audition Details</h3>
            <p style="color: #856404; margin: 5px 0;"><strong>Date:</strong> ${auditionDate.toLocaleDateString()}</p>
            <p style="color: #856404; margin: 5px 0;"><strong>Time:</strong> 10:00 AM</p>
            <p style="color: #856404; margin: 5px 0;"><strong>Venue:</strong> Virtual (Link will be sent 24 hours before)</p>
            <p style="color: #856404; margin: 5px 0;">Please prepare a 2-minute presentation of your best work.</p>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h3 style="color: #495057; margin-top: 0;">Next Steps:</h3>
          <ol style="color: #6c757d; line-height: 1.6;">
            <li>Follow all our social media handles (Instagram, Facebook, Twitter, YouTube, TikTok)</li>
            <li>Prepare your portfolio for the audition</li>
            <li>Check your email for audition link 24 hours before the date</li>
            <li>Join our WhatsApp community for updates</li>
          </ol>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #6c757d; margin: 0;">Welcome to FUNTECH Creative Challenge! We can't wait to see your creativity.</p>
        </div>
      </div>
    `;

    await sendEmail(
      user.email,
      'Registration Successful - FUNTECH Creative Challenge',
      confirmationEmailHtml
    );

    res.json({
      message: 'Registration completed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        creativeId: user.creativeId,
        category: user.category,
        auditionDate: user.auditionDate
      },
      auditionDate: user.auditionDate
    });

  } catch (error) {
    console.error('Complete registration with voucher error:', error);
    res.status(500).json({ message: 'Failed to complete registration' });
  }
};

// Get all vouchers (admin only)
export const getAllVouchers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let filter: any = {};
    if (status === 'active') {
      filter = { isActive: true, expiresAt: { $gt: new Date() }, usedBy: null };
    } else if (status === 'used') {
      filter = { usedBy: { $ne: null } };
    } else if (status === 'expired') {
      filter = { expiresAt: { $lt: new Date() } };
    }

    const vouchers = await Voucher.find(filter)
      .populate('usedBy', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Voucher.countDocuments(filter);

    res.json({
      vouchers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Get vouchers error:', error);
    res.status(500).json({ message: 'Failed to get vouchers' });
  }
};
