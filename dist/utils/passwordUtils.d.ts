export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateResetToken: () => string;
export declare const generateResetTokenHash: (token: string) => string;
//# sourceMappingURL=passwordUtils.d.ts.map