import { Router } from 'express';
import { authenticate } from '../../middlewares/auth';
import {
  getAllLearnings,
  getLearningById,
  getCategories
} from './learningController';

const router = Router();

// Public routes (authentication required)
router.get('/', authenticate, getAllLearnings);
router.get('/categories', authenticate, getCategories);
router.get('/:id', authenticate, getLearningById);

export default router;
