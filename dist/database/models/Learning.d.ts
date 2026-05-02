import mongoose, { Document } from 'mongoose';
export interface ILearning extends Document {
    title: string;
    description: string;
    category: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    instructor?: string;
    tags: string[];
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ILearning, {}, {}, {}, mongoose.Document<unknown, {}, ILearning, {}, mongoose.DefaultSchemaOptions> & ILearning & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILearning>;
export default _default;
//# sourceMappingURL=Learning.d.ts.map