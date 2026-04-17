import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, mongoose.DefaultSchemaOptions> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPayment>;
export default _default;
//# sourceMappingURL=Payment.d.ts.map