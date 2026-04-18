"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmail = exports.handleFlutterwaveCallback = exports.initiateFlutterwaveRegistrationPayment = exports.handlePaystackCallback = exports.initiateRegistrationPayment = void 0;
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const generateReference_1 = require("../../utils/generateReference");
const paystack_1 = require("../../config/paystack");
const User_1 = __importDefault(require("../../database/models/User"));
const sendEmail_1 = require("../../utils/sendEmail");
// 20 Unique Referral Codes for Marketers
// Format: CRF + 3 digits (must NOT be 001-020)
// These codes are used for tracking referrals - NO DISCOUNT applied
const REFERRAL_CODES = [
    'CRF045', 'CRF067', 'CRF089', 'CRF123', 'CRF156',
    'CRF178', 'CRF234', 'CRF267', 'CRF289', 'CRF345',
    'CRF378', 'CRF456', 'CRF489', 'CRF567', 'CRF589',
    'CRF678', 'CRF789', 'CRF890', 'CRF901', 'CRF999'
];
// Get list of valid referral codes
const getReferralCodes = () => {
    return REFERRAL_CODES;
};
// Initialize payment for registration
const initiateRegistrationPayment = async (req, res) => {
    console.log('=== PAYSTACK PAYMENT INITIATION STARTED ===');
    console.log('Request body:', req.body);
    try {
        const { email, referralCode } = req.body;
        if (!email) {
            console.log('Validation failed: Email is required');
            return res.status(400).json({ message: 'Email is required' });
        }
        // Payment is always #2000 (no discount)
        const amount = 2000;
        // Validate referral code if provided (for tracking only, no discount)
        let validReferralCode = null;
        if (referralCode) {
            // Check if it's one of the valid referral codes
            const validCodes = getReferralCodes();
            if (validCodes.includes(referralCode.toUpperCase())) {
                validReferralCode = referralCode.toUpperCase();
                console.log('Valid referral code entered:', validReferralCode);
            }
            else {
                console.log('Invalid referral code entered:', referralCode);
            }
        }
        // Generate payment reference
        const reference = (0, generateReference_1.generateReference)();
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || paystack_1.paystackConfig.secretKey;
        const BACKEND_URL = process.env.BACKEND_URL || 'https://cre-8-backend.vercel.app';
        console.log('Paystack Secret Key loaded:', PAYSTACK_SECRET_KEY ? 'Yes (masked)' : 'NO');
        console.log('Backend URL:', BACKEND_URL);
        const payload = {
            reference,
            amount: amount * 100, // Convert to kobo
            email,
            callback_url: `${BACKEND_URL}/api/payments/callback`,
            metadata: {
                referralCode: validReferralCode || undefined,
            },
        };
        // Call Paystack API to initialize transaction
        console.log('Calling Paystack API with payload:', payload);
        console.log('Paystack API URL: https://api.paystack.co/transaction/initialize');
        const response = await axios_1.default.post('https://api.paystack.co/transaction/initialize', payload, {
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Paystack API response:', response.data);
        // Return the payment link/authorization to the frontend
        return res.status(200).json({
            success: true,
            message: 'Payment initialized successfully',
            data: {
                paymentLink: response.data.data.authorization_url,
                reference: reference,
                accessCode: response.data.data.access_code
            }
        });
    }
    catch (error) {
        console.error('=== PAYSTACK ERROR DETAILS ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
        console.error('Request config:', error.config);
        console.error('=== END ERROR DETAILS ===');
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || error.message || 'Failed to initiate payment with Paystack'
        });
    }
};
exports.initiateRegistrationPayment = initiateRegistrationPayment;
// Handle Paystack callback
const handlePaystackCallback = async (req, res) => {
    try {
        const { transaction_id, tx_ref } = req.query;
        if (!transaction_id && !tx_ref) {
            const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
            return res.redirect(`${frontendUrl}/register?payment=error&message=${encodeURIComponent('Transaction ID or Reference is required')}`);
        }
        // Get reference from query params
        const reference = tx_ref || transaction_id;
        if (!reference) {
            const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
            return res.redirect(`${frontendUrl}/register?payment=error&message=${encodeURIComponent('Transaction reference is required')}`);
        }
        // Verify payment with Paystack
        const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || paystack_1.paystackConfig.secretKey;
        const response = await axios_1.default.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
            }
        });
        const paystackData = response.data;
        if (!paystackData.status) {
            throw new Error(paystackData.message || 'Failed to verify payment');
        }
        if (paystackData.data.status !== 'success') {
            const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
            return res.redirect(`${frontendUrl}/register?payment=failed`);
        }
        // Get email from payment data
        const email = paystackData.data.customer.email;
        const referralCodeFromMetadata = paystackData.data.metadata?.referralCode;
        console.log('Paystack callback - Processing payment for email:', email);
        console.log('Paystack callback - Metadata from Paystack:', JSON.stringify(paystackData.data.metadata));
        console.log('Paystack callback - Referral code from metadata:', referralCodeFromMetadata);
        // Find or create user and mark as verified (email already verified by payment)
        let user = await User_1.default.findOne({ email });
        console.log('Paystack callback - User found:', user ? 'YES' : 'NO', 'User ID:', user?._id);
        if (!user) {
            // Create a placeholder user marked as verified
            console.log('Paystack callback - Creating new verified user');
            user = new User_1.default({
                email,
                name: email.split('@')[0], // Temporary name
                isVerified: true, // Email is verified since they paid with it
                referralCode: paystackData.data.metadata?.referralCode,
                role: 'creative',
            });
            await user.save();
            console.log('Paystack callback - New user created and verified:', user._id);
        }
        else {
            // Mark existing user as verified
            console.log('Paystack callback - Updating existing user, current isVerified:', user.isVerified);
            user.isVerified = true;
            // Store referral code if not already set
            if (!user.referralCode && paystackData.data.metadata?.referralCode) {
                user.referralCode = paystackData.data.metadata?.referralCode;
                console.log('Paystack callback - Saved referral code for existing user:', user.referralCode);
            }
            await user.save();
            console.log('Paystack callback - User marked as verified:', user._id, 'New isVerified:', user.isVerified);
        }
        // Send payment confirmation email
        try {
            const amount = paystackData.data.amount || paystack_1.paymentTypes.REGISTRATION;
            await (0, sendEmail_1.sendEmail)(email, 'Payment Confirmation - FUNTECH Creative Challenge', sendEmail_1.emailTemplates.paymentConfirmation(email, String(reference), amount));
            console.log('Payment confirmation email sent to:', email);
        }
        catch (emailError) {
            console.error('Failed to send payment confirmation email:', emailError);
            // Don't fail the callback if email fails
        }
        // Redirect directly to register page with verified status
        const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
        const redirectUrl = `${frontendUrl}/register?payment=success&email=${encodeURIComponent(email)}&ref=${encodeURIComponent(String(reference))}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('Payment callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
        res.redirect(`${frontendUrl}/register?payment=error&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
    }
};
exports.handlePaystackCallback = handlePaystackCallback;
// Initialize payment with Flutterwave for registration
const initiateFlutterwaveRegistrationPayment = async (req, res) => {
    try {
        const { email, referralCode } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        // Calculate amount
        let amount = paystack_1.paymentTypes.REGISTRATION;
        let discount = 0;
        // Fixed amount - no voucher discount
        amount = paystack_1.paymentTypes.REGISTRATION;
        // Generate payment reference
        const reference = (0, generateReference_1.generateReference)();
        const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || '';
        console.log('Flutterwave Secret Key loaded:', FLUTTERWAVE_SECRET_KEY ? 'Yes (masked)' : 'No');
        console.log('Key prefix:', FLUTTERWAVE_SECRET_KEY.substring(0, 15) + '...');
        const BACKEND_URL = process.env.BACKEND_URL || 'https://cre-8-backend.vercel.app';
        const FRONTEND_URL = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
        const payload = {
            tx_ref: reference,
            amount: amount,
            currency: 'NGN',
            // redirect_url: `${BACKEND_URL}/api/payments/flutterwave-callback`,
            redirect_url: `${BACKEND_URL}/api/payments/flutterwave-callback`,
            customer: {
                email: email,
            },
            meta: {
                original_email: email, // Store real email to avoid Flutterwave masking
                referralCode: referralCode || undefined,
            },
            customizations: {
                title: 'FUNTECH Creative Challenge Registration',
                description: `Registration Fee${discount > 0 ? ' (with voucher discount)' : ''}`,
                logo: `${FRONTEND_URL}/logo.png`,
            },
            payment_options: 'card, banktransfer, ussd',
        };
        // Call Flutterwave API to initialize transaction
        console.log('Calling Flutterwave API with payload:', payload);
        const response = await axios_1.default.post('https://api.flutterwave.com/v3/payments', payload, {
            headers: {
                'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Flutterwave API response:', response.data);
        // Return the payment link to the frontend
        return res.status(200).json({
            success: true,
            message: 'Payment initialized successfully',
            data: {
                paymentLink: response.data.data.link,
                reference: reference,
                tx_ref: response.data.data.tx_ref
            }
        });
    }
    catch (error) {
        console.error('Error initiating Flutterwave payment:', error.response?.data || error.message);
        return res.status(500).json({
            success: false,
            message: error.response?.data?.message || 'Failed to initiate payment with Flutterwave'
        });
    }
};
exports.initiateFlutterwaveRegistrationPayment = initiateFlutterwaveRegistrationPayment;
// Handle Flutterwave callback
const handleFlutterwaveCallback = async (req, res) => {
    try {
        const { transaction_id, tx_ref, status } = req.query;
        if (!transaction_id && !tx_ref) {
            return res.status(400).json({ message: 'Transaction ID or Reference is required' });
        }
        if (status === 'cancelled') {
            const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
            return res.redirect(`${frontendUrl}/register?payment=cancelled`);
        }
        // Verify payment with Flutterwave
        const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || '';
        const transactionId = transaction_id;
        const response = await axios_1.default.get(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
            headers: {
                'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
            }
        });
        const flutterwaveData = response.data;
        if (flutterwaveData.status !== 'success') {
            throw new Error(flutterwaveData.message || 'Failed to verify payment');
        }
        if (flutterwaveData.data.status !== 'successful') {
            const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
            return res.redirect(`${frontendUrl}/register?payment=failed`);
        }
        // Get email from payment data - use original from meta if available (Flutterwave masks emails in test mode)
        const maskedEmail = flutterwaveData.data.customer.email;
        const originalEmail = flutterwaveData.data.meta?.original_email || maskedEmail;
        const email = originalEmail;
        const reference = flutterwaveData.data.tx_ref;
        console.log('Flutterwave callback - Masked email:', maskedEmail);
        console.log('Flutterwave callback - Using original email:', email);
        // Find or create user and mark as verified
        let user = await User_1.default.findOne({ email });
        if (!user) {
            // Create a placeholder user marked as verified
            user = new User_1.default({
                email,
                name: email.split('@')[0],
                isVerified: true,
                referralCode: flutterwaveData.data.meta?.referralCode,
                role: 'creative',
            });
            await user.save();
        }
        else {
            user.isVerified = true;
            // Store referral code if not already set
            if (!user.referralCode && flutterwaveData.data.meta?.referralCode) {
                user.referralCode = flutterwaveData.data.meta?.referralCode;
            }
            await user.save();
        }
        console.log('User marked as verified after Flutterwave payment:', email);
        // Send payment confirmation email
        try {
            const amount = flutterwaveData.data.amount || paystack_1.paymentTypes.REGISTRATION;
            await (0, sendEmail_1.sendEmail)(email, 'Payment Confirmation - FUNTECH Creative Challenge', sendEmail_1.emailTemplates.paymentConfirmation(email, String(reference), amount));
            console.log('Payment confirmation email sent to:', email);
        }
        catch (emailError) {
            console.error('Failed to send payment confirmation email:', emailError);
        }
        // Redirect directly to register page with verified status
        const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
        const redirectUrl = `${frontendUrl}/register?payment=success&email=${encodeURIComponent(email)}&ref=${encodeURIComponent(String(reference))}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('Flutterwave payment callback error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
        res.redirect(`${frontendUrl}/register?payment=error&message=${encodeURIComponent(error instanceof Error ? error.message : 'Unknown error')}`);
    }
};
exports.handleFlutterwaveCallback = handleFlutterwaveCallback;
// Verify email after clicking link from email
const verifyEmail = async (req, res) => {
    try {
        const { token, email } = req.query;
        if (!token || !email) {
            const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
            return res.redirect(`${frontendUrl}/register?error=Invalid verification link`);
        }
        // Hash the token from the URL
        const tokenHash = crypto_1.default.createHash('sha256').update(String(token)).digest('hex');
        // Find user with matching token and email
        const user = await User_1.default.findOne({
            email: String(email),
            verificationToken: tokenHash,
            verificationExpires: { $gt: new Date() },
        });
        if (!user) {
            const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
            return res.redirect(`${frontendUrl}/register?error=Verification link expired or invalid`);
        }
        // Mark user as verified
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationExpires = undefined;
        await user.save();
        console.log('Email verified for user:', email);
        // Redirect to register page with verified status
        const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
        const redirectUrl = `${frontendUrl}/register?verified=true&email=${encodeURIComponent(String(email))}`;
        res.redirect(redirectUrl);
    }
    catch (error) {
        console.error('Email verification error:', error);
        const frontendUrl = process.env.FRONTEND_URL || 'https://cre-8-frontend.vercel.app';
        res.redirect(`${frontendUrl}/register?error=Verification failed`);
    }
};
exports.verifyEmail = verifyEmail;
//# sourceMappingURL=paymentInitiationController.js.map