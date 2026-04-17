import mongoose from 'mongoose';
import { default as User } from './models/User';
import { default as Contest } from './models/Contest';
import { default as Submission } from './models/Submission';
import { default as Vote } from './models/Vote';
import { default as Payment } from './models/Payment';
declare global {
    var mongooseCache: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    } | undefined;
}
declare const connectDB: () => Promise<typeof mongoose>;
export { connectDB, User, Contest, Submission, Vote, Payment };
//# sourceMappingURL=index.d.ts.map