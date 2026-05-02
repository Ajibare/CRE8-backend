import { Request, Response } from 'express';
import Learning from '../../database/models/Learning';

// Get all learning resources
export const getAllLearnings = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    let query: any = { isActive: true };
    if (category) {
      query.category = category;
    }

    const learnings = await Learning.find(query)
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      learnings
    });
  } catch (error: any) {
    console.error('Get learnings error:', error);
    res.status(500).json({
      message: 'Failed to fetch learning resources',
      error: error.message
    });
  }
};

// Get single learning resource
export const getLearningById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const learning = await Learning.findById(id);
    
    if (!learning) {
      return res.status(404).json({ message: 'Learning resource not found' });
    }

    res.json({
      success: true,
      learning
    });
  } catch (error: any) {
    console.error('Get learning error:', error);
    res.status(500).json({
      message: 'Failed to fetch learning resource',
      error: error.message
    });
  }
};

// Get categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Learning.distinct('category', { isActive: true });
    res.json({
      success: true,
      categories
    });
  } catch (error: any) {
    console.error('Get categories error:', error);
    res.status(500).json({
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};
