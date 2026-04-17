import dotenv from 'dotenv';

dotenv.config();

export const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY || '',
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || '',
  baseUrl: 'https://api.paystack.co',
  webhookSecret: process.env.PAYSTACK_WEBHOOK_SECRET || '',
};

// Payment bundles for voting
export const votingBundles = {
  single: { votes: 1, price: 100 },
  bundle_5: { votes: 5, price: 450 }, // 10% discount
  bundle_10: { votes: 10, price: 800 }, // 20% discount
  bundle_25: { votes: 25, price: 1750 }, // 30% discount
};

export const paymentTypes = {
  REGISTRATION: 2000,
  REGISTRATION_WITH_VOUCHER: 1750, // #250 discount with voucher
  VOTE_SINGLE: 100,
  PREMIUM_ACCESS: 1000,
} as const;

// Voucher configuration
export const voucherConfig = {
  discount: 250, // #250 discount
  prefix: 'FUNTECH-2026',
  expiryDays: 30, // Voucher expires after 30 days
};
