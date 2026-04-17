"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("./paymentController");
const auth_1 = require("../../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/initiate', auth_1.authenticate, paymentController_1.initiatePayment);
router.get('/verify/:reference', paymentController_1.verifyPayment);
router.get('/history', auth_1.authenticate, paymentController_1.getPaymentHistory);
router.post('/vote', auth_1.authenticate, paymentController_1.initiateVotingPayment);
router.post('/webhook/paystack', paymentController_1.handlePaystackWebhook);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map