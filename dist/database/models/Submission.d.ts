import mongoose, { Document } from 'mongoose';
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
    contestWeek?: number;
    submittedAt: Date;
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ISubmission, {}, {}, {}, mongoose.Document<unknown, {}, ISubmission, {}, mongoose.DefaultSchemaOptions> & ISubmission & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISubmission>;
export default _default;
//# sourceMappingURL=Submission.d.ts.map