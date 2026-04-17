import { Request, Response, NextFunction } from 'express';
export declare const passwordResetLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const loginLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const registrationLimiter: (req: Request, res: Response, next: NextFunction) => void;
export declare const securityHeaders: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateEmail: (email: string) => boolean;
export declare const validatePasswordStrength: (password: string) => {
    isValid: boolean;
    message?: string;
};
export declare const sanitizeInput: (input: string) => string;
//# sourceMappingURL=security.d.ts.map