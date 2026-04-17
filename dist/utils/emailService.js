"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendLeaderboardChangeEmail = exports.sendWeeklyReminderEmail = exports.sendContestUpdateEmail = exports.sendVoteReceivedEmail = exports.sendSubmissionReviewEmail = exports.sendEmail = exports.emailTemplates = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Configure email transporter
const transporter = nodemailer_1.default.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
    },
});
// Email templates
exports.emailTemplates = {
    // Submission review notification
    submissionReviewed: (name, submissionTitle, status, feedback) => ({
        subject: `Your Submission "${submissionTitle}" Has Been ${status === 'approved' ? 'Approved' : 'Reviewed'}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #7c3aed; margin-bottom: 20px;">Submission Update</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Your submission "<strong>${submissionTitle}</strong>" has been <strong style="color: ${status === 'approved' ? '#10b981' : '#ef4444'};">${status}</strong>.
          </p>
          ${feedback ? `
          <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="color: #4b5563; margin-bottom: 10px;">Admin Feedback:</h4>
            <p style="color: #6b7280; font-style: italic;">${feedback}</p>
          </div>
          ` : ''}
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            ${status === 'approved'
            ? 'Your submission is now visible to the public and can receive votes!'
            : 'Please review the feedback and consider making improvements before resubmitting.'}
          </p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              View My Submissions
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; text-align: center;">
            The FUNTECH Creative Challenge Team
          </p>
        </div>
      </div>
    `
    }),
    // Vote received notification
    voteReceived: (name, voterName, voteCount, submissionTitle, contestantId) => ({
        subject: `New Vote on "${submissionTitle}"!`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #7c3aed; margin-bottom: 20px;">New Vote Received!</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            <strong>${voterName}</strong> just cast <strong>${voteCount} vote${voteCount > 1 ? 's' : ''}</strong> for your submission "<strong>${submissionTitle}</strong>"!
          </p>
          <div style="background: #fef3c7; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <span style="font-size: 48px;">🎉</span>
            <p style="color: #92400e; font-size: 18px; font-weight: 600; margin-top: 10px;">
              Keep up the great work!
            </p>
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${contestantId ? `${process.env.FRONTEND_URL}/contestants/${contestantId}` : `${process.env.FRONTEND_URL}/dashboard`}" 
               style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              View My Progress
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; text-align: center;">
            The FUNTECH Creative Challenge Team
          </p>
        </div>
      </div>
    `
    }),
    // Contest update notification
    contestUpdate: (name, contestTitle, updateType, message) => {
        const titles = {
            started: 'Contest Has Started!',
            ended: 'Contest Has Ended',
            voting_started: 'Voting Has Started!',
            winner_announced: 'Winner Announced!'
        };
        const emojis = {
            started: '🚀',
            ended: '🏁',
            voting_started: '🗳️',
            winner_announced: '🏆'
        };
        return {
            subject: `${titles[updateType]} - ${contestTitle}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 64px;">${emojis[updateType]}</span>
            </div>
            <h2 style="color: #7c3aed; margin-bottom: 20px; text-align: center;">${titles[updateType]}</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              ${message || `The contest "<strong>${contestTitle}</strong>" has ${updateType.replace('_', ' ')}.`}
            </p>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.FRONTEND_URL}/contests" 
                 style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                View Contest
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; text-align: center;">
              The FUNTECH Creative Challenge Team
            </p>
          </div>
        </div>
      `
        };
    },
    // Weekly reminder
    weeklyReminder: (name, contestTitle, week, daysRemaining) => ({
        subject: `Week ${week} Submission Reminder - ${contestTitle}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #7c3aed; margin-bottom: 20px;">Don't Miss Week ${week}!</h2>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hi ${name},
          </p>
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            This is a friendly reminder that <strong>Week ${week}</strong> of "<strong>${contestTitle}</strong>" is ongoing.
          </p>
          <div style="background: ${daysRemaining <= 2 ? '#fef2f2' : '#fef3c7'}; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <span style="font-size: 36px;">⏰</span>
            <p style="color: ${daysRemaining <= 2 ? '#dc2626' : '#92400e'}; font-size: 18px; font-weight: 600; margin-top: 10px;">
              ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining to submit!
            </p>
          </div>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.FRONTEND_URL}/submissions/submit" 
               style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Submit Now
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; text-align: center;">
            The FUNTECH Creative Challenge Team
          </p>
        </div>
      </div>
    `
    }),
    // Leaderboard position change
    leaderboardChange: (name, contestTitle, oldPosition, newPosition) => {
        const improved = newPosition < oldPosition;
        return {
            subject: `${improved ? '📈' : '📉'} Your Ranking Changed!`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #7c3aed; margin-bottom: 20px;">Leaderboard Update</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi ${name},
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Your position on the "<strong>${contestTitle}</strong>" leaderboard has changed!
            </p>
            <div style="background: ${improved ? '#d1fae5' : '#fef2f2'}; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
              <span style="font-size: 48px;">${improved ? '📈' : '📉'}</span>
              <p style="color: #374151; font-size: 18px; margin-top: 10px;">
                Position: <strong style="color: #6b7280; text-decoration: line-through;">#${oldPosition}</strong>
                <span style="color: ${improved ? '#10b981' : '#ef4444'}; font-size: 24px;"> → <strong>#${newPosition}</strong></span>
              </p>
              <p style="color: ${improved ? '#059669' : '#dc2626'}; font-weight: 600;">
                ${improved ? 'You moved up! Great work!' : 'Keep pushing! You can do it!'}
              </p>
            </div>
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.FRONTEND_URL}/voting/leaderboard" 
                 style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
                View Leaderboard
              </a>
            </div>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 30px; text-align: center;">
              The FUNTECH Creative Challenge Team
            </p>
          </div>
        </div>
      `
        };
    },
    // Audition Phase Notifications
    auditionPassed: (name) => {
        return {
            subject: '🎉 Congratulations! You Passed the Audition Phase!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Congratulations ${name}!</h2>
          <p>We are thrilled to inform you that you have <strong>passed the Audition Phase</strong> of the FUNTECH Creative Challenge!</p>
          <p>You have been selected to proceed to the next stage of the competition. Your creativity and talent have truly impressed our judges.</p>
          <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-top: 0;">What's Next?</h3>
            <ul>
              <li>You are now in the Contest Phase</li>
              <li>Prepare your best submissions for the weekly contests</li>
              <li>Engage with the community and gather votes</li>
            </ul>
          </div>
          <p>Log in to your dashboard to see your new contestant status and start submitting your work!</p>
          <p style="color: #666;">Best regards,<br>FUNTECH Creative Team</p>
        </div>
      `
        };
    },
    auditionFailed: (name, feedback) => {
        return {
            subject: 'FUNTECH Creative Challenge - Audition Result',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Hello ${name},</h2>
          <p>Thank you for your participation in the FUNTECH Creative Challenge Audition Phase.</p>
          <p>After careful consideration by our judges, we regret to inform you that we will not be able to continue with you in the competition at this time.</p>
          ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
          <p>We sincerely appreciate your effort and creativity. Please don't be discouraged - we encourage you to continue developing your skills and consider participating in future events.</p>
          <p style="color: #666;">Best regards,<br>FUNTECH Creative Team</p>
        </div>
      `
        };
    },
    // Contest Phase Notifications
    contestPassed: (name) => {
        return {
            subject: '🌟 Amazing! You Made it to the Grand Finals!',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Congratulations ${name}!</h2>
          <p>Outstanding performance! You have successfully <strong>advanced to the Grand Finals</strong> of the FUNTECH Creative Challenge!</p>
          <p>Your consistent excellence throughout the Contest Phase has earned you a spot among our top contestants.</p>
          <div style="background: #f3e8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #7c3aed; margin-top: 0;">Grand Finals Information</h3>
            <ul>
              <li>You are now a Grand Finalist!</li>
              <li>Prepare your best work for the final showcase</li>
              <li>Voting will be open to determine the winner</li>
            </ul>
          </div>
          <p>This is the final stage - give it your all!</p>
          <p style="color: #666;">Best regards,<br>FUNTECH Creative Team</p>
        </div>
      `
        };
    },
    contestFailed: (name, feedback) => {
        return {
            subject: 'FUNTECH Creative Challenge - Contest Phase Result',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Hello ${name},</h2>
          <p>Thank you for your participation in the FUNTECH Creative Challenge Contest Phase.</p>
          <p>We want to inform you that your journey in this year's competition has come to an end. You will not be proceeding to the Grand Finals.</p>
          ${feedback ? `<p><strong>Feedback:</strong> ${feedback}</p>` : ''}
          <p>We truly appreciate your participation and the creativity you brought to the competition. This is not the end of your creative journey!</p>
          <p>Keep creating, keep growing, and we hope to see you in future challenges.</p>
          <p style="color: #666;">Best regards,<br>FUNTECH Creative Team</p>
        </div>
      `
        };
    }
};
// Send email function
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"FUNTECH Creative Challenge" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log('Email sent:', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
// Send submission review notification
const sendSubmissionReviewEmail = async (to, name, submissionTitle, status, feedback) => {
    const template = exports.emailTemplates.submissionReviewed(name, submissionTitle, status, feedback);
    return (0, exports.sendEmail)(to, template.subject, template.html);
};
exports.sendSubmissionReviewEmail = sendSubmissionReviewEmail;
// Send vote received notification
const sendVoteReceivedEmail = async (to, name, voterName, voteCount, submissionTitle, contestantId) => {
    const template = exports.emailTemplates.voteReceived(name, voterName, voteCount, submissionTitle, contestantId);
    return (0, exports.sendEmail)(to, template.subject, template.html);
};
exports.sendVoteReceivedEmail = sendVoteReceivedEmail;
// Send contest update notification
const sendContestUpdateEmail = async (to, name, contestTitle, updateType, message) => {
    const template = exports.emailTemplates.contestUpdate(name, contestTitle, updateType, message);
    return (0, exports.sendEmail)(to, template.subject, template.html);
};
exports.sendContestUpdateEmail = sendContestUpdateEmail;
// Send weekly reminder
const sendWeeklyReminderEmail = async (to, name, contestTitle, week, daysRemaining) => {
    const template = exports.emailTemplates.weeklyReminder(name, contestTitle, week, daysRemaining);
    return (0, exports.sendEmail)(to, template.subject, template.html);
};
exports.sendWeeklyReminderEmail = sendWeeklyReminderEmail;
// Send leaderboard change notification
const sendLeaderboardChangeEmail = async (to, name, contestTitle, oldPosition, newPosition) => {
    const template = exports.emailTemplates.leaderboardChange(name, contestTitle, oldPosition, newPosition);
    return (0, exports.sendEmail)(to, template.subject, template.html);
};
exports.sendLeaderboardChangeEmail = sendLeaderboardChangeEmail;
//# sourceMappingURL=emailService.js.map