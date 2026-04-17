"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCloudinaryUrl = exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const uploadToCloudinary = async (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const stream = stream_1.Readable.from(buffer);
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder: options.folder || 'funtech',
            resource_type: options.resource_type,
            transformation: options.transformation || [],
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
        stream.pipe(uploadStream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary_1.v2.uploader.destroy(publicId);
        return result;
    }
    catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
const getCloudinaryUrl = (publicId, options = {}) => {
    return cloudinary_1.v2.url(publicId, options);
};
exports.getCloudinaryUrl = getCloudinaryUrl;
//# sourceMappingURL=cloudinaryUtils.js.map