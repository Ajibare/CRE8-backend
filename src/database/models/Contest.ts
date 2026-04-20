import mongoose, { Document, Schema } from 'mongoose';

export interface IContest extends Document {
  title: string;
  description: string;
  status: 'audition' | 'active' | 'voting' | 'finished';
  startDate: Date;
  endDate: Date;
  registrationFee: number;
  prizes: {
    first: number;
    second: number;
    third: number;
  };
  categories: string[];
  currentWeek?: number;
  totalWeeks: number;
  weeklyTasks: {
    week: number;
    title: string;
    description: string;
    dueDate: Date;
    isActive: boolean;
  }[];
  settings: {
    allowVoting: boolean;
    votingCost: number;
    maxVotesPerUser: number;
    requireApprovalForSubmissions: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ContestSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Contest title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Contest description is required'],
  },
  status: {
    type: String,
    enum: ['audition', 'active', 'voting', 'finished'],
    default: 'audition',
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
  },
  registrationFee: {
    type: Number,
    required: [true, 'Registration fee is required'],
    default: 2000,
  },
  prizes: {
    first: {
      type: Number,
      required: true,
      default: 1500000,
    },
    second: {
      type: Number,
      required: true,
      default: 500000,
    },
    third: {
      type: Number,
      required: true,
      default: 250000,
    },
  },
  categories: [{
    type: String,
    enum: [
      'Design',
      'Video Editing',
      'Music',
      'Content Creation',
      'Photography',
      'Writing',
      'UI/UX Design',
      'Web Design',
      'Illustration',
      'Digital Art',
      'Fashion Design',
      'Creative Direction',
      'Advertising',
      'Art & Craft',
      'Business & Creative Strategist',
    ],
  }],
  currentWeek: {
    type: Number,
    default: 0,
  },
  totalWeeks: {
    type: Number,
    required: true,
    default: 8,
  },
  weeklyTasks: [{
    week: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  }],
  settings: {
    allowVoting: {
      type: Boolean,
      default: true,
    },
    votingCost: {
      type: Number,
      default: 100,
    },
    maxVotesPerUser: {
      type: Number,
      default: 10,
    },
    requireApprovalForSubmissions: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

ContestSchema.index({ status: 1 });
ContestSchema.index({ startDate: 1 });
ContestSchema.index({ endDate: 1 });

export default mongoose.model<IContest>('Contest', ContestSchema);
