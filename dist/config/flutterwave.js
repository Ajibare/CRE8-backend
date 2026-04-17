"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.flutterwaveDefaults = exports.voucherConfig = exports.paymentTypes = exports.votingBundles = exports.flutterwaveConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.flutterwaveConfig = {
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
    encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || '',
    baseUrl: 'https://api.flutterwave.com/v3',
    webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET || '',
};
// Payment bundles for voting - flat rate of #100 per vote
exports.votingBundles = {
    single: { votes: 1, price: 100 },
    bundle_5: { votes: 5, price: 500 }, // 5 votes × #100
    bundle_10: { votes: 10, price: 1000 }, // 10 votes × #100
    bundle_25: { votes: 25, price: 2500 }, // 25 votes × #100
};
exports.paymentTypes = {
    REGISTRATION: 2000,
    REGISTRATION_WITH_VOUCHER: 1750, // #250 discount with voucher
    VOTE_SINGLE: 100,
    PREMIUM_ACCESS: 1000,
};
// Voucher configuration
exports.voucherConfig = {
    discount: 250, // #250 discount
    prefix: 'FUNTECH-2026',
    expiryDays: 30, // Voucher expires after 30 days
};
// Flutterwave currency and country
exports.flutterwaveDefaults = {
    currency: 'NGN',
    country: 'NG',
    paymentOptions: 'card, banktransfer, ussd, barter, payattitude',
    redirectUrl: (process.env.BACKEND_URL || 'https://cre-8-backend.vercel.app') + '/api/payments/callback',
};
//# sourceMappingURL=flutterwave.js.map