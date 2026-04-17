"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const referralStatsController_1 = require("./referralStatsController");
const router = (0, express_1.Router)();
// Get referral statistics
router.get('/statistics', referralStatsController_1.getReferralStatistics);
// Export referral data as CSV
router.get('/export', referralStatsController_1.exportReferralData);
// Validate referral code (optional - just checks if it's valid)
router.post('/validate', (req, res) => {
    const { code } = req.body;
    const REFERRAL_CODES = [
        'CRF045', 'CRF067', 'CRF089', 'CRF123', 'CRF156',
        'CRF178', 'CRF234', 'CRF267', 'CRF289', 'CRF345',
        'CRF378', 'CRF456', 'CRF489', 'CRF567', 'CRF589',
        'CRF678', 'CRF789', 'CRF890', 'CRF901', 'CRF999'
    ];
    const isValid = REFERRAL_CODES.includes(code?.toUpperCase());
    res.json({
        valid: isValid,
        referrer: isValid ? `Marketer ${code?.toUpperCase()}` : undefined,
        message: isValid ? 'Valid referral code' : 'Invalid referral code'
    });
});
exports.default = router;
//# sourceMappingURL=referralRoutes.js.map