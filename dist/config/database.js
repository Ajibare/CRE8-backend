"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.dbConfig = {
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb+srv://ajibarebabajide1_db_user:<db_password>@creative.2xkavxl.mongodb.net/?appName=Creative',
        options: {
        // Connection options removed as they're deprecated in newer versions
        }
    }
};
//# sourceMappingURL=database.js.map