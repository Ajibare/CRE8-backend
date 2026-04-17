import { Router } from 'express';
import { 
  validateVoucher, 
  createVoucher, 
  applyVoucherToRegistration, 
  completeRegistrationWithVoucher,
  getAllVouchers 
} from './voucherController';
import { authenticate } from '../../middlewares/auth';
import { body } from 'express-validator';

const router = Router();

// Public routes
router.post('/validate', [
  body('code')
    .notEmpty()
    .withMessage('Voucher code is required'),
  body('type')
    .optional()
    .isIn(['REGISTRATION', 'VOTE', 'PREMIUM'])
    .withMessage('Invalid voucher type')
], validateVoucher);

router.post('/apply-registration', [
  body('voucherCode')
    .notEmpty()
    .withMessage('Voucher code is required'),
  body('userData')
    .notEmpty()
    .withMessage('User data is required')
], applyVoucherToRegistration);

// Protected routes
router.post('/complete-registration', [
  body('voucherCode')
    .notEmpty()
    .withMessage('Voucher code is required'),
  body('userData')
    .notEmpty()
    .withMessage('User data is required'),
  body('paymentReference')
    .notEmpty()
    .withMessage('Payment reference is required')
], completeRegistrationWithVoucher);

// Admin routes
router.post('/create', authenticate, [
  body('discount')
    .isNumeric()
    .withMessage('Discount must be a number')
    .custom((value) => value > 0)
    .withMessage('Discount must be greater than 0'),
  body('type')
    .optional()
    .isIn(['REGISTRATION', 'VOTE', 'PREMIUM'])
    .withMessage('Invalid voucher type'),
  body('expiryDays')
    .optional()
    .isNumeric()
    .withMessage('Expiry days must be a number')
    .custom((value) => value > 0)
    .withMessage('Expiry days must be greater than 0')
], createVoucher);

router.get('/all', authenticate, getAllVouchers);

export default router;
