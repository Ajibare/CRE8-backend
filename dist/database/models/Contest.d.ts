import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IContest, {}, {}, {}, mongoose.Document<unknown, {}, IContest, {}, mongoose.DefaultSchemaOptions> & IContest & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IContest>;
export default _default;
//# sourceMappingURL=Contest.d.ts.map