interface UploadOptions {
    folder?: string;
    resource_type?: 'auto' | 'image' | 'video' | 'raw';
    transformation?: any;
}
export declare const uploadToCloudinary: (buffer: Buffer, options?: UploadOptions) => Promise<any>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<any>;
export declare const getCloudinaryUrl: (publicId: string, options?: any) => string;
export {};
//# sourceMappingURL=cloudinaryUtils.d.ts.map