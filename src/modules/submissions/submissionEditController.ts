import { Request, Response } from 'express';
import Submission from '../../database/models/Submission';
import { AuthRequest } from '../../middlewares/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinaryUtils';

// Update submission
export const updateSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { title, description, tags } = req.body;
    const userId = req.user._id;

    // Find submission
    const submission = await Submission.findOne({
      _id: submissionId,
      userId
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Update fields
    if (title) submission.title = title;
    if (description !== undefined) submission.description = description;
    if (tags) {
      submission.tags = typeof tags === 'string' 
        ? tags.split(',').map((tag: string) => tag.trim()) 
        : tags;
    }

    await submission.save();

    res.json({
      message: 'Submission updated successfully',
      submission
    });
  } catch (error: any) {
    console.error('Update submission error:', error);
    res.status(500).json({ 
      message: 'Failed to update submission',
      error: error.message 
    });
  }
};

// Replace submission file
export const replaceSubmissionFile = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    // Find submission
    const submission = await Submission.findOne({
      _id: submissionId,
      userId
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'New file is required' });
    }

    // Delete old file from Cloudinary
    if (submission.fileUrl) {
      try {
        // Extract public_id from URL
        const urlParts = submission.fileUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const folder = urlParts.slice(urlParts.indexOf('submissions')).join('/').replace(filename, '');
        const publicId = `funtech/${folder}${filename.split('.')[0]}`;
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.log('Error deleting old file:', error);
      }
    }

    // Upload new file
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

    // Update submission with new file info
    submission.fileUrl = uploadResult.secure_url;
    submission.fileType = fileType;
    submission.fileSize = req.file.size;
    submission.thumbnailUrl = uploadResult.secure_url.replace(/\.[^.]+$/, '.jpg') || uploadResult.secure_url;
    submission.status = 'pending';
    submission.feedback = undefined;
    submission.reviewedAt = undefined;

    await submission.save();

    res.json({
      message: 'File replaced successfully',
      submission
    });
  } catch (error: any) {
    console.error('Replace submission file error:', error);
    res.status(500).json({ 
      message: 'Failed to replace file',
      error: error.message 
    });
  }
};

// Delete submission
export const deleteSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    // Find submission
    const submission = await Submission.findOne({
      _id: submissionId,
      userId
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Delete file from Cloudinary
    if (submission.fileUrl) {
      try {
        const urlParts = submission.fileUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const folder = urlParts.slice(urlParts.indexOf('submissions')).join('/').replace(filename, '');
        const publicId = `funtech/${folder}${filename.split('.')[0]}`;
        await deleteFromCloudinary(publicId);
      } catch (error) {
        console.log('Error deleting file from Cloudinary:', error);
      }
    }

    // Delete submission
    await Submission.findByIdAndDelete(submissionId);

    res.json({ message: 'Submission deleted successfully' });
  } catch (error: any) {
    console.error('Delete submission error:', error);
    res.status(500).json({ 
      message: 'Failed to delete submission',
      error: error.message 
    });
  }
};

// Get single submission for editing
export const getSubmissionForEdit = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user._id;

    const submission = await Submission.findOne({
      _id: submissionId,
      userId
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({
      submission,
      canEdit: true
    });
  } catch (error: any) {
    console.error('Get submission for edit error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch submission',
      error: error.message 
    });
  }
};
