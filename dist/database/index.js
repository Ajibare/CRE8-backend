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
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/funtech-creative';
        const conn = await mongoose_1.default.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        // Handle connection errors
        mongoose_1.default.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose_1.default.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });
    }
    catch (error) {
        console.error('Error connecting to MongoDB:', error);
        console.error('Make sure MongoDB is running. Install from: https://www.mongodb.com/try/download/community');
        console.error('Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
        // Don't exit - let the server start without DB for now
        // process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=index.js.map