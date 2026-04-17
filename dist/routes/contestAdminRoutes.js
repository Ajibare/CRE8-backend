"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const contestPhase_1 = require("../utils/contestPhase");
const contestSelectionService_1 = require("../services/contestSelectionService");
const User_1 = __importDefault(require("../database/models/User"));
const router = (0, express_1.Router)();
// Get current phase info (public)
router.get('/phase', async (req, res) => {
    try {
        const phaseInfo = (0, contestPhase_1.getPhaseInfo)();
        res.json({
            success: true,
            data: phaseInfo
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Admin: Get contest stats
router.get('/stats', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const stats = await (0, contestSelectionService_1.getContestStats)();
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Admin: Select top 100 for contest
router.post('/select-top-100', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const selectedIds = await (0, contestSelectionService_1.selectTop100ForContest)();
        res.json({
            success: true,
            message: `${selectedIds.length} users selected for contest phase`,
            data: { selectedCount: selectedIds.length }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Admin: Select top 10 for grand final
router.post('/select-top-10', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const selectedIds = await (0, contestSelectionService_1.selectTop10ForGrandFinal)();
        res.json({
            success: true,
            message: `${selectedIds.length} users selected for grand final`,
            data: { selectedCount: selectedIds.length }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// Admin: Get selected contestants
router.get('/contestants', auth_1.authenticate, (0, auth_1.authorize)('admin'), async (req, res) => {
    try {
        const contestants = await User_1.default.find({ isSelectedForContest: true })
            .select('name email creativeId contestVotes isGrandFinalist')
            .sort({ contestVotes: -1 });
        res.json({
            success: true,
            data: contestants
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=contestAdminRoutes.js.map