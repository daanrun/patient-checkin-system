const express = require('express');
const Patient = require('../models/Patient');
const router = express.Router();

// Validation helper function
const validatePatientData = (data) => {
  const errors = [];
  const { first_name, last_name, date_of_birth, address, phone, email } = data;

  // Required field validation
  if (!first_name || first_name.trim() === '') {
    errors.push('First name is required');
  }
  
  if (!last_name || last_name.trim() === '') {
    errors.push('Last name is required');
  }
  
  if (!date_of_birth || date_of_birth.trim() === '') {
    errors.push('Date of birth is required');
  }
  
  if (!address || address.trim() === '') {
    errors.push('Address is required');
  }
  
  if (!phone || phone.trim() === '') {
    errors.push('Phone number is required');
  }
  
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  }

  // Email format validation
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Email format is invalid');
  }

  // Phone format validation (basic)
  if (phone && !/^[\d\s\-\(\)\+]+$/.test(phone)) {
    errors.push('Phone number format is invalid');
  }

  // Date format validation (YYYY-MM-DD)
  if (date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth)) {
    errors.push('Date of birth must be in YYYY-MM-DD format');
  }

  return errors;
};

// POST /api/patients - Create new patient with demographic data
router.post('/', async (req, res) => {
  try {
    // Validate input data
    const validationErrors = validatePatientData(req.body);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Please correct the following errors',
        details: validationErrors
      });
    }

    // Extract and sanitize patient data
    const patientData = {
      first_name: req.body.first_name.trim(),
      last_name: req.body.last_name.trim(),
      date_of_birth: req.body.date_of_birth.trim(),
      address: req.body.address.trim(),
      phone: req.body.phone.trim(),
      email: req.body.email.trim().toLowerCase()
    };

    // Create patient in database
    const newPatient = await Patient.create(patientData);
    
    res.status(201).json({
      message: 'Patient demographics saved successfully',
      patient: newPatient
    });

  } catch (error) {
    console.error('Error creating patient:', error);
    
    // Handle database constraint errors
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({
        error: 'Duplicate entry',
        message: 'A patient with this information already exists'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to save patient demographics'
    });
  }
});

module.exports = router;