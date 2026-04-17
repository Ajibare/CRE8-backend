import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare const createContest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllContests: (req: Request, res: Response) => Promise<void>;
export declare const getActiveContest: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getContestById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateContest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const changeContestStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const addWeeklyTask: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const activateWeeklyTask: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteContest: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getContestStatistics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=contestController.d.ts.map