import { Request, Response } from 'express';
import Vote from '../../database/models/Vote';
import User from '../../database/models/User';
import Submission from '../../database/models/Submission';
import Contest from '../../database/models/Contest';
import Payment from '../../database/models/Payment';
import { AuthRequest } from '../../middlewares/auth';
import { votingBundles, paymentTypes, flutterwaveConfig } from '../../config/flutterwave';
import { generateReference } from '../../utils/generateReference';
import { verifyFlutterwavePayment } from '../../utils/flutterwaveService';
import { sendVoteReceivedEmail } from '../../utils/emailService';

// Initiate voting payment
export const initiateVotingPayment = async (req: Request, res: Response) => {
  try {
    const { contestantId, submissionId, voteBundleType, votesCount, paymentMethod } = req.body;
    let { voterEmail } = req.body;
    
    // Use placeholder email for guest voters if not provided
    if (!voterEmail) {
      voterEmail = `guest_${Date.now()}@funtech.vote`;
    }
    const voterId = (req as any).user?._id || null; // Allow guest voters

    // Handle custom vote amounts
    let bundle;
    if (voteBundleType === 'custom') {
      if (!votesCount || votesCount < 1) {
        return res.status(400).json({ message: 'Invalid custom votes count' });
      }
      bundle = {
        votes: votesCount,
        price: votesCount * 100, // ₦100 per vote
      };
    } else {
      bundle = votingBundles[voteBundleType as keyof typeof votingBundles];
      if (!bundle) {
        return res.status(400).json({ message: 'Invalid vote bundle type' });
      }
    }

    // Verify submission exists
    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if submission is approved (or allow any status for now)
    if (submission.status !== 'approved' && submission.status !== 'pending') {
      return res.status(400).json({ message: 'Submission is not approved for voting' });
    }

    // Generate payment reference
    const reference = generateReference();

    // Create payment record
    const payment = new Payment({
      userId: voterId, // null for guest voters
      type: 'voting',
      amount: bundle.price,
      reference,
      status: 'pending',
      metadata: {
        contestantId,
        submissionId,
        voteBundleType,
        votesCount: bundle.votes,
        voterEmail
      }
    });

    await payment.save();

    // Determine which payment gateway to use
    const gateway = paymentMethod || 'flutterwave';
    console.log(`Using payment gateway: ${gateway}`);

    if (gateway === 'paystack') {
      // Initialize Paystack payment
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: voterEmail,
          amount: bundle.price * 100, // Paystack uses kobo (amount in NGN * 100)
          reference: reference,
          callback_url: `${process.env.FRONTEND_URL}/voting/callback`,
          metadata: {
            paymentId: payment._id.toString(),
            type: 'VOTING',
            contestantId,
            submissionId,
            voteBundleType,
            votesCount: bundle.votes,
            gateway: 'paystack',
          },
        }),
      });

      const paystackData: any = await paystackResponse.json();
      console.log('Paystack Response:', JSON.stringify(paystackData, null, 2));

      if (!paystackResponse.ok || !paystackData.status) {
        throw new Error(paystackData.message || 'Failed to initialize Paystack payment');
      }

      res.json({
        success: true,
        paymentReference: reference,
        amount: bundle.price,
        votesCount: bundle.votes,
        authorization_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        gateway: 'paystack',
      });
    } else {
      // Prepare Flutterwave payment payload
      const flutterwavePayload = {
        tx_ref: reference,
        amount: bundle.price,
        currency: 'NGN',
        redirect_url: `${process.env.FRONTEND_URL}/voting/callback`,
        payment_options: 'card, banktransfer, ussd, barter, payattitude',
        customer: {
          email: voterEmail,
          name: (req as any).user?.name || 'Guest Voter',
          phonenumber: (req as any).user?.phone || '',
        },
        customizations: {
          title: 'FUNTECH Creative Voting',
          description: `Vote ${bundle.votes} times for creative submission`,
          logo: 'https://example.com/logo.png',
        },
        meta: {
          paymentId: payment._id.toString(),
          type: 'VOTING',
          contestantId,
          submissionId,
          voteBundleType,
          votesCount: bundle.votes,
          gateway: 'flutterwave',
        },
      };

      console.log('Flutterwave Payload:', JSON.stringify(flutterwavePayload, null, 2));

      // Initialize Flutterwave payment
      const flutterwaveResponse = await fetch(`${flutterwaveConfig.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${flutterwaveConfig.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flutterwavePayload),
      });

      const flutterwaveData: any = await flutterwaveResponse.json();
      console.log('Flutterwave Response:', JSON.stringify(flutterwaveData, null, 2));

      if (!flutterwaveResponse.ok) {
        throw new Error(flutterwaveData.message || flutterwaveData.error || 'Failed to initialize payment');
      }

      res.json({
        success: true,
        paymentReference: reference,
        amount: bundle.price,
        votesCount: bundle.votes,
        flutterwaveData: {
          link: flutterwaveData.data.link,
          tx_ref: flutterwaveData.data.tx_ref,
        },
        gateway: 'flutterwave',
      });
    }
  } catch (error: any) {
    console.error('Voting payment initiation error:', error);
    res.status(500).json({ 
      message: 'Failed to initiate voting payment',
      error: error.message 
    });
  }
};

// Handle voting payment callback
export const handleVotingCallback = async (req: Request, res: Response) => {
  try {
    const { transaction_id, tx_ref } = req.query;

    if (!transaction_id && !tx_ref) {
      return res.status(400).json({ message: 'Transaction ID or Reference is required' });
    }

    // Verify payment with Flutterwave
    const flutterwaveData = await verifyFlutterwavePayment(transaction_id as string) as { status: string; transaction_id?: string; id?: string };

    if (!flutterwaveData) {
      return res.status(400).json({ message: 'Failed to verify payment with Flutterwave' });
    }

    if (flutterwaveData.status !== 'successful') {
      return res.status(400).json({ message: 'Payment not successful' });
    }

    // Find payment record
    const payment = await Payment.findOne({ reference: tx_ref as string });
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Update payment status
    payment.status = 'completed';
    payment.paidAt = new Date();
    payment.gatewayReference = flutterwaveData.transaction_id || flutterwaveData.id;
    await payment.save();

    // Create votes - calculate votes based on amount paid (₦100 per vote)
    const votes = [];
    const votesCount = Math.floor(payment.amount / 100); // ₦100 per vote
    console.log(`Creating ${votesCount} votes for contestant ${payment.metadata.contestantId}, submission ${payment.metadata.submissionId} (amount: ${payment.amount})`);
    for (let i = 0; i < votesCount; i++) {
      const vote = new Vote({
        voterId: payment.userId,
        contestantId: payment.metadata.contestantId,
        submissionId: payment.metadata.submissionId,
        votesCount: 1,
        amount: 100, // Each vote is ₦100
        paymentId: payment._id,
        ipAddress: req.ip || 'unknown',
        userAgent: req.get('User-Agent') || 'unknown',
        isVerified: true,
        voteBundle: {
          votes: votesCount,
          price: payment.amount,
          type: payment.metadata.bundleType || 'single',
        },
      });
      await vote.save();
      votes.push(vote._id);
      console.log(`Vote ${i+1} created: ${vote._id}`);
    }
    console.log(`Total votes created: ${votes.length}`);

    // Send email notification to contestant
    try {
      const [contestant, voter] = await Promise.all([
        User.findById(payment.metadata.contestantId),
        User.findById(payment.userId)
      ]);

      if (contestant && contestant.email) {
        await sendVoteReceivedEmail(
          contestant.email,
          contestant.name,
          voter?.name || 'Anonymous',
          votesCount,
          'Your submission',
          payment.metadata.contestantId
        );
      }
    } catch (emailError) {
      console.error('Failed to send vote received email:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      votesCount: votesCount,
      paymentData: {
        reference: payment.reference,
        amount: payment.amount,
        contestantId: payment.metadata.contestantId,
        votesCreated: votes.length
      }
    });

  } catch (error: any) {
    console.error('Voting callback error:', error);
    res.status(500).json({ 
      message: 'Failed to verify voting payment',
      error: error.message 
    });
  }
};

// Get voting bundles
export const getVotingBundles = async (req: Request, res: Response) => {
  try {
    const { contestId } = req.query;

    // Get contest settings
    let maxVotesPerUser = 10; // default
    if (contestId) {
      const contest = await Contest.findById(contestId);
      if (contest) {
        maxVotesPerUser = contest.settings.maxVotesPerUser;
      }
    }

    // Filter bundles based on remaining votes
    const availableBundles: Record<string, { votes: number; price: number; available: boolean }> = {};
    Object.entries(votingBundles).forEach(([key, bundle]) => {
      availableBundles[key] = {
        ...bundle,
        available: bundle.votes <= maxVotesPerUser
      };
    });

    res.json({
      bundles: availableBundles,
      maxVotesPerUser
    });
  } catch (error: any) {
    console.error('Get voting bundles error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch voting bundles',
      error: error.message 
    });
  }
};

// Get user voting history
export const getUserVotingHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const { contestId, page = 1, limit = 20 } = req.query;

    const filter: any = { voterId: userId, isVerified: true };
    if (contestId) filter.contestId = contestId;

    const votes = await Vote.find(filter)
      .populate('contestantId', 'name creativeId')
      .populate('submissionId', 'title')
      .populate('paymentId', 'amount status')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Vote.countDocuments(filter);

    res.json({
      votes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get user voting history error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch voting history',
      error: error.message 
    });
  }
};

// Get submission votes
export const getSubmissionVotes = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const votes = await Vote.find({ submissionId, isVerified: true })
      .populate('voterId', 'name creativeId')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * Number(page))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Vote.countDocuments({ submissionId, isVerified: true });

    res.json({
      votes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get submission votes error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch submission votes',
      error: error.message 
    });
  }
};

// Get contest leaderboard
export const getContestLeaderboard = async (req: Request, res: Response) => {
  try {
    const { contestId } = req.params;
    const { category, page = 1, limit = 20 } = req.query;

    // Validate contest
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $match: {
          contestId,
          isVerified: true
        }
      },
      {
        $group: {
          _id: '$contestantId',
          totalVotes: { $sum: '$votesCount' },
          totalAmount: { $sum: '$amount' },
          voteCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'contestant'
        }
      },
      {
        $unwind: '$contestant'
      },
      {
        $project: {
          contestantId: '$_id',
          totalVotes: 1,
          totalAmount: 1,
          voteCount: 1,
          contestant: {
            name: '$contestant.name',
            creativeId: '$contestant.creativeId',
            category: '$contestant.category',
            profileImage: '$contestant.profileImage'
          }
        }
      },
      {
        $sort: { totalVotes: -1 }
      }
    ];

    // Add category filter if specified
    if (category) {
      pipeline.splice(4, 0, {
        $match: {
          'contestant.category': category
        }
      });
    }

    const results = await Vote.aggregate(pipeline)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Vote.countDocuments({
      contestId,
      isVerified: true
    });

    res.json({
      leaderboard: results,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Get contest leaderboard error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch contest leaderboard',
      error: error.message 
    });
  }
};

// Get voting statistics
export const getVotingStatistics = async (req: Request, res: Response) => {
  try {
    const { contestId } = req.params;

    // Validate contest
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Get voting statistics
    const [
      totalVotes,
      totalAmount,
      uniqueVoters,
      voteBundles,
      topContestants
    ]: [number, Array<{ total?: number }>, number, Array<{ _id: string; count: number }>, unknown[]] = await Promise.all([
      Vote.countDocuments({ contestId, isVerified: true }),
      Vote.aggregate([
        { $match: { contestId, isVerified: true } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Vote.distinct('voterId').countDocuments({ contestId, isVerified: true }),
      Vote.aggregate([
        { $match: { contestId, isVerified: true } },
        { $group: { _id: '$voteBundle.type', count: { $sum: 1 } } }
      ]),
      Vote.aggregate([
        { $match: { contestId, isVerified: true } },
        {
          $group: {
            _id: '$contestantId',
            totalVotes: { $sum: '$votesCount' }
          }
        },
        { $sort: { totalVotes: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'contestant'
          }
        },
        {
          $project: {
            contestantName: '$contestant.name',
            creativeId: '$contestant.creativeId',
            totalVotes: 1
          }
        }
      ])
    ]);

    res.json({
      contest: {
        title: contest.title,
        status: contest.status,
        settings: contest.settings
      },
      statistics: {
        totalVotes: totalVotes || 0,
        totalAmount: (totalAmount[0] as { total?: number })?.total || 0,
        uniqueVoters,
        voteBundles: voteBundles.reduce<Record<string, number>>((acc, bundle) => {
          acc[bundle._id] = bundle.count;
          return acc;
        }, {}),
        topContestants
      }
    });
  } catch (error: any) {
    console.error('Get voting statistics error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch voting statistics',
      error: error.message 
    });
  }
};

// Anti-cheat: Check for suspicious voting patterns
export const checkVotingPatterns = async (req: Request, res: Response) => {
  try {
    const { contestantId, timeWindow = 3600 } = req.query; // Default 1 hour

    const timeAgo = new Date(Date.now() - (Number(timeWindow) * 1000));

    const suspiciousPatterns = await Vote.aggregate([
      {
        $match: {
          contestantId,
          createdAt: { $gte: timeAgo },
          isVerified: true
        }
      },
      {
        $group: {
          _id: '$ipAddress',
          voteCount: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          voters: { $addToSet: '$voterId' }
        }
      },
      {
        $match: {
          $or: [
            { voteCount: { $gt: 5 } }, // More than 5 votes from same IP
            { totalAmount: { $gt: 1000 } }, // More than 1000 NGN from same IP
            { $expr: { $gt: [{ $size: '$voters' }, 1] } } // Multiple voters from same IP
          ]
        }
      }
    ]);

    res.json({
      suspiciousPatterns,
      timeWindow: Number(timeWindow),
      checkedAt: new Date()
    });
  } catch (error: any) {
    console.error('Check voting patterns error:', error);
    res.status(500).json({ 
      message: 'Failed to check voting patterns',
      error: error.message 
    });
  }
};
