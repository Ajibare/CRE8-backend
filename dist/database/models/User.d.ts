import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: 'admin' | 'creative' | 'voter';
    creativeId?: string;
    category?: string;
    country?: string;
    state?: string;
    city?: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    profileImage?: string;
    bio?: string;
    experience?: string;
    education?: string;
    skills?: string[];
    portfolio?: string;
    socialLinks?: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
        youtube?: string;
        tiktok?: string;
        linkedin?: string;
    };
    socialFollowStatus?: {
        instagram: boolean;
        facebook: boolean;
        twitter: boolean;
        youtube: boolean;
        tiktok: boolean;
    };
    isVerified: boolean;
    isApproved: boolean;
    auditionStatus?: 'pending' | 'approved' | 'rejected';
    auditionDate?: Date;
    isSelectedForContest?: boolean;
    contestVotes?: number;
    isGrandFinalist?: boolean;
    grandFinalVotes?: number;
    voucherUsed?: string;
    referralCode?: string;
    businessName?: string;
    businessLocation?: string;
    businessType?: string;
    businessMedia?: string;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    lastPasswordReset?: Date;
    verificationToken?: string;
    verificationExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=User.d.ts.map