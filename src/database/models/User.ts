import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  // Basic Information
  name: string;
  email: string;
  phone: string;
  password?: string;
  
  // Registration Details
  role: 'admin' | 'creative' | 'voter';
  creativeId?: string;
  category?: string;
  country?: string;
  state?: string;
  city?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  
  // Profile Information
  profileImage?: string;
  bio?: string;
  experience?: string;
  education?: string;
  skills?: string[];
  portfolio?: string;
  
  // Social Media
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
  };
  
  // Social Media Follow Status
  socialFollowStatus?: {
    instagram: boolean;
    facebook: boolean;
    twitter: boolean;
    youtube: boolean;
    tiktok: boolean;
  };
  
  // Registration Process
  isVerified: boolean;
  isApproved: boolean;
  auditionStatus?: 'pending' | 'approved' | 'rejected';
  auditionDate?: Date;
  // Contest phase fields
  isSelectedForContest?: boolean;
  contestVotes?: number;
  isGrandFinalist?: boolean;
  grandFinalVotes?: number;
  voucherUsed?: string;
  referralCode?: string; // Track which marketer referred this user
  
  // Password Reset
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastPasswordReset?: Date;

  // Email Verification
  verificationToken?: string;
  verificationExpires?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    default: '',
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  password: {
    type: String,
    minlength: 6,
    select: false, // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['admin', 'creative', 'voter'],
    default: 'creative',
  },
  creativeId: {
    type: String,
    unique: true,
    sparse: true,
  },
  category: {
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
      'Advertising'
    ],
  },
  country: {
    type: String,
    default: '',
  },
  state: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    default: '',
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  profileImage: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
  },
  experience: {
    type: String,
    maxlength: [1000, 'Experience cannot exceed 1000 characters'],
  },
  education: {
    type: String,
    maxlength: [500, 'Education cannot exceed 500 characters'],
  },
  skills: [{
    type: String,
    trim: true,
  }],
  portfolio: {
    type: String,
  },
  socialLinks: {
    instagram: String,
    twitter: String,
    facebook: String,
    youtube: String,
    tiktok: String,
    linkedin: String,
  },
  socialFollowStatus: {
    instagram: { type: Boolean, default: false },
    facebook: { type: Boolean, default: false },
    twitter: { type: Boolean, default: false },
    youtube: { type: Boolean, default: false },
    tiktok: { type: Boolean, default: false },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  auditionStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  auditionDate: {
    type: Date,
  },
  // Contest phase fields
  isSelectedForContest: {
    type: Boolean,
    default: false,
  },
  contestVotes: {
    type: Number,
    default: 0,
  },
  isGrandFinalist: {
    type: Boolean,
    default: false,
  },
  grandFinalVotes: {
    type: Number,
    default: 0,
  },
  voucherUsed: {
    type: String,
  },
  referralCode: {
    type: String,
    index: true, // Index for faster queries
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  lastPasswordReset: {
    type: Date,
  },
  verificationToken: {
    type: String,
    select: false,
  },
  verificationExpires: {
    type: Date,
    select: false,
  },
}, {
  timestamps: true,
});

UserSchema.index({ email: 1 });
UserSchema.index({ creativeId: 1 });
UserSchema.index({ role: 1 });

export default mongoose.model<IUser>('User', UserSchema);
