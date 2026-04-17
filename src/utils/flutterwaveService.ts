import dotenv from 'dotenv';

dotenv.config();

export const flutterwaveConfig = {
  secretKey: process.env.FLUTTERWAVE_SECRET_KEY || '',
  publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY || '',
  encryptionKey: process.env.FLUTTERWAVE_ENCRYPTION_KEY || '',
  baseUrl: process.env.FLUTTERWAVE_BASE_URL || 'https://api.flutterwave.com/v3',
  webhookSecret: process.env.FLUTTERWAVE_WEBHOOK_SECRET || '',
};

// Payment verification
export const verifyFlutterwavePayment = async (transactionId: string): Promise<{ status: string; transaction_id?: string; id?: string }> => {
  try {
    const response = await fetch(`${flutterwaveConfig.baseUrl}/transactions/${transactionId}/verify`, {
      headers: {
        'Authorization': `Bearer ${flutterwaveConfig.secretKey}`,
      },
    });

    const data = await response.json() as { message?: string; data: { status: string; transaction_id?: string; id?: string } };

    if (!response.ok) {
      throw new Error(data.message || 'Failed to verify payment');
    }

    return data.data;
  } catch (error) {
    console.error('Flutterwave verification error:', error);
    throw error;
  }
};

// Get transaction details
export const getTransactionDetails = async (transactionId: string): Promise<unknown> => {
  try {
    const response = await fetch(`${flutterwaveConfig.baseUrl}/transactions/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${flutterwaveConfig.secretKey}`,
      },
    });

    const data = await response.json() as { message?: string; data: unknown };

    if (!response.ok) {
      throw new Error((data as { message?: string }).message || 'Failed to get transaction details');
    }

    return data.data;
  } catch (error) {
    console.error('Flutterwave transaction details error:', error);
    throw error;
  }
};

// Create payment link
export const createPaymentLink = async (paymentData: unknown): Promise<unknown> => {
  try {
    const response = await fetch(`${flutterwaveConfig.baseUrl}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${flutterwaveConfig.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json() as { message?: string; data: unknown };

    if (!response.ok) {
      throw new Error((data as { message?: string }).message || 'Failed to create payment link');
    }

    return data.data;
  } catch (error) {
    console.error('Flutterwave payment link creation error:', error);
    throw error;
  }
};

export default {
  flutterwaveConfig,
  verifyFlutterwavePayment,
  getTransactionDetails,
  createPaymentLink
};
