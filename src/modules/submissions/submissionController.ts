import { Request, Response } from 'express';
import Submission from '../../database/models/Submission';
import Contest from '../../database/models/Contest';
import User from '../../database/models/User';
import { AuthRequest } from '../../middlewares/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUtils';
import { sendSubmissionReviewEmail } from '../../utils/emailService';
import { getCurrentPhase, canSubmitInAudition, canSubmitInContest } from '../../utils/contestPhase';

// Submit work for a weekly task
export const submitWork = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, category, tags } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'File is required' });
    }

    // Check current contest phase
    const currentPhase = getCurrentPhase();
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let phase: 'audition' | 'contest' | 'grand_final' = 'audition';
    let contestWeek: number | undefined;

    // Phase-based submission rules
    if (currentPhase === 'ENDED') {
      return res.status(403).json({ message: 'Submissions are currently closed' });
    }

    if (currentPhase === 'AUDITION') {
      // Check if user already submitted during audition
      const canSubmit = await canSubmitInAudition(userId, Submission);
      if (!canSubmit) {
        return res.status(403).json({ message: 'You can only submit one video during the audition phase' });
      }
      phase = 'audition';
    }

    if (currentPhase === 'CONTEST') {
      // Check if user is selected for contest
      const contestCheck = await canSubmitInContest(userId, Submission, user.isSelectedForContest || false);
      if (!contestCheck.canSubmit) {
        return res.status(403).json({ message: contestCheck.message });
      }
      phase = 'contest';
      // Calculate current contest week (1-4)
      const now = new Date();
      const contestStart = new Date('2025-05-31T00:00:00Z');
      const daysDiff = Math.floor((now.getTime() - contestStart.getTime()) / (1000 * 60 * 60 * 24));
      contestWeek = Math.min(Math.floor(daysDiff / 7) + 1, 4);
    }

    if (currentPhase === 'GRAND_FINAL') {
      return res.status(403).json({ message: 'The grand final phase does not accept new submissions' });
    }

    // Upload file to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: `funtech/submissions`,
      resource_type: req.file.mimetype.startsWith('video/') ? 'video' : 'auto',
    });

    // Determine file type
    let fileType: 'image' | 'video' | 'audio' | 'document';
    if (req.file.mimetype.startsWith('image/')) {
      fileType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      fileType = 'video';
    } else if (req.file.mimetype.startsWith('audio/')) {
      fileType = 'audio';
    } else {
      fileType = 'document';
    }

    // Create submission
    const submission = new Submission({
      userId,
      title,
      description,
      category,
      fileUrl: uploadResult.secure_url,
      fileType,
      fileSize: req.file.size,
      thumbnailUrl: uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg') || uploadResult.secure_url,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      status: 'pending',
      phase,
      contestWeek
    });

    await submission.save();

    res.status(201).json({
      message: 'Work submitted successfully',
      submission
    });
  } catch (error: any) {
    console.error('Submit work error:', error);
    res.status(500).json({ 
      message: 'Failed to submit work',
      error: error.message 
    });
  }
};

// Get user's submissions
export const getUserSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { status } = req.query;

    const filter: any = { userId };
    if (status) filter.status = status;

    const submissions = await Submission.find(filter)
      .sort({ submittedAt: -1 });

    res.json({ submissions });
  } catch (error: any) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch submissions',
      error: error.message 
    });
  }
};

// Get submissions for a contest (public)
export const getContestSubmissions = async (req: Request, res: Response) => {
  try {
    const { contestId } = req.params;
    const { week, status, page = 1, limit = 20 } = req.query;

    // Validate contest exists
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const filter: any = { contestId };
    if (week) filter.week = Number(week);
    if (status) filter.status = status;
    else filter.status = 'approved'; // Only show approved submissions by default

    const submissions = await Submission.find(filter)
      .populate('userId', 'name creativeId category profileImage')
      .sort({ votes: -1, submittedAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Submission.countDocuments(filter);

    res.json({
      submissions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get contest submissions error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch submissions',
      error: error.message 
    });
  }
};

// Get submission by ID
export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findById(id)
      .populate('userId', 'name creativeId category profileImage');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({ submission });
  } catch (error: any) {
    console.error('Get submission error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch submission',
      error: error.message 
    });
  }
};

