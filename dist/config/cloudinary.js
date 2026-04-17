"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloudinaryConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const cloudinary_1 = require("cloudinary");
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
});
exports.cloudinaryConfig = {
    cloudinary: cloudinary_1.v2,
    folder: 'funtech-creative',
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mp3', 'wav', 'pdf'],
    maxFileSize: 50 * 1024 * 1024, // 50MB
    imageMaxSize: 10 * 1024 * 1024, // 10MB
    videoMaxSize: 50 * 1024 * 1024, // 50MB
    audioMaxSize: 20 * 1024 * 1024, // 20MB
};
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map