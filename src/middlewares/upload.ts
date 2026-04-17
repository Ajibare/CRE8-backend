import multer from 'multer';
import cloudinary, { cloudinaryConfig } from '../config/cloudinary';
import { Request, Response, NextFunction } from 'express';

const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = cloudinaryConfig.allowedFormats;
  const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
  
  if (fileExtension && allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: cloudinaryConfig.maxFileSize,
  },
  fileFilter,
});

export const uploadToCloudinary = async (file: Express.Multer.File, folder: string = 'general'): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: autoDetectResourceType(file.mimetype),
        folder: `${cloudinaryConfig.folder}/${folder}`,
        public_id: `${Date.now()}-${file.originalname}`,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(file.buffer);
  });
};

const autoDetectResourceType = (mimetype: string): 'image' | 'video' | 'auto' => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'auto';
};
