import { Request, Response, NextFunction } from 'express';
export declare const validateRequest: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const registerValidation: import("express-validator").ValidationChain[];
export declare const loginValidation: import("express-validator").ValidationChain[];
export declare const submissionValidation: import("express-validator").ValidationChain[];
export declare const voteValidation: import("express-validator").ValidationChain[];
//# sourceMappingURL=validation.d.ts.map