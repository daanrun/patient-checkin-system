const express = require('express');
const { body, validationResult } = require('express-validator');
const CheckInCompletion = require('../models/CheckInCompletion');
const Patient = require('../models/Patient');
const InputSanitizer = require('../utils/sanitization');
const ErrorHandler = require('../middleware/errorHandler');

const router = express.Router();

// Validation rules for completion
const completionValidation = [
  body('patientId')
    .isInt({ min: 1 })
    .withMessage('Valid patient ID is required'),
  
  body('estimatedWaitTime')
    .optional()
    .isInt({ min: 0, max: 180 })
    .withMessage('Estimated wait time must be between 0 and 180 minutes')
];

// POST /api/completion - Mark check-in as complete
router.post('/', completionValidation, ErrorHandler.asyncHandler(async (req, res) => {
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
    patientId: { type: 'number', options: { min: 1, isInteger: true } },
    estimatedWaitTime: { type: 'number', options: { min: 0, max: 180, isInteger: true } }
  });

  const { patientId, estimatedWaitTime = 20 } = sanitizedData;

  // Additional validation after sanitization
  if (!patientId || patientId < 1) {
    return res.status(400).json({
      error: 'Invalid patient ID',
      message: 'Patient ID must be a positive integer',
      code: 'INVALID_PATIENT_ID'
    });
  }

  // Check if patient exists
  const patient = await Patient.getById(patientId);
  if (!patient) {
    return res.status(404).json({
      error: 'Patient not found',
      code: 'PATIENT_NOT_FOUND'
    });
  }

  // Check if completion already exists
  const existingCompletion = await CheckInCompletion.getByPatientId(patientId);
  if (existingCompletion) {
    return res.status(400).json({
      error: 'Check-in already completed for this patient',
      code: 'ALREADY_COMPLETED'
    });
  }

  // Create completion record
  const completion = await CheckInCompletion.create({
    patient_id: patientId,
    estimated_wait_time: estimatedWaitTime
  });

  // Send email confirmation (console log for now as per requirements)
  console.log('=== EMAIL CONFIRMATION ===');
  console.log(`To: ${patient.email}`);
  console.log(`Subject: Check-in Complete - ${patient.first_name} ${patient.last_name}`);
  console.log(`Dear ${patient.first_name},`);
  console.log('');
  console.log('Your appointment check-in has been completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log(`- Patient: ${patient.first_name} ${patient.last_name}`);
  console.log(`- Check-in completed at: ${new Date().toLocaleString()}`);
  console.log(`- Estimated wait time: ${estimatedWaitTime} minutes`);
  console.log('');
  console.log('Please have a seat in the waiting area. You will be called when it\'s time for your appointment.');
  console.log('');
  console.log('If you have any questions, please speak with the front desk staff.');
  console.log('');
  console.log('Thank you for choosing our healthcare facility.');
  console.log('========================');

  // Mark email as sent
  await CheckInCompletion.markEmailSent(patientId);

  // Log successful completion
  console.log(`Check-in completed for patient ${patientId} from IP ${req.ip}`);

  res.status(201).json({
    message: 'Check-in completed successfully',
    data: {
      completion,
      patient: {
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        email: patient.email
      },
      estimatedWaitTime
    }
  });
}));

// GET /api/completion/:patientId - Get completion status
router.get('/:patientId', ErrorHandler.asyncHandler(async (req, res) => {
  const patientId = InputSanitizer.sanitizeNumber(req.params.patientId, { min: 1, isInteger: true });
  
  if (!patientId) {
    return res.status(400).json({
      error: 'Invalid patient ID',
      message: 'Patient ID must be a positive integer',
      code: 'INVALID_PATIENT_ID'
    });
  }

  const completion = await CheckInCompletion.getByPatientId(patientId);
  
  if (!completion) {
    return res.status(404).json({
      error: 'Check-in completion not found for this patient',
      code: 'NOT_FOUND'
    });
  }

  res.json({
    message: 'Completion status retrieved successfully',
    data: completion
  });
}));

module.exports = router;