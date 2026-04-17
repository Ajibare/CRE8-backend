import { Request, Response } from 'express';
import { AuthRequest } from '../../middlewares/auth';
export declare const initiatePayment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const verifyPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPaymentHistory: (req: AuthRequest, res: Response) => Promise<void>;
export declare const initiateVotingPayment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const handlePaystackWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=paymentController.d.ts.map