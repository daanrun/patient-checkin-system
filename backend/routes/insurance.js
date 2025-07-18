const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Insurance = require('../models/Insurance');
const InputSanitizer = require('../utils/sanitization');
const ErrorHandler = require('../middleware/errorHandler');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'insurance-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for insurance card images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and PDF files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 2 // Maximum 2 files (front and back of card)
  },
  fileFilter: fileFilter
});

// Validation rules for insurance data
const insuranceValidation = [
  body('provider')
    .trim()
    .notEmpty()
    .withMessage('Insurance provider is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Provider name must be between 2 and 100 characters'),
  
  body('policyNumber')
    .trim()
    .notEmpty()
    .withMessage('Policy number is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Policy number must be between 1 and 50 characters'),
  
  body('groupNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Group number must be less than 50 characters'),
  
  body('subscriberName')
    .trim()
    .notEmpty()
    .withMessage('Subscriber name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Subscriber name must be between 2 and 100 characters'),
  
  body('patientId')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required')
];

// POST /api/insurance - Create insurance record
router.post('/', upload.array('cardImages', 2), insuranceValidation, ErrorHandler.asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array(),
      code: 'VALIDATION_ERROR'
    });
  }

  // Sanitize input data
  const sanitizedData = InputSanitizer.sanitizeObject(req.body, {
    provider: { type: 'string' },
    policyNumber: { type: 'string' },
    groupNumber: { type: 'string' },
    subscriberName: { type: 'string' },
    patientId: { type: 'number', options: { min: 1, isInteger: true } }
  });

  const { provider, policyNumber, groupNumber, subscriberName, patientId } = sanitizedData;
  
  // Additional validation after sanitization
  if (!patientId || patientId < 1) {
    return res.status(400).json({
      error: 'Invalid patient ID',
      message: 'Patient ID must be a positive integer',
      code: 'INVALID_PATIENT_ID'
    });
  }
  
  // Handle uploaded files with security checks
  let cardImagePath = null;
  if (req.files && req.files.length > 0) {
    // Validate file types and sizes
    for (const file of req.files) {
      if (file.size > 5 * 1024 * 1024) {
        return res.status(413).json({
          error: 'File too large',
          message: 'Each file must be less than 5MB',
          code: 'FILE_TOO_LARGE'
        });
      }
    }
    
    // Store file paths as JSON array
    cardImagePath = JSON.stringify(req.files.map(file => file.filename));
  }

  // Create insurance record with sanitized data
  const insuranceData = {
    patient_id: patientId,
    provider: provider || '',
    policy_number: policyNumber || '',
    group_number: groupNumber || null,
    subscriber_name: subscriberName || '',
    card_image_path: cardImagePath
  };

  const insurance = await Insurance.create(insuranceData);

  // Log successful submission
  console.log(`Insurance record created for patient ${patientId} from IP ${req.ip}`);

  res.status(201).json({
    message: 'Insurance information saved successfully',
    data: insurance
  });
}));

module.exports = router;