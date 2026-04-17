import { Router } from 'express';
import {
  initiatePayment,
  verifyPayment,
  getPaymentHistory,
  initiateVotingPayment,
  handlePaystackWebhook,
} from './paymentController';
import { authenticate } from '../../middlewares/auth';

const router = Router();

router.post('/initiate', authenticate, initiatePayment);
router.get('/verify/:reference', verifyPayment);
router.get('/history', authenticate, getPaymentHistory);
router.post('/vote', authenticate, initiateVotingPayment);
router.post('/webhook/paystack', handlePaystackWebhook);

export default router;
