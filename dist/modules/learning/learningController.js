"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.getLearningById = exports.getAllLearnings = void 0;
const Learning_1 = __importDefault(require("../../database/models/Learning"));
// Get all learning resources
const getAllLearnings = async (req, res) => {
    try {
        const { category } = req.query;
        let query = { isActive: true };
        if (category) {
            query.category = category;
        }
        const learnings = await Learning_1.default.find(query)
            .sort({ order: 1, createdAt: -1 });
        res.json({
            success: true,
            learnings
        });
    }
    catch (error) {
        console.error('Get learnings error:', error);
        res.status(500).json({
            message: 'Failed to fetch learning resources',
            error: error.message
        });
    }
};
exports.getAllLearnings = getAllLearnings;
// Get single learning resource
const getLearningById = async (req, res) => {
    try {
        const { id } = req.params;
        const learning = await Learning_1.default.findById(id);
        if (!learning) {
            return res.status(404).json({ message: 'Learning resource not found' });
        }
        res.json({
            success: true,
            learning
        });
    }
    catch (error) {
        console.error('Get learning error:', error);
        res.status(500).json({
            message: 'Failed to fetch learning resource',
            error: error.message
        });
    }
};
exports.getLearningById = getLearningById;
// Get categories
const getCategories = async (req, res) => {
    try {
        const categories = await Learning_1.default.distinct('category', { isActive: true });
        res.json({
            success: true,
            categories
        });
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};
exports.getCategories = getCategories;
//# sourceMappingURL=learningController.js.map