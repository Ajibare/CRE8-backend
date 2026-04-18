import { Request, Response } from 'express';
export declare const initiateRegistrationPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const handlePaystackCallback: (req: Request, res: Response) => Promise<void>;
export declare const initiateFlutterwaveRegistrationPayment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const handleFlutterwaveCallback: (req: Request, res: Response) => Promise<void | Response<any, Record<string, any>>>;
export declare const verifyEmail: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=paymentInitiationController.d.ts.map