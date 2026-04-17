import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  userId?: mongoose.Types.ObjectId;
  type: 'registration' | 'voting' | 'live_show' | 'premium_access';
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  reference: string;
  gatewayReference?: string;
  gateway: 'paystack' | 'flutterwave';
  metadata: {
    creativeId?: string;
    contestantId?: string;
    submissionId?: string;
    votes?: number;
    votesCount?: number;
    bundleType?: string;
    description?: string;
  };
  paidAt?: Date;
  verifiedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Allow null for guest voters
  },
  type: {
    type: String,
    enum: ['registration', 'voting', 'live_show', 'premium_access'],
    required: [true, 'Payment type is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  reference: {
    type: String,
    required: [true, 'Reference is required'],
    unique: true,
  },
  gatewayReference: {
    type: String,
    sparse: true,
  },
  gateway: {
    type: String,
    enum: ['paystack', 'flutterwave'],
    required: [true, 'Gateway is required'],
    default: 'paystack',
  },
  metadata: {
    creativeId: String,
    contestantId: String,
    votes: Number,
    bundleType: String,
    description: String,
  },
  paidAt: {
    type: Date,
  },
  verifiedAt: {
    type: Date,
  },
  failureReason: {
    type: String,
  },
}, {
  timestamps: true,
});

PaymentSchema.index({ userId: 1 });
PaymentSchema.index({ reference: 1 });
PaymentSchema.index({ gatewayReference: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ type: 1 });
PaymentSchema.index({ createdAt: -1 });

export default mongoose.model<IPayment>('Payment', PaymentSchema);
