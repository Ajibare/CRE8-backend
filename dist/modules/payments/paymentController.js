"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaystackWebhook = exports.initiateVotingPayment = exports.getPaymentHistory = exports.verifyPayment = exports.initiatePayment = void 0;
const Payment_1 = __importDefault(require("../../database/models/Payment"));
const User_1 = __importDefault(require("../../database/models/User"));
const paystack_1 = require("../../config/paystack");
const generateReference_1 = require("../../utils/generateReference");
const initiatePayment = async (req, res) => {
    try {
        const { type, amount, metadata } = req.body;
        // Create payment record
        const payment = new Payment_1.default({
            userId: req.user._id,
            type,
            amount,
            status: 'pending',
            reference: (0, generateReference_1.generateReference)('PAY'),
            gateway: 'paystack',
            metadata,
        });
        await payment.save();
        // Initialize Paystack transaction
        const paystackResponse = await fetch(`${paystack_1.paystackConfig.baseUrl}/transaction/initialize`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${paystack_1.paystackConfig.secretKey}`,
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
        const paystackData = await paystackResponse.json();
        if (!paystackData.status) {
            return res.status(400).json({ message: 'Payment initialization failed' });
        }
        res.json({
            message: 'Payment initiated',
            paymentReference: payment.reference,
            authorizationUrl: paystackData.data.authorization_url,
        });
    }
    catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ message: 'Payment initiation failed' });
    }
};
exports.initiatePayment = initiatePayment;
const verifyPayment = async (req, res) => {
    try {
        const { reference } = req.params;
        // Verify payment with Paystack
        const paystackResponse = await fetch(`${paystack_1.paystackConfig.baseUrl}/transaction/verify/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${paystack_1.paystackConfig.secretKey}`,
            },
        });
        const paystackData = await paystackResponse.json();
        if (!paystackData.status || paystackData.data.status !== 'success') {
            return res.status(400).json({ message: 'Payment verification failed' });
        }
        // Update payment record
        const payment = await Payment_1.default.findOne({ reference });
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
            const user = await User_1.default.findById(payment.userId);
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
    }
    catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ message: 'Payment verification failed' });
    }
};
exports.verifyPayment = verifyPayment;
const getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment_1.default.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        res.json({ payments });
    }
    catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ message: 'Failed to fetch payment history' });
    }
};
exports.getPaymentHistory = getPaymentHistory;
const initiateVotingPayment = async (req, res) => {
    try {
        const { contestantId, bundleType } = req.body;
        if (!paystack_1.votingBundles[bundleType]) {
            return res.status(400).json({ message: 'Invalid bundle type' });
        }
        const bundle = paystack_1.votingBundles[bundleType];
        // Create payment record
        const payment = new Payment_1.default({
            userId: req.user._id,
            type: 'voting',
            amount: bundle.price,
            status: 'pending',
            reference: (0, generateReference_1.generateReference)('VOTE'),
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
        const paystackResponse = await fetch(`${paystack_1.paystackConfig.baseUrl}/transaction/initialize`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${paystack_1.paystackConfig.secretKey}`,
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
        const paystackData = await paystackResponse.json();
        if (!paystackData.status) {
            return res.status(400).json({ message: 'Voting payment initialization failed' });
        }
        res.json({
            message: 'Voting payment initiated',
            paymentReference: payment.reference,
            authorizationUrl: paystackData.data.authorization_url,
            votes: bundle.votes,
        });
    }
    catch (error) {
        console.error('Voting payment error:', error);
        res.status(500).json({ message: 'Voting payment failed' });
    }
};
exports.initiateVotingPayment = initiateVotingPayment;
const handlePaystackWebhook = async (req, res) => {
    try {
        const event = req.body;
        // Verify webhook signature
        const hash = require('crypto')
            .createHmac('sha512', paystack_1.paystackConfig.webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');
        if (hash !== req.headers['x-paystack-signature']) {
            return res.status(401).json({ message: 'Invalid webhook signature' });
        }
        // Handle webhook events
        if (event.event === 'charge.success') {
            const { reference, metadata } = event.data;
            const payment = await Payment_1.default.findOne({ reference });
            if (payment && payment.status === 'pending') {
                payment.status = 'completed';
                payment.gatewayReference = event.data.reference;
                payment.paidAt = new Date();
                payment.verifiedAt = new Date();
                await payment.save();
                // Handle specific payment types
                if (payment.type === 'registration') {
                    const user = await User_1.default.findById(payment.userId);
                    if (user && !user.isVerified) {
                        user.isVerified = true;
                        await user.save();
                    }
                }
            }
        }
        res.sendStatus(200);
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
};
exports.handlePaystackWebhook = handlePaystackWebhook;
//# sourceMappingURL=paymentController.js.map