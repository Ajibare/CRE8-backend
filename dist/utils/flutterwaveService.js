"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaymentLink = exports.getTransactionDetails = exports.verifyFlutterwavePayment = exports.flutterwaveConfig = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.flutterwaveConfig = {
    secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
    publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
    encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || '',
    baseUrl: process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3',
    webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET || '',
};
// Payment verification
const verifyFlutterwavePayment = async (transactionId) => {
    try {
        const response = await fetch(`${exports.flutterwaveConfig.baseUrl}/transactions/${transactionId}/verify`, {
            headers: {
                'Authorization': `Bearer ${exports.flutterwaveConfig.secretKey}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to verify payment');
        }
        return data.data;
    }
    catch (error) {
        console.error('Flutterwave verification error:', error);
        throw error;
    }
};
exports.verifyFlutterwavePayment = verifyFlutterwavePayment;
// Get transaction details
const getTransactionDetails = async (transactionId) => {
    try {
        const response = await fetch(`${exports.flutterwaveConfig.baseUrl}/transactions/${transactionId}`, {
            headers: {
                'Authorization': `Bearer ${exports.flutterwaveConfig.secretKey}`,
            },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get transaction details');
        }
        return data.data;
    }
    catch (error) {
        console.error('Flutterwave transaction details error:', error);
        throw error;
    }
};
exports.getTransactionDetails = getTransactionDetails;
// Create payment link
const createPaymentLink = async (paymentData) => {
    try {
        const response = await fetch(`${exports.flutterwaveConfig.baseUrl}/payments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${exports.flutterwaveConfig.secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Failed to create payment link');
        }
        return data.data;
    }
    catch (error) {
        console.error('Flutterwave payment link creation error:', error);
        throw error;
    }
};
exports.createPaymentLink = createPaymentLink;
exports.default = {
    flutterwaveConfig: exports.flutterwaveConfig,
    verifyFlutterwavePayment: exports.verifyFlutterwavePayment,
    getTransactionDetails: exports.getTransactionDetails,
    createPaymentLink: exports.createPaymentLink
};
//# sourceMappingURL=flutterwaveService.js.map