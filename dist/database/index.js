"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = exports.Vote = exports.Submission = exports.Contest = exports.User = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const User_1 = __importDefault(require("./models/User"));
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return User_1.default; } });
const Contest_1 = __importDefault(require("./models/Contest"));
Object.defineProperty(exports, "Contest", { enumerable: true, get: function () { return Contest_1.default; } });
const Submission_1 = __importDefault(require("./models/Submission"));
Object.defineProperty(exports, "Submission", { enumerable: true, get: function () { return Submission_1.default; } });
const Vote_1 = __importDefault(require("./models/Vote"));
Object.defineProperty(exports, "Vote", { enumerable: true, get: function () { return Vote_1.default; } });
const Payment_1 = __importDefault(require("./models/Payment"));
Object.defineProperty(exports, "Payment", { enumerable: true, get: function () { return Payment_1.default; } });
let cached = global.mongooseCache;
if (!cached) {
    cached = global.mongooseCache = { conn: null, promise: null };
}
const connectDB = async () => {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/funtech-creative';
    if (cached.conn) {
        console.log('Using cached MongoDB connection');
        return cached.conn;
    }
    if (!cached.promise) {
        cached.promise = mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        }).then((mongoose) => {
            console.log('MongoDB Connected:', mongoose.connection.host);
            return mongoose;
        }).catch((error) => {
            console.error('Error connecting to MongoDB:', error);
            cached.promise = null; // Reset so next attempt can retry
            throw error;
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
};
exports.connectDB = connectDB;
//# sourceMappingURL=index.js.map