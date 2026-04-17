import { Router } from 'express';
import {
  initiateRegistrationPayment,
  handlePaystackCallback,
  verifyEmail,
  initiateFlutterwaveRegistrationPayment,
  handleFlutterwaveCallback
} from './paymentInitiationController';
// import { body } from 'express-validator';

const router = Router();

// Initiate registration payment (Paystack)
router.post('/initiate-registration', initiateRegistrationPayment);

// Initiate registration payment (Flutterwave)
router.post('/initiate-flutterwave-registration', initiateFlutterwaveRegistrationPayment);

// Handle Paystack callback
router.get('/callback', handlePaystackCallback);

// Handle Flutterwave callback
router.get('/flutterwave-callback', handleFlutterwaveCallback);

// Verify email from payment link
router.get('/verify-email', verifyEmail);

export default router;
