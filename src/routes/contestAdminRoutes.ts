import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth';
import { getCurrentPhase, getPhaseInfo } from '../utils/contestPhase';
import { 
  selectTop100ForContest, 
  selectTop10ForGrandFinal,
  getContestStats 
} from '../services/contestSelectionService';
import User from '../database/models/User';

const router = Router();

// Get current phase info (public)
router.get('/phase', async (req, res) => {
  try {
    const phaseInfo = getPhaseInfo();
    res.json({
      success: true,
      data: phaseInfo
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get contest stats
router.get('/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = await getContestStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Select top 100 for contest
router.post('/select-top-100', authenticate, authorize('admin'), async (req, res) => {
  try {
    const selectedIds = await selectTop100ForContest();
    res.json({
      success: true,
      message: `${selectedIds.length} users selected for contest phase`,
      data: { selectedCount: selectedIds.length }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Select top 10 for grand final
router.post('/select-top-10', authenticate, authorize('admin'), async (req, res) => {
  try {
    const selectedIds = await selectTop10ForGrandFinal();
    res.json({
      success: true,
      message: `${selectedIds.length} users selected for grand final`,
      data: { selectedCount: selectedIds.length }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Get selected contestants
router.get('/contestants', authenticate, authorize('admin'), async (req, res) => {
  try {
    const contestants = await User.find({ isSelectedForContest: true })
      .select('name email creativeId contestVotes isGrandFinalist')
      .sort({ contestVotes: -1 });
    
    res.json({
      success: true,
      data: contestants
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
