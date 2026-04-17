export declare const paystackConfig: {
    secretKey: string;
    publicKey: string;
    baseUrl: string;
    webhookSecret: string;
};
export declare const votingBundles: {
    single: {
        votes: number;
        price: number;
    };
    bundle_5: {
        votes: number;
        price: number;
    };
    bundle_10: {
        votes: number;
        price: number;
    };
    bundle_25: {
        votes: number;
        price: number;
    };
};
export declare const paymentTypes: {
    readonly REGISTRATION: 2000;
    readonly REGISTRATION_WITH_VOUCHER: 1750;
    readonly VOTE_SINGLE: 100;
    readonly PREMIUM_ACCESS: 1000;
};
export declare const voucherConfig: {
    discount: number;
    prefix: string;
    expiryDays: number;
};
//# sourceMappingURL=paystack.d.ts.map