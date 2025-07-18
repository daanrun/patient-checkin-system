const express = require('express');
const { body, validationResult } = require('express-validator');
const ClinicalForm = require('../models/ClinicalForm');
const InputSanitizer = require('../utils/sanitization');
const ErrorHandler = require('../middleware/errorHandler');

const router = express.Router();

// Validation rules for clinical forms data
const clinicalFormsValidation = [
  body('medicalHistory')
    .trim()
    .notEmpty()
    .withMessage('Medical history is required')
    .isLength({ min: 1, max: 2000 })
    .withMessage('Medical history must be between 1 and 2000 characters'),
  
  body('currentMedications')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Current medications must be less than 2000 characters'),
  
  body('allergies')
    .trim()
    .notEmpty()
    .withMessage('Allergies information is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Allergies information must be between 1 and 1000 characters'),
  
  body('symptoms')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Symptoms description must be less than 2000 characters'),
  
  body('patientId')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required')
];

// POST /api/clinical-forms - Create clinical forms record
router.post('/', clinicalFormsValidation, ErrorHandler.asyncHandler(async (req, res) => {
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
    medicalHistory: { type: 'string' },
    currentMedications: { type: 'string' },
    allergies: { type: 'string' },
    symptoms: { type: 'string' },
    patientId: { type: 'number', options: { min: 1, isInteger: true } }
  });

  const { medicalHistory, currentMedications, allergies, symptoms, patientId } = sanitizedData;

  // Additional validation after sanitization
  if (!patientId || patientId < 1) {
    return res.status(400).json({
      error: 'Invalid patient ID',
      message: 'Patient ID must be a positive integer',
      code: 'INVALID_PATIENT_ID'
    });
  }

  // Validate required fields after sanitization
  const requiredFields = ['medicalHistory', 'allergies'];
  const missing = InputSanitizer.validateRequired(sanitizedData, requiredFields);
  
  if (missing.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: `The following fields are required: ${missing.join(', ')}`,
      code: 'MISSING_REQUIRED_FIELDS'
    });
  }

  // Create clinical forms record with sanitized data
  const clinicalData = {
    patient_id: patientId,
    medical_history: medicalHistory,
    current_medications: currentMedications || null,
    allergies: allergies,
    symptoms: symptoms || null
  };

  const clinicalForm = await ClinicalForm.create(clinicalData);

  // Log successful submission
  console.log(`Clinical forms created for patient ${patientId} from IP ${req.ip}`);

  res.status(201).json({
    message: 'Clinical forms saved successfully',
    data: clinicalForm
  });
}));

// GET /api/clinical-forms/:patientId - Get clinical forms by patient ID
router.get('/:patientId', ErrorHandler.asyncHandler(async (req, res) => {
  const patientId = InputSanitizer.sanitizeNumber(req.params.patientId, { min: 1, isInteger: true });
  
  if (!patientId) {
    return res.status(400).json({
      error: 'Invalid patient ID',
      message: 'Patient ID must be a positive integer',
      code: 'INVALID_PATIENT_ID'
    });
  }

  const clinicalForm = await ClinicalForm.getByPatientId(patientId);
  
  if (!clinicalForm) {
    return res.status(404).json({
      error: 'Clinical forms not found for this patient',
      code: 'NOT_FOUND'
    });
  }

  res.json({
    message: 'Clinical forms retrieved successfully',
    data: clinicalForm
  });
}));

module.exports = router;