import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare const initiateVotingPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const handleVotingCallback: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getVotingBundles: (req: Request, res: Response) => Promise<void>;
export declare const getUserVotingHistory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSubmissionVotes: (req: Request, res: Response) => Promise<void>;
export declare const getContestLeaderboard: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getVotingStatistics: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const checkVotingPatterns: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=votingController.d.ts.map