import mongoose, { Schema, Document } from 'mongoose';

export interface ILearning extends Document {
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: number; // in minutes
  instructor?: string;
  tags: string[];
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const LearningSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Photography',
      'Video Editing',
      'Graphic Design',
      'Music Production',
      'Writing',
      'Marketing',
      'Business Skills',
      'Technology',
      'Other'
    ]
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  instructor: {
    type: String,
    default: 'FUNTECH Academy'
  },
  tags: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<ILearning>('Learning', LearningSchema);
