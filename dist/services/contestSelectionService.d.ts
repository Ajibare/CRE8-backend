/**
 * Select top 100 users for the contest phase based on:
 * 1. Submission quality (rating)
 * 2. Number of votes received
 * 3. Engagement metrics
 */
export declare const selectTop100ForContest: () => Promise<string[]>;
/**
 * Select top 10 users for grand final based on contest performance
 */
export declare const selectTop10ForGrandFinal: () => Promise<string[]>;
/**
 * Get contest stats for admin dashboard
 */
export declare const getContestStats: () => Promise<{
    auditionSubmissions: number;
    contestSubmissions: number;
    selectedContestants: number;
    grandFinalists: number;
}>;
//# sourceMappingURL=contestSelectionService.d.ts.map