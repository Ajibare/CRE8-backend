import { Request, Response } from 'express';
import User from '../../database/models/User';
import Submission from '../../database/models/Submission';
import Vote from '../../database/models/Vote';

// Get all contestants with leaderboard data
export const getContestants = async (req: Request, res: Response) => {
  try {
    const { category = 'all' } = req.query;

    // Build query
    const query: any = { role: { $ne: 'admin' } };
    if (category && category !== 'all') {
      query.category = category;
    }

    // Get all users with their submissions and votes
    const users = await User.find(query).select('-password');

    // Get vote counts for each user
    const contestantsWithStats = await Promise.all(
      users.map(async (user, index) => {
        // Get user's submissions
        const submissions = await Submission.find({ userId: user._id });

        // Calculate total votes from all submissions
        const submissionIds = submissions.map(sub => sub._id);
        const votesBySubmission = await Vote.find({ submissionId: { $in: submissionIds } });
        const votesByContestant = await Vote.find({ contestantId: user._id });
        const allVotes = [...votesBySubmission, ...votesByContestant];
        // Remove duplicates (votes that match both criteria)
        const uniqueVotes = allVotes.filter((vote, index, self) =>
          index === self.findIndex(v => v._id.toString() === vote._id.toString())
        );
        const totalVotes = uniqueVotes.reduce((sum, vote) => sum + (vote.votesCount || 1), 0);

        return {
          _id: user._id,
          name: user.name,
          creativeId: user.creativeId,
          category: user.category,
          country: user.country,
          state: user.state,
          totalVotes,
          submissionCount: submissions.length,
          submissions: submissions.map(s => ({ _id: s._id, title: s.title })),
          rank: 0, // Will be calculated after sorting
        };
      })
    );

    // Sort by votes (descending) and assign ranks
    const sortedContestants = contestantsWithStats
      .sort((a, b) => b.totalVotes - a.totalVotes)
      .map((contestant, index) => ({
        ...contestant,
        rank: index + 1,
      }));

    res.status(200).json({
      success: true,
      contestants: sortedContestants,
      total: sortedContestants.length,
    });
  } catch (error) {
    console.error('Get contestants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contestants',
    });
  }
};

// Get single contestant with details
export const getContestantById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Contestant not found',
      });
    }

    // Get submissions with vote counts
    const submissions = await Submission.find({ userId: user._id });

    // Get votes for each submission
    const submissionsWithVotes = await Promise.all(
      submissions.map(async (submission) => {
        const votes = await Vote.find({ submissionId: submission._id });
        const voteCount = votes.reduce((sum, vote) => sum + (vote.votesCount || 1), 0);

        return {
          _id: submission._id,
          title: submission.title,
          description: submission.description,
          category: submission.category,
          fileUrl: submission.fileUrl,
          fileType: submission.fileType,
          thumbnailUrl: submission.thumbnailUrl,
          votes: voteCount,
          submittedAt: submission.submittedAt,
        };
      })
    );

    // Calculate total votes
    const totalVotes = submissionsWithVotes.reduce((sum, sub) => sum + sub.votes, 0);

    // Get rank
    const allUsers = await User.find({ role: { $ne: 'admin' } }).select('_id');
    const voteCounts = await Promise.all(
      allUsers.map(async (u) => {
        const userSubmissions = await Submission.find({ userId: u._id });
        const submissionIds = userSubmissions.map(sub => sub._id);
        const userVotes = await Vote.find({ submissionId: { $in: submissionIds } });
        return userVotes.reduce((sum, vote) => sum + (vote.votesCount || 1), 0);
      })
    );

    const sortedVotes = voteCounts.sort((a, b) => b - a);
    const rank = sortedVotes.indexOf(totalVotes) + 1;

    const contestant = {
      _id: user._id,
      name: user.name,
      creativeId: user.creativeId,
      category: user.category,
      country: user.country,
      state: user.state,
      totalVotes,
      rank,
      submissions: submissionsWithVotes,
    };

    res.status(200).json({
      success: true,
      contestant,
    });
  } catch (error) {
    console.error('Get contestant error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contestant details',
    });
  }
};
