import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  voterId?: mongoose.Types.ObjectId;
  contestantId: mongoose.Types.ObjectId;
  submissionId?: mongoose.Types.ObjectId;
  votesCount: number;
  amount: number;
  paymentId: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  isVerified: boolean;
  voteBundle: {
    votes: number;
    price: number;
    type: 'single' | 'bundle_5' | 'bundle_10' | 'bundle_25';
  };
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema: Schema = new Schema({
  voterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow null for guest voters
  },
  contestantId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Contestant ID is required'],
  },
  submissionId: {
    type: Schema.Types.ObjectId,
    ref: 'Submission',
  },
  votesCount: {
    type: Number,
    required: [true, 'Votes count is required'],
    min: 1,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0,
  },
  paymentId: {
    type: Schema.Types.ObjectId,
    ref: 'Payment',
    required: [true, 'Payment ID is required'],
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  voteBundle: {
    votes: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['single', 'bundle_5', 'bundle_10', 'bundle_25'],
      required: true,
    },
  },
}, {
  timestamps: true,
});

VoteSchema.index({ voterId: 1, contestantId: 1 });
VoteSchema.index({ contestantId: 1 });
VoteSchema.index({ paymentId: 1 });
VoteSchema.index({ createdAt: -1 });
VoteSchema.index({ ipAddress: 1 });

export default mongoose.model<IVote>('Vote', VoteSchema);
