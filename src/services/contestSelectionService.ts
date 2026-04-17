import User from '../database/models/User';
import Submission from '../database/models/Submission';

/**
 * Select top 100 users for the contest phase based on:
 * 1. Submission quality (rating)
 * 2. Number of votes received
 * 3. Engagement metrics
 */
export const selectTop100ForContest = async (): Promise<string[]> => {
  try {
    // Get all users with their submissions from audition phase
    const usersWithSubmissions = await User.aggregate([
      {
        $lookup: {
          from: 'submissions',
          localField: '_id',
          foreignField: 'userId',
          as: 'submissions'
        }
      },
      {
        $match: {
          'submissions.phase': 'audition',
          'submissions.status': 'approved'
        }
      },
      {
        $addFields: {
          totalVotes: { $sum: '$submissions.votes' },
          avgRating: { $avg: '$submissions.averageRating' },
          submissionCount: { $size: '$submissions' }
        }
      },
      {
        $sort: {
          totalVotes: -1,
          avgRating: -1
        }
      },
      {
        $limit: 100
      }
    ]);

    const selectedUserIds = usersWithSubmissions.map((user: any) => user._id.toString());
    
    // Update selected users
    await User.updateMany(
      { _id: { $in: selectedUserIds } },
      { $set: { isSelectedForContest: true } }
    );

    return selectedUserIds;
  } catch (error) {
    console.error('Error selecting top 100:', error);
    throw error;
  }
};

/**
 * Select top 10 users for grand final based on contest performance
 */
export const selectTop10ForGrandFinal = async (): Promise<string[]> => {
  try {
    // Get all selected contestants sorted by contest votes
    const topUsers = await User.find({ isSelectedForContest: true })
      .sort({ contestVotes: -1 })
      .limit(10)
      .select('_id');

    const grandFinalistIds = topUsers.map(user => user._id.toString());
    
    // Update grand finalists
    await User.updateMany(
      { _id: { $in: grandFinalistIds } },
      { $set: { isGrandFinalist: true } }
    );

    return grandFinalistIds;
  } catch (error) {
    console.error('Error selecting top 10:', error);
    throw error;
  }
};

/**
 * Get contest stats for admin dashboard
 */
export const getContestStats = async () => {
  const auditionSubmissions = await Submission.countDocuments({ phase: 'audition' });
  const contestSubmissions = await Submission.countDocuments({ phase: 'contest' });
  const selectedContestants = await User.countDocuments({ isSelectedForContest: true });
  const grandFinalists = await User.countDocuments({ isGrandFinalist: true });

  return {
    auditionSubmissions,
    contestSubmissions,
    selectedContestants,
    grandFinalists
  };
};
