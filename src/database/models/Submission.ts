import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileType: 'image' | 'video' | 'audio' | 'document';
  fileSize: number;
  thumbnailUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  votes: number;
  averageRating?: number;
  ratings: {
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
  }[];
  tags: string[];
  phase: 'audition' | 'contest' | 'grand_final';
  contestWeek?: number; // 1-4 for contest phase
  submittedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  title: {
    type: String,
    required: [true, 'Submission title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 1000,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
  },
  fileType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document'],
    required: [true, 'File type is required'],
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
  },
  thumbnailUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  feedback: {
    type: String,
    maxlength: 500,
  },
  votes: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
  },
  ratings: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 300,
    },
  }],
  tags: [{
    type: String,
    trim: true,
  }],
  phase: {
    type: String,
    enum: ['audition', 'contest', 'grand_final'],
    required: true,
  },
  contestWeek: {
    type: Number,
    min: 1,
    max: 4,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

SubmissionSchema.index({ userId: 1, contestId: 1, week: 1 }, { unique: true });
SubmissionSchema.index({ contestId: 1, week: 1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ votes: -1 });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema);
