import { Request, Response } from 'express';
import User from '../../database/models/User';
import { sendEmail, emailTemplates } from '../../utils/emailService';

// Get user details
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user', error });
  }
};

// Update audition status (Pass/Fail)
export const updateAuditionStatus = async (req: Request, res: Response) => {
  try {
    const { userId, status, feedback } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.auditionStatus = status;
    
    // If passed, select for contest
    if (status === 'approved') {
      user.isSelectedForContest = true;
    }
    
    await user.save();

    // Send email notification
    const emailData = status === 'approved' 
      ? emailTemplates.auditionPassed(user.name)
      : emailTemplates.auditionFailed(user.name, feedback);

    await sendEmail(user.email, emailData.subject, emailData.html);

    res.json({ 
      message: `User ${status === 'approved' ? 'passed' : 'failed'} audition`, 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update audition status', error });
  }
};

// Update contest status (Pass/Fail)
export const updateContestStatus = async (req: Request, res: Response) => {
  try {
    const { userId, status, feedback } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If passed, select for grand final
    if (status === 'approved') {
      user.isGrandFinalist = true;
    }
    
    await user.save();

    // Send email notification
    const emailData = status === 'approved'
      ? emailTemplates.contestPassed(user.name)
      : emailTemplates.contestFailed(user.name, feedback);

    await sendEmail(user.email, emailData.subject, emailData.html);

    res.json({ 
      message: `User ${status === 'approved' ? 'passed' : 'failed'} contest phase`, 
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update contest status', error });
  }
};
