const express = require('express');
const Patient = require('../models/Patient');
const Insurance = require('../models/Insurance');
const ClinicalForm = require('../models/ClinicalForm');
const CheckInCompletion = require('../models/CheckInCompletion');
const InputSanitizer = require('../utils/sanitization');
const ErrorHandler = require('../middleware/errorHandler');

const router = express.Router();

// GET /api/admin/submissions - Get all form submissions with search and filtering
router.get('/submissions', ErrorHandler.asyncHandler(async (req, res) => {
  // Sanitize query parameters
  const sanitizedQuery = InputSanitizer.sanitizeObject(req.query, {
    search: { type: 'string' },
    dateFrom: { type: 'date' },
    dateTo: { type: 'date' },
    status: { type: 'string' }
  });

  const { search, dateFrom, dateTo, status } = sanitizedQuery;

  // Validate status parameter
  if (status && !['completed', 'incomplete'].includes(status)) {
    return res.status(400).json({
      error: 'Invalid status parameter',
      message: 'Status must be either "completed" or "incomplete"',
      code: 'INVALID_STATUS'
    });
  }

  // Base query to get all submissions with patient info
  let sql = `
    SELECT 
      p.id,
      p.first_name,
      p.last_name,
      p.email,
      p.phone,
      p.created_at as submitted_at,
      CASE 
        WHEN cc.id IS NOT NULL THEN 'completed'
        ELSE 'incomplete'
      END as status,
      cc.completed_at,
      cc.estimated_wait_time
    FROM patients p
    LEFT JOIN check_in_completions cc ON p.id = cc.patient_id
  `;

  const params = [];
  const conditions = [];

  // Add search filter for patient name (sanitized)
  if (search && search.trim()) {
    conditions.push(`(p.first_name LIKE ? OR p.last_name LIKE ? OR (p.first_name || ' ' || p.last_name) LIKE ?)`);
    const searchTerm = `%${search.trim()}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  // Add date range filter (sanitized)
  if (dateFrom) {
    conditions.push(`DATE(p.created_at) >= DATE(?)`);
    params.push(dateFrom);
  }

  if (dateTo) {
    conditions.push(`DATE(p.created_at) <= DATE(?)`);
    params.push(dateTo);
  }

  // Add status filter
  if (status === 'completed') {
    conditions.push(`cc.id IS NOT NULL`);
  } else if (status === 'incomplete') {
    conditions.push(`cc.id IS NULL`);
  }

  // Add WHERE clause if there are conditions
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }

  // Order by most recent first
  sql += ` ORDER BY p.created_at DESC`;

  // Execute query using Promise wrapper
  const submissions = await new Promise((resolve, reject) => {
    const { db } = require('../database/db');
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });

  // Format the response
  const formattedSubmissions = submissions.map(submission => ({
    id: submission.id,
    patientName: `${submission.first_name} ${submission.last_name}`,
    email: submission.email,
    phone: submission.phone,
    submittedAt: submission.submitted_at,
    status: submission.status,
    completedAt: submission.completed_at,
    estimatedWaitTime: submission.estimated_wait_time
  }));

  // Log admin access
  console.log(`Admin submissions accessed from IP ${req.ip} - ${formattedSubmissions.length} records returned`);

  res.json({
    message: 'Submissions retrieved successfully',
    data: formattedSubmissions,
    total: formattedSubmissions.length
  });
}));

// GET /api/admin/submissions/:id - Get detailed submission by ID
router.get('/submissions/:id', ErrorHandler.asyncHandler(async (req, res) => {
  const id = InputSanitizer.sanitizeNumber(req.params.id, { min: 1, isInteger: true });

  // Validate ID parameter
  if (!id) {
    return res.status(400).json({
      error: 'Invalid submission ID',
      message: 'Submission ID must be a positive integer',
      code: 'INVALID_SUBMISSION_ID'
    });
  }

  // Get patient information
  const patient = await new Promise((resolve, reject) => {
    const { db } = require('../database/db');
    db.get('SELECT * FROM patients WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

  if (!patient) {
    return res.status(404).json({
      error: 'Submission not found',
      message: 'No submission found with the provided ID',
      code: 'SUBMISSION_NOT_FOUND'
    });
  }

  // Get insurance information
  const insurance = await new Promise((resolve, reject) => {
    const { db } = require('../database/db');
    db.get('SELECT * FROM insurance WHERE patient_id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

  // Get clinical forms information
  const clinicalForms = await new Promise((resolve, reject) => {
    const { db } = require('../database/db');
    db.get('SELECT * FROM clinical_forms WHERE patient_id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

  // Get completion information
  const completion = await new Promise((resolve, reject) => {
    const { db } = require('../database/db');
    db.get('SELECT * FROM check_in_completions WHERE patient_id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });

  // Format the detailed response
  const detailedSubmission = {
    id: patient.id,
    patient: {
      firstName: patient.first_name,
      lastName: patient.last_name,
      dateOfBirth: patient.date_of_birth,
      address: patient.address,
      phone: patient.phone,
      email: patient.email,
      emergencyContact: patient.emergency_contact,
      emergencyPhone: patient.emergency_phone,
      createdAt: patient.created_at
    },
    insurance: insurance ? {
      provider: insurance.provider,
      policyNumber: insurance.policy_number,
      groupNumber: insurance.group_number,
      subscriberName: insurance.subscriber_name,
      subscriberDob: insurance.subscriber_dob,
      subscriberRelation: insurance.subscriber_relation,
      cardImagePath: insurance.card_image_path,
      createdAt: insurance.created_at
    } : null,
    clinicalForms: clinicalForms ? {
      medicalHistory: clinicalForms.medical_history,
      currentMedications: clinicalForms.current_medications,
      allergies: clinicalForms.allergies,
      symptoms: clinicalForms.symptoms,
      painLevel: clinicalForms.pain_level,
      additionalConcerns: clinicalForms.additional_concerns,
      createdAt: clinicalForms.created_at
    } : null,
    completion: completion ? {
      completedAt: completion.completed_at,
      estimatedWaitTime: completion.estimated_wait_time,
      confirmationSent: completion.confirmation_sent
    } : null,
    status: completion ? 'completed' : 'incomplete'
  };

  // Log admin detail access
  console.log(`Admin detail view accessed for patient ${id} from IP ${req.ip}`);

  res.json({
    message: 'Submission details retrieved successfully',
    data: detailedSubmission
  });
}));

module.exports = router;