export declare const flutterwaveConfig: {
    secretKey: string;
    publicKey: string;
    encryptionKey: string;
    baseUrl: string;
    webhookSecret: string;
};
export declare const verifyFlutterwavePayment: (transactionId: string) => Promise<{
    status: string;
    transaction_id?: string;
    id?: string;
}>;
export declare const getTransactionDetails: (transactionId: string) => Promise<unknown>;
export declare const createPaymentLink: (paymentData: unknown) => Promise<unknown>;
declare const _default: {
    flutterwaveConfig: {
        secretKey: string;
        publicKey: string;
        encryptionKey: string;
        baseUrl: string;
        webhookSecret: string;
    };
    verifyFlutterwavePayment: (transactionId: string) => Promise<{
        status: string;
        transaction_id?: string;
        id?: string;
    }>;
    getTransactionDetails: (transactionId: string) => Promise<unknown>;
    createPaymentLink: (paymentData: unknown) => Promise<unknown>;
};
export default _default;
//# sourceMappingURL=flutterwaveService.d.ts.map