/**
 * Contest Phase Management
 *
 * PHASES:
 * 1. AUDITION: May 1st - All users can submit ONE video
 * 2. CONTEST: May 31 - June 28 - Selected 100 users submit ONE video per week
 * 3. GRAND_FINAL: Top 10 users selected for social media promotion
 */
export type ContestPhase = 'AUDITION' | 'CONTEST' | 'GRAND_FINAL' | 'ENDED';
export declare const getCurrentPhase: () => ContestPhase;
export declare const getPhaseInfo: () => {
    phase: ContestPhase;
    auditionStart: Date;
    contestStart: Date;
    contestEnd: Date;
};
export declare const canSubmitInAudition: (userId: string, Submission: any) => Promise<boolean>;
export declare const canSubmitInContest: (userId: string, Submission: any, isSelected: boolean) => Promise<{
    canSubmit: boolean;
    message?: string;
}>;
//# sourceMappingURL=contestPhase.d.ts.map