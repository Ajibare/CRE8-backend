import { Request, Response } from 'express';
export declare const validateVoucher: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createVoucher: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const applyVoucherToRegistration: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const completeRegistrationWithVoucher: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAllVouchers: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=voucherController.d.ts.map