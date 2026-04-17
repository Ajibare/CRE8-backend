import { Request, Response } from 'express';
import User from '../../database/models/User';

// 20 Referral Codes (must match the list in paymentInitiationController.ts)
const REFERRAL_CODES = [
  'CRF045', 'CRF067', 'CRF089', 'CRF123', 'CRF156',
  'CRF178', 'CRF234', 'CRF267', 'CRF289', 'CRF345',
  'CRF378', 'CRF456', 'CRF489', 'CRF567', 'CRF589',
  'CRF678', 'CRF789', 'CRF890', 'CRF901', 'CRF999'
];

// Get referral statistics
export const getReferralStatistics = async (req: Request, res: Response) => {
  try {
    // Aggregate users by referralCode
    const stats = await User.aggregate([
      { $match: { referralCode: { $exists: true, $ne: null } } },
      { $group: {
        _id: '$referralCode',
        count: { $sum: 1 },
        users: { $push: { name: '$name', email: '$email', registeredAt: '$createdAt' } }
      }},
      { $sort: { count: -1 } }
    ]);

    // Create a map of all codes with their stats
    const allCodes = REFERRAL_CODES.map(code => {
      const codeStats = stats.find(s => s._id === code);
      return {
        code,
        count: codeStats ? codeStats.count : 0,
        users: codeStats ? codeStats.users : []
      };
    });

    // Calculate totals
    const totalReferredUsers = stats.reduce((sum, s) => sum + s.count, 0);
    const totalRegisteredUsers = await User.countDocuments();
    const organicUsers = totalRegisteredUsers - totalReferredUsers;

    res.json({
      success: true,
      data: {
        totalRegisteredUsers,
        totalReferredUsers,
        organicUsers,
        referralBreakdown: allCodes,
        summary: {
          codesWithUsers: stats.length,
          codesWithoutUsers: REFERRAL_CODES.length - stats.length,
          topPerformingCode: allCodes.sort((a, b) => b.count - a.count)[0]
        }
      }
    });
  } catch (error: any) {
    console.error('Get referral statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get referral statistics',
      error: error.message
    });
  }
};

// Export referral data to CSV format
export const exportReferralData = async (req: Request, res: Response) => {
  try {
    // Get all users with referral codes
    const referredUsers = await User.find(
      { referralCode: { $exists: true, $ne: null } },
      { name: 1, email: 1, referralCode: 1, createdAt: 1, _id: 0 }
    ).sort({ referralCode: 1, createdAt: -1 });

    // Get all users without referral codes (organic)
    const organicUsers = await User.find(
      { $or: [{ referralCode: { $exists: false } }, { referralCode: null }] },
      { name: 1, email: 1, createdAt: 1, _id: 0 }
    ).sort({ createdAt: -1 });

    // Create CSV header
    let csv = 'Type,Referral Code,Name,Email,Registration Date\n';

    // Add referred users
    referredUsers.forEach(user => {
      csv += `Referred,${user.referralCode},"${user.name || ''}",${user.email},${user.createdAt?.toISOString() || ''}\n`;
    });

    // Add organic users
    organicUsers.forEach(user => {
      csv += `Organic,,"${user.name || ''}",${user.email},${user.createdAt?.toISOString() || ''}\n`;
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=referral-report.csv');
    res.send(csv);
  } catch (error: any) {
    console.error('Export referral data error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export referral data',
      error: error.message
    });
  }
};
