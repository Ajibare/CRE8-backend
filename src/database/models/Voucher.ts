import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVoucher extends Document {
  code: string;
  discount: number;
  type: 'REGISTRATION' | 'VOTE' | 'PREMIUM';
  isActive: boolean;
  usedBy?: mongoose.Types.ObjectId;
  usedAt?: Date;
  expiresAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isExpired(): boolean;
  isUsed(): boolean;
  isValid(): boolean;
  markAsUsed(userId: mongoose.Types.ObjectId): Promise<IVoucher>;
}

interface IVoucherStatic extends Model<IVoucher> {
  generateCode(prefix?: string): string;
  findByCode(code: string): Promise<IVoucher | null>;
  validateVoucher(code: string, type?: string): Promise<{ valid: boolean; voucher?: IVoucher; discount?: number; message?: string }>;
}

const voucherSchema = new Schema<IVoucher, IVoucherStatic>({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    required: true,
    enum: ['REGISTRATION', 'VOTE', 'PREMIUM'],
    default: 'REGISTRATION'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  usedAt: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Indexes for better performance
voucherSchema.index({ code: 1 });
voucherSchema.index({ isActive: 1, expiresAt: 1 });
voucherSchema.index({ usedBy: 1 });

// Methods
voucherSchema.methods.isExpired = function(): boolean {
  return this.expiresAt < new Date();
};

voucherSchema.methods.isUsed = function(): boolean {
  return this.usedBy !== null && this.usedAt !== null;
};

voucherSchema.methods.isValid = function(): boolean {
  return this.isActive && !this.isExpired() && !this.isUsed();
};

voucherSchema.methods.markAsUsed = function(userId: mongoose.Types.ObjectId) {
  this.usedBy = userId;
  this.usedAt = new Date();
  this.isActive = false;
  return this.save();
};

// Static methods
voucherSchema.statics.generateCode = function(prefix: string = 'FUNTECH'): string {
  // Generate 6-digit numeric code
  const digits = Math.floor(100000 + Math.random() * 900000);
  return digits.toString();
};

voucherSchema.statics.findByCode = function(code: string) {
  return this.findOne({ code: code.toUpperCase() });
};

voucherSchema.statics.validateVoucher = async function(code: string, type: string = 'REGISTRATION') {
  const voucher = await this.findByCode(code);
  
  if (!voucher) {
    return { valid: false, message: 'Invalid voucher code' };
  }
  
  if (!voucher.isActive) {
    return { valid: false, message: 'Voucher is not active' };
  }
  
  if (voucher.isExpired()) {
    return { valid: false, message: 'Voucher has expired' };
  }
  
  if (voucher.isUsed()) {
    return { valid: false, message: 'Voucher has already been used' };
  }
  
  if (voucher.type !== type) {
    return { valid: false, message: `Voucher is not valid for ${type.toLowerCase()}` };
  }
  
  return { valid: true, voucher, discount: voucher.discount };
};

const Voucher = mongoose.model<IVoucher, IVoucherStatic>('Voucher', voucherSchema);
export default Voucher;
