import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare const getDashboardStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUsers: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateUserStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getContests: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSubmissions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const reviewSubmission: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getVotingAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFinancialReports: (req: AuthRequest, res: Response) => Promise<void>;
export declare const exportData: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=adminController.d.ts.map