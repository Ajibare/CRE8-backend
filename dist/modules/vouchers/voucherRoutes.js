"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voucherController_1 = require("./voucherController");
const auth_1 = require("../../middlewares/auth");
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// Public routes
router.post('/validate', [
    (0, express_validator_1.body)('code')
        .notEmpty()
        .withMessage('Voucher code is required'),
    (0, express_validator_1.body)('type')
        .optional()
        .isIn(['REGISTRATION', 'VOTE', 'PREMIUM'])
        .withMessage('Invalid voucher type')
], voucherController_1.validateVoucher);
router.post('/apply-registration', [
    (0, express_validator_1.body)('voucherCode')
        .notEmpty()
        .withMessage('Voucher code is required'),
    (0, express_validator_1.body)('userData')
        .notEmpty()
        .withMessage('User data is required')
], voucherController_1.applyVoucherToRegistration);
// Protected routes
router.post('/complete-registration', [
    (0, express_validator_1.body)('voucherCode')
        .notEmpty()
        .withMessage('Voucher code is required'),
    (0, express_validator_1.body)('userData')
        .notEmpty()
        .withMessage('User data is required'),
    (0, express_validator_1.body)('paymentReference')
        .notEmpty()
        .withMessage('Payment reference is required')
], voucherController_1.completeRegistrationWithVoucher);
// Admin routes
router.post('/create', auth_1.authenticate, [
    (0, express_validator_1.body)('discount')
        .isNumeric()
        .withMessage('Discount must be a number')
        .custom((value) => value > 0)
        .withMessage('Discount must be greater than 0'),
    (0, express_validator_1.body)('type')
        .optional()
        .isIn(['REGISTRATION', 'VOTE', 'PREMIUM'])
        .withMessage('Invalid voucher type'),
    (0, express_validator_1.body)('expiryDays')
        .optional()
        .isNumeric()
        .withMessage('Expiry days must be a number')
        .custom((value) => value > 0)
        .withMessage('Expiry days must be greater than 0')
], voucherController_1.createVoucher);
router.get('/all', auth_1.authenticate, voucherController_1.getAllVouchers);
exports.default = router;
//# sourceMappingURL=voucherRoutes.js.map