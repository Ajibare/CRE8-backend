export declare const emailTemplates: {
    submissionReviewed: (name: string, submissionTitle: string, status: "approved" | "rejected", feedback?: string) => {
        subject: string;
        html: string;
    };
    voteReceived: (name: string, voterName: string, voteCount: number, submissionTitle: string, contestantId?: string) => {
        subject: string;
        html: string;
    };
    contestUpdate: (name: string, contestTitle: string, updateType: "started" | "ended" | "voting_started" | "winner_announced", message?: string) => {
        subject: string;
        html: string;
    };
    weeklyReminder: (name: string, contestTitle: string, week: number, daysRemaining: number) => {
        subject: string;
        html: string;
    };
    leaderboardChange: (name: string, contestTitle: string, oldPosition: number, newPosition: number) => {
        subject: string;
        html: string;
    };
    auditionPassed: (name: string) => {
        subject: string;
        html: string;
    };
    auditionFailed: (name: string, feedback?: string) => {
        subject: string;
        html: string;
    };
    contestPassed: (name: string) => {
        subject: string;
        html: string;
    };
    contestFailed: (name: string, feedback?: string) => {
        subject: string;
        html: string;
    };
};
export declare const sendEmail: (to: string, subject: string, html: string) => Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare const sendSubmissionReviewEmail: (to: string, name: string, submissionTitle: string, status: "approved" | "rejected", feedback?: string) => Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare const sendVoteReceivedEmail: (to: string, name: string, voterName: string, voteCount: number, submissionTitle: string, contestantId?: string) => Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare const sendContestUpdateEmail: (to: string, name: string, contestTitle: string, updateType: "started" | "ended" | "voting_started" | "winner_announced", message?: string) => Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare const sendWeeklyReminderEmail: (to: string, name: string, contestTitle: string, week: number, daysRemaining: number) => Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
export declare const sendLeaderboardChangeEmail: (to: string, name: string, contestTitle: string, oldPosition: number, newPosition: number) => Promise<import("nodemailer/lib/smtp-transport").SentMessageInfo>;
//# sourceMappingURL=emailService.d.ts.map