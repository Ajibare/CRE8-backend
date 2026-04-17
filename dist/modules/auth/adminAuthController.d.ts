import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
/**
 * Register a new admin user
 * Only existing admins can register new admins
 * No payment required, just email and password
 */
export declare const registerAdmin: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get all admin users
 */
export declare const getAllAdmins: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Delete an admin user
 */
export declare const deleteAdmin: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=adminAuthController.d.ts.map