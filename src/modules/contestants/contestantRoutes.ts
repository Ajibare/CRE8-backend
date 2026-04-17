import express from 'express';
import { getContestants, getContestantById } from './contestantController';

const router = express.Router();

// Get all contestants (leaderboard)
router.get('/', getContestants);

// Get single contestant details
router.get('/:id', getContestantById);

export default router;
