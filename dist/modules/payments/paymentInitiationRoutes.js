"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentInitiationController_1 = require("./paymentInitiationController");
// import { body } from 'express-validator';
const router = (0, express_1.Router)();
// Initiate registration payment (Paystack)
router.post('/initiate-registration', paymentInitiationController_1.initiateRegistrationPayment);
// Initiate registration payment (Flutterwave)
router.post('/initiate-flutterwave-registration', paymentInitiationController_1.initiateFlutterwaveRegistrationPayment);
// Handle Paystack callback
router.get('/callback', paymentInitiationController_1.handlePaystackCallback);
// Handle Flutterwave callback
router.get('/flutterwave-callback', paymentInitiationController_1.handleFlutterwaveCallback);
// Verify email from payment link
router.get('/verify-email', paymentInitiationController_1.verifyEmail);
exports.default = router;
//# sourceMappingURL=paymentInitiationRoutes.js.map