// Update submission (user can only update their own pending submissions)
export const updateSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;
    const userId = req.user._id;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user owns the submission
    if (submission.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only update your own submissions' });
    }

    // Check if submission is still pending
    if (submission.status !== 'pending') {
      return res.status(400).json({ message: 'Can only update pending submissions' });
    }

    // Update submission
    const updates: any = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (tags) updates.tags = tags.split(',').map((tag: string) => tag.trim());

    const updatedSubmission = await Submission.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Submission updated successfully',
      submission: updatedSubmission
    });
  } catch (error: any) {
    console.error('Update submission error:', error);
    res.status(500).json({ 
      message: 'Failed to update submission',
      error: error.message 
    });
  }
};

// Delete submission (user can only delete their own pending submissions)
export const deleteSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user owns the submission or is admin
    if (submission.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own submissions' });
    }

    // Check if submission is still pending (users can only delete pending submissions)
    if (submission.status !== 'pending' && req.user.role !== 'admin') {
      return res.status(400).json({ message: 'Can only delete pending submissions' });
    }

    // Delete file from Cloudinary
    try {
      await deleteFromCloudinary(submission.fileUrl);
    } catch (error) {
      console.error('Failed to delete file from Cloudinary:', error);
    }

    await Submission.findByIdAndDelete(id);

    res.json({
      message: 'Submission deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete submission error:', error);
    res.status(500).json({ 
      message: 'Failed to delete submission',
      error: error.message 
    });
  }
};

// Admin: Review submission (approve/reject)
export const reviewSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update submission
    submission.status = status;
    submission.feedback = feedback;
    submission.reviewedAt = new Date();

    await submission.save();

    // If submission is rejected, also fail the user in contest phase
    if (status === 'rejected') {
      try {
        const user = await User.findById(submission.userId);
        if (user) {
          user.isSelectedForContest = false;
          await user.save();
          
          // Send contest failure email
          try {
            const { emailTemplates } = await import('../../utils/emailService');
            await import('../../utils/emailService').then(({ sendEmail }) => {
              return sendEmail(
                user.email,
                emailTemplates.contestFailed(user.name, feedback || 'Submission did not meet contest requirements').subject,
                emailTemplates.contestFailed(user.name, feedback || 'Submission did not meet contest requirements').html
              );
            });
          } catch (emailErr) {
            console.error('Failed to send contest failure email:', emailErr);
          }
        }
      } catch (userError) {
        console.error('Failed to update user contest status:', userError);
      }
    }

    // Send email notification to user
    try {
      const user = await User.findById(submission.userId);
      if (user && user.email) {
        await sendSubmissionReviewEmail(
          user.email,
          user.name,
          submission.title,
          status,
          feedback
        );
      }
    } catch (emailError) {
      console.error('Failed to send review email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      message: `Submission ${status} successfully`,
      submission
    });
  } catch (error: any) {
    console.error('Review submission error:', error);
    res.status(500).json({ 
      message: 'Failed to review submission',
      error: error.message 
    });
  }
};

// Admin: Get all submissions for review
export const getPendingSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const submissions = await Submission.find({ status: 'pending' })
      .populate('userId', 'name creativeId category profileImage')
      .sort({ submittedAt: 1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Submission.countDocuments({ status: 'pending' });

    res.json({
      submissions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get pending submissions error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch pending submissions',
      error: error.message 
    });
  }
};

// Get featured submissions (for homepage)
export const getFeaturedSubmissions = async (req: Request, res: Response) => {
  try {
    const { contestId, limit = 6 } = req.query;

    const filter: any = { status: 'approved' };
    if (contestId) filter.contestId = contestId;

    const submissions = await Submission.find(filter)
      .populate('userId', 'name creativeId category profileImage')
      .sort({ votes: -1, submittedAt: -1 })
      .limit(Number(limit));

    res.json({ submissions });
  } catch (error: any) {
    console.error('Get featured submissions error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch featured submissions',
      error: error.message 
    });
  }
};

// Rate a submission
export const rateSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user already rated
    const existingRating = submission.ratings.find(r => r.userId.toString() === userId.toString());
    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this submission' });
    }

    // Add rating
    submission.ratings.push({
      userId,
      rating,
      comment
    });

    // Calculate average rating
    const totalRating = submission.ratings.reduce((sum, r) => sum + r.rating, 0);
    submission.averageRating = totalRating / submission.ratings.length;

    await submission.save();

    res.json({
      message: 'Rating submitted successfully',
      submission
    });
  } catch (error: any) {
    console.error('Rate submission error:', error);
    res.status(500).json({ 
      message: 'Failed to rate submission',
      error: error.message 
    });
  }
};
