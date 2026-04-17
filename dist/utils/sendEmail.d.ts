export declare const sendEmail: (to: string, subject: string, html: string) => Promise<void>;
export declare const emailTemplates: {
    paymentConfirmation: (email: string, reference: string, amount: number) => string;
    welcome: (name: string, creativeId: string) => string;
    auditionSchedule: (name: string, date: string, time: string) => string;
    contestStart: (name: string) => string;
    votingPush: (name: string, contestantName: string) => string;
    paymentVerification: (email: string, verificationLink: string, reference: string) => string;
};
//# sourceMappingURL=sendEmail.d.ts.map