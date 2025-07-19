const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

// In-memory storage for demo (in production, use a cloud database)
let submissions = [];
let nextId = 1;

// Basic middleware for JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enhanced CORS middleware for Netlify Functions
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.status(200).send();
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON format',
      message: 'Please check your request body format'
    });
  }
  
  // Default error response
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    message: status === 500 ? 'An unexpected error occurred' : err.message
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    message: 'Patient Check-in API is running', 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'Netlify Functions'
  });
});

// Insurance endpoint
app.post('/insurance', (req, res) => {
  try {
    const { provider, policyNumber, groupNumber, subscriberName, patientId } = req.body;
    
    if (!provider || !policyNumber || !subscriberName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Provider, policy number, and subscriber name are required'
      });
    }

    const insuranceData = {
      id: nextId++,
      provider,
      policyNumber,
      groupNumber: groupNumber || '',
      subscriberName,
      patientId: patientId || nextId,
      submittedAt: new Date().toISOString()
    };

    submissions.push({
      id: insuranceData.id,
      type: 'insurance',
      data: insuranceData,
      patientId: insuranceData.patientId
    });

    res.status(201).json({
      success: true,
      message: 'Insurance information saved successfully',
      data: insuranceData
    });
  } catch (error) {
    console.error('Insurance submission error:', error);
    res.status(500).json({
      error: 'Failed to save insurance information',
      message: error.message
    });
  }
});

// Clinical forms endpoint
app.post('/clinical-forms', (req, res) => {
  try {
    const { medicalHistory, currentMedications, allergies, symptoms, patientId } = req.body;

    const clinicalData = {
      id: nextId++,
      medicalHistory: medicalHistory || '',
      currentMedications: currentMedications || '',
      allergies: allergies || '',
      symptoms: symptoms || '',
      patientId: patientId || nextId,
      submittedAt: new Date().toISOString()
    };

    submissions.push({
      id: clinicalData.id,
      type: 'clinical',
      data: clinicalData,
      patientId: clinicalData.patientId
    });

    res.status(201).json({
      success: true,
      message: 'Clinical forms saved successfully',
      data: clinicalData
    });
  } catch (error) {
    console.error('Clinical forms submission error:', error);
    res.status(500).json({
      error: 'Failed to save clinical forms',
      message: error.message
    });
  }
});

// Completion endpoint
app.post('/completion', (req, res) => {
  try {
    const { patientId, estimatedWaitTime } = req.body;

    const completionData = {
      id: nextId++,
      patientId: patientId || nextId,
      completedAt: new Date().toISOString(),
      estimatedWaitTime: estimatedWaitTime || 20,
      status: 'completed'
    };

    submissions.push({
      id: completionData.id,
      type: 'completion',
      data: completionData,
      patientId: completionData.patientId
    });

    res.status(201).json({
      success: true,
      message: 'Check-in completed successfully',
      data: completionData
    });
  } catch (error) {
    console.error('Completion submission error:', error);
    res.status(500).json({
      error: 'Failed to complete check-in',
      message: error.message
    });
  }
});

// Admin endpoints
app.get('/admin/submissions', (req, res) => {
  try {
    // Group submissions by patient
    const patientSubmissions = {};
    
    submissions.forEach(submission => {
      const patientId = submission.patientId;
      if (!patientSubmissions[patientId]) {
        patientSubmissions[patientId] = {
          id: patientId,
          patientName: `Patient ${patientId}`,
          email: `patient${patientId}@example.com`,
          phone: `555-000-${String(patientId).padStart(4, '0')}`,
          submittedAt: null,
          completedAt: null,
          status: 'incomplete',
          insurance: null,
          clinicalForms: null
        };
      }
      
      if (submission.type === 'insurance') {
        patientSubmissions[patientId].insurance = submission.data;
        patientSubmissions[patientId].submittedAt = submission.data.submittedAt;
      } else if (submission.type === 'clinical') {
        patientSubmissions[patientId].clinicalForms = submission.data;
      } else if (submission.type === 'completion') {
        patientSubmissions[patientId].completedAt = submission.data.completedAt;
        patientSubmissions[patientId].status = 'completed';
      }
    });

    const result = Object.values(patientSubmissions);
    
    res.json({
      success: true,
      data: result,
      total: result.length
    });
  } catch (error) {
    console.error('Admin submissions error:', error);
    res.status(500).json({
      error: 'Failed to fetch submissions',
      message: error.message
    });
  }
});

app.get('/admin/submissions/:id', (req, res) => {
  try {
    const patientId = parseInt(req.params.id);
    
    // Find all submissions for this patient
    const patientSubmissions = submissions.filter(s => s.patientId === patientId);
    
    if (patientSubmissions.length === 0) {
      return res.status(404).json({
        error: 'Submission not found',
        message: 'No submissions found for this patient ID'
      });
    }

    // Build complete patient record
    const result = {
      id: patientId,
      patientName: `Patient ${patientId}`,
      email: `patient${patientId}@example.com`,
      phone: `555-000-${String(patientId).padStart(4, '0')}`,
      insurance: null,
      clinicalForms: null,
      completion: null
    };

    patientSubmissions.forEach(submission => {
      if (submission.type === 'insurance') {
        result.insurance = submission.data;
      } else if (submission.type === 'clinical') {
        result.clinicalForms = submission.data;
      } else if (submission.type === 'completion') {
        result.completion = submission.data;
      }
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Admin submission detail error:', error);
    res.status(500).json({
      error: 'Failed to fetch submission details',
      message: error.message
    });
  }
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    path: req.originalUrl,
    method: req.method
  });
});

// Wrap the app with serverless
module.exports.handler = serverless(app);