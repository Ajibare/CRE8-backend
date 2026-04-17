import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { registerAdmin, getAllAdmins, deleteAdmin } from '../modules/auth/adminAuthController';

const router = Router();

// Register new admin (requires authentication as admin OR admin key)
router.post('/register', registerAdmin);

// Get all admins (requires admin authentication)
router.get('/all', authenticate, authorize('admin'), getAllAdmins);

// Delete an admin (requires admin authentication)
router.delete('/:adminId', authenticate, authorize('admin'), deleteAdmin);

export default router;
