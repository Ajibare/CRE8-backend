import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  body('category')
    .isIn([
      'Design',
      'Video Editing',
      'Music',
      'Content Creation',
      'Photography',
      'Writing',
      'UI/UX Design',
      'Web Design',
      'Illustration',
      'Digital Art',
      'Fashion Design',
      'Creative Direction',
      'Advertising'
    ])
    .withMessage('Please select a valid category'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .exists()
    .withMessage('Password is required'),
];

export const submissionValidation = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('week')
    .isInt({ min: 1 })
    .withMessage('Week must be a positive integer'),
];

export const voteValidation = [
  body('contestantId')
    .isMongoId()
    .withMessage('Valid contestant ID is required'),
  body('votes')
    .isInt({ min: 1, max: 25 })
    .withMessage('Votes must be between 1 and 25'),
  body('bundleType')
    .isIn(['single', 'bundle_5', 'bundle_10', 'bundle_25'])
    .withMessage('Invalid bundle type'),
];
