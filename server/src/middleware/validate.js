// src/middleware/validate.js
import { body, validationResult } from 'express-validator';

// ── Run validation and return errors ─────────────────────────────────────────
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// ── Auth rules ────────────────────────────────────────────────────────────────
export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  body('phone').optional({ checkFalsy: true })
    .matches(/^(\+?254|0)[17]\d{8}$/).withMessage('Enter a valid Kenyan phone number'),
];

export const loginRules = [
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ── Car rules ─────────────────────────────────────────────────────────────────
export const carRules = [
  body('make').trim().notEmpty().withMessage('Make is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Enter a valid year'),
  body('price').isFloat({ min: 1 }).withMessage('Enter a valid price'),
  body('mileage').isInt({ min: 0 }).withMessage('Enter a valid mileage'),
];

// ── Order rules ───────────────────────────────────────────────────────────────
export const orderRules = [
  body('carId').notEmpty().withMessage('Car ID is required'),
  body('type').isIn(['INQUIRY', 'DEPOSIT', 'PURCHASE']).withMessage('Invalid order type'),
];

// ── Dealer rules ──────────────────────────────────────────────────────────────
export const dealerRegisterRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Min 8 characters')
    .matches(/[A-Z]/).withMessage('Include an uppercase letter')
    .matches(/[0-9]/).withMessage('Include a number'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
];