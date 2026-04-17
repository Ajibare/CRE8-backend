"use strict";
/**
 * Contest Phase Management
 *
 * PHASES:
 * 1. AUDITION: May 1st - All users can submit ONE video
 * 2. CONTEST: May 31 - June 28 - Selected 100 users submit ONE video per week
 * 3. GRAND_FINAL: Top 10 users selected for social media promotion
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.canSubmitInContest = exports.canSubmitInAudition = exports.getPhaseInfo = exports.getCurrentPhase = void 0;
// Phase dates
const AUDITION_START = new Date('2025-05-01T00:00:00Z');
const CONTEST_START = new Date('2025-05-31T00:00:00Z');
const CONTEST_END = new Date('2025-06-28T23:59:59Z');
const getCurrentPhase = () => {
    const now = new Date();
    if (now < AUDITION_START) {
        return 'ENDED'; // Before contest starts
    }
    if (now >= AUDITION_START && now < CONTEST_START) {
        return 'AUDITION';
    }
    if (now >= CONTEST_START && now <= CONTEST_END) {
        return 'CONTEST';
    }
    return 'GRAND_FINAL'; // After contest ends, grand final phase
};
exports.getCurrentPhase = getCurrentPhase;
const getPhaseInfo = () => {
    const phase = (0, exports.getCurrentPhase)();
    return {
        phase,
        auditionStart: AUDITION_START,
        contestStart: CONTEST_START,
        contestEnd: CONTEST_END,
    };
};
exports.getPhaseInfo = getPhaseInfo;
// Check if user can submit during audition (one submission only)
const canSubmitInAudition = async (userId, Submission) => {
    const submissionCount = await Submission.countDocuments({ userId });
    return submissionCount === 0;
};
exports.canSubmitInAudition = canSubmitInAudition;
// Check if user can submit during contest (one per week for selected 100)
const canSubmitInContest = async (userId, Submission, isSelected) => {
    if (!isSelected) {
        return { canSubmit: false, message: 'Only selected contestants can submit during the contest phase' };
    }
    // Get current week number (1-4)
    const now = new Date();
    const weekStart = new Date(CONTEST_START);
    const daysDiff = Math.floor((now.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    const currentWeek = Math.min(Math.floor(daysDiff / 7) + 1, 4);
    // Check if user already submitted this week
    const weekStartDate = new Date(CONTEST_START);
    weekStartDate.setDate(weekStartDate.getDate() + (currentWeek - 1) * 7);
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    const weekSubmission = await Submission.findOne({
        userId,
        createdAt: { $gte: weekStartDate, $lt: weekEndDate }
    });
    if (weekSubmission) {
        return { canSubmit: false, message: `You have already submitted for Week ${currentWeek}` };
    }
    return { canSubmit: true };
};
exports.canSubmitInContest = canSubmitInContest;
//# sourceMappingURL=contestPhase.js.map