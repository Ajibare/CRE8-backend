import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

export const cloudinaryConfig = {
  cloudinary,
  folder: 'funtech-creative',
  allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'mp3', 'wav', 'pdf'],
  maxFileSize: 50 * 1024 * 1024, // 50MB
  imageMaxSize: 10 * 1024 * 1024, // 10MB
  videoMaxSize: 50 * 1024 * 1024, // 50MB
  audioMaxSize: 20 * 1024 * 1024, // 20MB
};

export default cloudinary;
