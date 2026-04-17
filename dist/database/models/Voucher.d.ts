import mongoose, { Document, Model } from 'mongoose';
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
    validateVoucher(code: string, type?: string): Promise<{
        valid: boolean;
        voucher?: IVoucher;
        discount?: number;
        message?: string;
    }>;
}
declare const Voucher: IVoucherStatic;
export default Voucher;
//# sourceMappingURL=Voucher.d.ts.map