"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteValidation = exports.submissionValidation = exports.loginValidation = exports.registerValidation = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array(),
        });
    }
    next();
};
exports.validateRequest = validateRequest;
exports.registerValidation = [
    (0, express_validator_1.body)('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('phone')
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('category')
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
        'Advertising',
        'Art & Craft',
        'Business & Creative Strategist',
    ])
        .withMessage('Please select a valid category'),
];
exports.loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .exists()
        .withMessage('Password is required'),
];
exports.submissionValidation = [
    (0, express_validator_1.body)('title')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Title must be between 1 and 100 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    (0, express_validator_1.body)('week')
        .isInt({ min: 1 })
        .withMessage('Week must be a positive integer'),
];
exports.voteValidation = [
    (0, express_validator_1.body)('contestantId')
        .isMongoId()
        .withMessage('Valid contestant ID is required'),
    (0, express_validator_1.body)('votes')
        .isInt({ min: 1, max: 25 })
        .withMessage('Votes must be between 1 and 25'),
    (0, express_validator_1.body)('bundleType')
        .isIn(['single', 'bundle_5', 'bundle_10', 'bundle_25'])
        .withMessage('Invalid bundle type'),
];
//# sourceMappingURL=validation.js.map