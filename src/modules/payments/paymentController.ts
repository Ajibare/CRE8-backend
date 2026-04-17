import { Request, Response } from 'express';
import Payment from '../../database/models/Payment';
import User from '../../database/models/User';
import { paystackConfig, votingBundles } from '../../config/paystack';
import { generateReference } from '../../utils/generateReference';
import { AuthRequest } from '../../middlewares/auth';

interface PaystackResponse {
  status: boolean;
  data: {
    authorization_url: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  data: {
    status: string;
    reference: string;
  };
}

export const initiatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const { type, amount, metadata } = req.body;

    // Create payment record
    const payment = new Payment({
      userId: req.user._id,
      type,
      amount,
      status: 'pending',
      reference: generateReference('PAY'),
      gateway: 'paystack',
      metadata,
    });

    await payment.save();

    // Initialize Paystack transaction
    const paystackResponse = await fetch(`${paystackConfig.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: req.user.email,
        amount: amount * 100, // Paystack uses kobo
        reference: payment.reference,
        metadata: {
          paymentId: payment._id,
          userId: req.user._id,
          type,
          ...metadata,
        },
        callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
      }),
    });

    const paystackData: any = await paystackResponse.json();

    if (!paystackData.status) {
      return res.status(400).json({ message: 'Payment initialization failed' });
    }

    res.json({
      message: 'Payment initiated',
      paymentReference: payment.reference,
      authorizationUrl: paystackData.data.authorization_url,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.params;

    // Verify payment with Paystack
    const paystackResponse = await fetch(`${paystackConfig.baseUrl}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
      },
    });

    const paystackData: any = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = 'completed';
    payment.gatewayReference = paystackData.data.reference;
    payment.paidAt = new Date();
    payment.verifiedAt = new Date();
    await payment.save();

    // Handle different payment types
    if (payment.type === 'registration') {
      const user = await User.findById(payment.userId);
      if (user && !user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
    }

    res.json({
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        type: payment.type,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

export const getPaymentHistory = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ payments });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

export const initiateVotingPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { contestantId, bundleType } = req.body;

    if (!votingBundles[bundleType as keyof typeof votingBundles]) {
      return res.status(400).json({ message: 'Invalid bundle type' });
    }

    const bundle = votingBundles[bundleType as keyof typeof votingBundles];

    // Create payment record
    const payment = new Payment({
      userId: req.user._id,
      type: 'voting',
      amount: bundle.price,
      status: 'pending',
      reference: generateReference('VOTE'),
      gateway: 'paystack',
      metadata: {
        contestantId,
        votes: bundle.votes,
        bundleType,
        description: `Voting bundle: ${bundle.votes} votes`,
      },
    });

    await payment.save();

    // Initialize Paystack transaction
    const paystackResponse = await fetch(`${paystackConfig.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackConfig.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: req.user.email,
        amount: bundle.price * 100, // Paystack uses kobo
        reference: payment.reference,
        metadata: {
          paymentId: payment._id,
          userId: req.user._id,
          contestantId,
          votes: bundle.votes,
          bundleType,
        },
        callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
      }),
    });

    const paystackData: any = await paystackResponse.json();

    if (!paystackData.status) {
      return res.status(400).json({ message: 'Voting payment initialization failed' });
    }

    res.json({
      message: 'Voting payment initiated',
      paymentReference: payment.reference,
      authorizationUrl: paystackData.data.authorization_url,
      votes: bundle.votes,
    });
  } catch (error) {
    console.error('Voting payment error:', error);
    res.status(500).json({ message: 'Voting payment failed' });
  }
};

export const handlePaystackWebhook = async (req: Request, res: Response) => {
  try {
    const event = req.body;

    // Verify webhook signature
    const hash = require('crypto')
      .createHmac('sha512', paystackConfig.webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    // Handle webhook events
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;
      
      const payment = await Payment.findOne({ reference });
      if (payment && payment.status === 'pending') {
        payment.status = 'completed';
        payment.gatewayReference = event.data.reference;
        payment.paidAt = new Date();
        payment.verifiedAt = new Date();
        await payment.save();

        // Handle specific payment types
        if (payment.type === 'registration') {
          const user = await User.findById(payment.userId);
          if (user && !user.isVerified) {
            user.isVerified = true;
            await user.save();
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
};
