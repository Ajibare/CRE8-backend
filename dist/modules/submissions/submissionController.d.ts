import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare const submitWork: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserSubmissions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getContestSubmissions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getSubmissionById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateSubmission: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteSubmission: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const reviewSubmission: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPendingSubmissions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFeaturedSubmissions: (req: Request, res: Response) => Promise<void>;
export declare const rateSubmission: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=submissionController.d.ts.map