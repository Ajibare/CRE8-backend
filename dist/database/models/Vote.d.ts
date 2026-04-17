import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IVote, {}, {}, {}, mongoose.Document<unknown, {}, IVote, {}, mongoose.DefaultSchemaOptions> & IVote & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IVote>;
export default _default;
//# sourceMappingURL=Vote.d.ts.map