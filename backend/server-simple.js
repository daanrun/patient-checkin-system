const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 10000;

// In-memory storage for demo purposes
let patients = [];
let insurance = [];
let clinicalForms = [];
let completions = [];

// Helper function to generate UUID
function generateId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Basic middleware for JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://checkinpatient.netlify.app']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Patient Check-in API is running', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Simple medication search endpoint with fallback data
app.get('/api/medications/search', (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({
        error: 'Search term too short',
        message: 'Search term must be at least 2 characters long'
      });
    }

    // Comprehensive medication fallback data
    const medications = [
      { id: 'med_1', displayName: 'Acetaminophen', genericName: 'Acetaminophen', brandNames: ['Tylenol', 'Panadol'] },
      { id: 'med_2', displayName: 'Ibuprofen', genericName: 'Ibuprofen', brandNames: ['Advil', 'Motrin'] },
      { id: 'med_3', displayName: 'Aspirin', genericName: 'Aspirin', brandNames: ['Bayer'] },
      { id: 'med_4', displayName: 'Lisinopril', genericName: 'Lisinopril', brandNames: ['Prinivil', 'Zestril'] },
      { id: 'med_5', displayName: 'Metformin', genericName: 'Metformin', brandNames: ['Glucophage'] },
      { id: 'med_6', displayName: 'Amlodipine', genericName: 'Amlodipine', brandNames: ['Norvasc'] },
      { id: 'med_7', displayName: 'Simvastatin', genericName: 'Simvastatin', brandNames: ['Zocor'] },
      { id: 'med_8', displayName: 'Omeprazole', genericName: 'Omeprazole', brandNames: ['Prilosec'] },
      { id: 'med_9', displayName: 'Levothyroxine', genericName: 'Levothyroxine', brandNames: ['Synthroid'] },
      { id: 'med_10', displayName: 'Atorvastatin', genericName: 'Atorvastatin', brandNames: ['Lipitor'] },
      { id: 'med_11', displayName: 'Metoprolol', genericName: 'Metoprolol', brandNames: ['Lopressor', 'Toprol'] },
      { id: 'med_12', displayName: 'Losartan', genericName: 'Losartan', brandNames: ['Cozaar'] },
      { id: 'med_13', displayName: 'Gabapentin', genericName: 'Gabapentin', brandNames: ['Neurontin'] },
      { id: 'med_14', displayName: 'Sertraline', genericName: 'Sertraline', brandNames: ['Zoloft'] },
      { id: 'med_15', displayName: 'Prednisone', genericName: 'Prednisone', brandNames: ['Deltasone'] }
    ];

    const searchLower = searchTerm.toLowerCase();
    const results = medications.filter(med => 
      med.displayName.toLowerCase().includes(searchLower) ||
      med.genericName.toLowerCase().includes(searchLower) ||
      (med.brandNames && med.brandNames.some(brand => brand.toLowerCase().includes(searchLower)))
    );

    res.json({
      results: results.slice(0, 10),
      totalCount: results.length,
      searchTerm,
      source: 'local',
      hasMore: results.length > 10
    });
  } catch (error) {
    console.error('Medication search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Unable to search medications at this time'
    });
  }
});

// Simple allergy search endpoint with fallback data
app.get('/api/allergies/search', (req, res) => {
  try {
    const { q: searchTerm } = req.query;
    
    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({
        error: 'Search term too short',
        message: 'Search term must be at least 2 characters long'
      });
    }

    // Comprehensive allergy fallback data
    const allergies = [
      { id: 'allergy_1', displayName: 'Penicillin', allergenType: 'medication', commonReactions: ['Rash', 'Hives', 'Anaphylaxis'] },
      { id: 'allergy_2', displayName: 'Peanuts', allergenType: 'food', commonReactions: ['Hives', 'Swelling', 'Anaphylaxis'] },
      { id: 'allergy_3', displayName: 'Shellfish', allergenType: 'food', commonReactions: ['Hives', 'Swelling', 'Difficulty breathing'] },
      { id: 'allergy_4', displayName: 'Latex', allergenType: 'environmental', commonReactions: ['Contact dermatitis', 'Respiratory symptoms'] },
      { id: 'allergy_5', displayName: 'Sulfa drugs', allergenType: 'medication', commonReactions: ['Rash', 'Stevens-Johnson syndrome'] },
      { id: 'allergy_6', displayName: 'Aspirin', allergenType: 'medication', commonReactions: ['Asthma', 'Nasal polyps'] },
      { id: 'allergy_7', displayName: 'Eggs', allergenType: 'food', commonReactions: ['Hives', 'Digestive issues'] },
      { id: 'allergy_8', displayName: 'Milk', allergenType: 'food', commonReactions: ['Digestive issues', 'Hives'] },
      { id: 'allergy_9', displayName: 'Tree nuts', allergenType: 'food', commonReactions: ['Anaphylaxis', 'Hives'] },
      { id: 'allergy_10', displayName: 'Pollen', allergenType: 'environmental', commonReactions: ['Hay fever', 'Asthma'] },
      { id: 'allergy_11', displayName: 'Dust mites', allergenType: 'environmental', commonReactions: ['Asthma', 'Rhinitis'] },
      { id: 'allergy_12', displayName: 'Pet dander', allergenType: 'environmental', commonReactions: ['Asthma', 'Rhinitis'] },
      { id: 'allergy_13', displayName: 'Iodine', allergenType: 'medication', commonReactions: ['Rash', 'Anaphylaxis'] },
      { id: 'allergy_14', displayName: 'Codeine', allergenType: 'medication', commonReactions: ['Nausea', 'Respiratory depression'] },
      { id: 'allergy_15', displayName: 'Soy', allergenType: 'food', commonReactions: ['Digestive issues', 'Hives'] }
    ];

    const searchLower = searchTerm.toLowerCase();
    const results = allergies.filter(allergy => 
      allergy.displayName.toLowerCase().includes(searchLower) ||
      allergy.allergenType.toLowerCase().includes(searchLower)
    );

    res.json({
      results: results.slice(0, 10),
      totalCount: results.length,
      searchTerm,
      source: 'local',
      hasMore: results.length > 10
    });
  } catch (error) {
    console.error('Allergy search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: 'Unable to search allergies at this time'
    });
  }
});

// Simple patient endpoints
app.post('/api/patients', async (req, res) => {
  try {
    const { first_name, last_name, date_of_birth, address, phone, email } = req.body;
    
    if (!first_name || !last_name || !email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'First name, last name, and email are required'
      });
    }

    const patient = {
      id: generateId(),
      first_name,
      last_name,
      date_of_birth,
      address,
      phone,
      email,
      created_at: new Date().toISOString()
    };

    patients.push(patient);
    console.log('Patient created:', patient.id);

    res.status(201).json({
      message: 'Patient demographics saved successfully',
      patient: patient
    });
  } catch (error) {
    console.error('Patient creation error:', error);
    res.status(500).json({
      error: 'Failed to save patient',
      message: error.message
    });
  }
});

// Simple insurance endpoint
app.post('/api/insurance', async (req, res) => {
  try {
    const { provider, policyNumber, groupNumber, subscriberName, patientId } = req.body;
    
    if (!provider || !policyNumber || !subscriberName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Provider, policy number, and subscriber name are required'
      });
    }

    const insuranceRecord = {
      id: generateId(),
      patientId: patientId || generateId(),
      provider,
      policyNumber,
      groupNumber,
      subscriberName,
      created_at: new Date().toISOString()
    };

    insurance.push(insuranceRecord);
    console.log('Insurance created:', insuranceRecord.id);

    res.status(201).json({
      message: 'Insurance information saved successfully',
      insurance: insuranceRecord
    });
  } catch (error) {
    console.error('Insurance creation error:', error);
    res.status(500).json({
      error: 'Failed to save insurance',
      message: error.message
    });
  }
});

// Simple clinical forms endpoint
app.post('/api/clinical-forms', async (req, res) => {
  try {
    const { medicalHistory, currentMedications, allergies, symptoms, patientId } = req.body;

    const clinicalRecord = {
      id: generateId(),
      patientId: patientId || generateId(),
      medicalHistory,
      currentMedications,
      allergies,
      symptoms,
      created_at: new Date().toISOString()
    };

    clinicalForms.push(clinicalRecord);
    console.log('Clinical forms created:', clinicalRecord.id);

    res.status(201).json({
      message: 'Clinical forms saved successfully',
      clinicalForms: clinicalRecord
    });
  } catch (error) {
    console.error('Clinical forms creation error:', error);
    res.status(500).json({
      error: 'Failed to save clinical forms',
      message: error.message
    });
  }
});

// Simple completion endpoint
app.post('/api/completion', async (req, res) => {
  try {
    const { patientId, estimatedWaitTime } = req.body;

    const completionRecord = {
      id: generateId(),
      patientId: patientId || generateId(),
      estimatedWaitTime: estimatedWaitTime || 20,
      completed_at: new Date().toISOString()
    };

    completions.push(completionRecord);
    console.log('Completion created:', completionRecord.id);

    res.status(201).json({
      message: 'Check-in completed successfully',
      completion: completionRecord
    });
  } catch (error) {
    console.error('Completion error:', error);
    res.status(500).json({
      error: 'Failed to complete check-in',
      message: error.message
    });
  }
});

// Enhanced admin endpoints
app.get('/api/admin/submissions', (req, res) => {
  try {
    console.log('Admin submissions requested');
    console.log('Current data:', { 
      patients: patients.length, 
      insurance: insurance.length, 
      clinicalForms: clinicalForms.length, 
      completions: completions.length 
    });

    // Group data by patient
    const submissions = [];
    
    // Create submissions from insurance records (most common entry point)
    insurance.forEach(ins => {
      const patient = patients.find(p => p.id === ins.patientId);
      const clinical = clinicalForms.find(c => c.patientId === ins.patientId);
      const completion = completions.find(c => c.patientId === ins.patientId);
      
      const submission = {
        id: ins.patientId,
        patientName: ins.subscriberName || (patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'),
        email: patient?.email || 'unknown@example.com',
        phone: patient?.phone || 'Not provided',
        submittedAt: ins.created_at,
        completedAt: completion?.completed_at || null,
        status: completion ? 'completed' : (clinical ? 'partial' : 'incomplete'),
        hasInsurance: true,
        hasClinical: !!clinical,
        hasCompletion: !!completion,
        completionSteps: {
          total: 3,
          completed: [true, !!clinical, !!completion].filter(Boolean).length,
          percentage: Math.round(([true, !!clinical, !!completion].filter(Boolean).length / 3) * 100),
          hasInsurance: true,
          hasClinical: !!clinical,
          hasCompletion: !!completion
        }
      };
      
      submissions.push(submission);
    });

    // Also add patients who only have demographics
    patients.forEach(patient => {
      const hasInsurance = insurance.some(ins => ins.patientId === patient.id);
      if (!hasInsurance) {
        const clinical = clinicalForms.find(c => c.patientId === patient.id);
        const completion = completions.find(c => c.patientId === patient.id);
        
        submissions.push({
          id: patient.id,
          patientName: `${patient.first_name} ${patient.last_name}`,
          email: patient.email,
          phone: patient.phone || 'Not provided',
          submittedAt: patient.created_at,
          completedAt: completion?.completed_at || null,
          status: completion ? 'completed' : (clinical ? 'partial' : 'incomplete'),
          hasInsurance: false,
          hasClinical: !!clinical,
          hasCompletion: !!completion,
          completionSteps: {
            total: 3,
            completed: [false, !!clinical, !!completion].filter(Boolean).length,
            percentage: Math.round(([false, !!clinical, !!completion].filter(Boolean).length / 3) * 100),
            hasInsurance: false,
            hasClinical: !!clinical,
            hasCompletion: !!completion
          }
        });
      }
    });

    // Sort by submission date (most recent first)
    submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    console.log('Returning submissions:', submissions.length);

    res.json({
      success: true,
      data: submissions,
      total: submissions.length,
      filters: {
        search: req.query.search || null,
        dateFrom: req.query.dateFrom || null,
        dateTo: req.query.dateTo || null,
        status: req.query.status || null
      }
    });
  } catch (error) {
    console.error('Admin submissions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch submissions',
      message: error.message
    });
  }
});

app.get('/api/admin/submissions/:id', (req, res) => {
  try {
    const patientId = req.params.id;
    console.log('Admin detail requested for:', patientId);
    
    const patient = patients.find(p => p.id === patientId);
    const insuranceRecord = insurance.find(ins => ins.patientId === patientId);
    const clinicalRecord = clinicalForms.find(c => c.patientId === patientId);
    const completionRecord = completions.find(c => c.patientId === patientId);
    
    if (!patient && !insuranceRecord) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found',
        message: `No patient found with ID: ${patientId}`
      });
    }
    
    const submission = {
      id: patientId,
      patientName: insuranceRecord?.subscriberName || (patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'),
      email: patient?.email || 'unknown@example.com',
      phone: patient?.phone || 'Not provided',
      submittedAt: insuranceRecord?.created_at || patient?.created_at,
      completedAt: completionRecord?.completed_at || null,
      status: completionRecord ? 'completed' : (clinicalRecord ? 'partial' : 'incomplete'),
      
      // Patient demographics
      patient: patient ? {
        firstName: patient.first_name,
        lastName: patient.last_name,
        dateOfBirth: patient.date_of_birth,
        address: patient.address,
        phone: patient.phone,
        email: patient.email,
        createdAt: patient.created_at
      } : null,
      
      // Insurance information
      insurance: insuranceRecord ? {
        provider: insuranceRecord.provider,
        policyNumber: insuranceRecord.policyNumber,
        groupNumber: insuranceRecord.groupNumber,
        subscriberName: insuranceRecord.subscriberName,
        submittedAt: insuranceRecord.created_at
      } : null,
      
      // Clinical forms
      clinicalForms: clinicalRecord ? {
        medicalHistory: clinicalRecord.medicalHistory,
        currentMedications: clinicalRecord.currentMedications,
        allergies: clinicalRecord.allergies,
        symptoms: clinicalRecord.symptoms,
        submittedAt: clinicalRecord.created_at
      } : null,
      
      // Completion info
      completion: completionRecord ? {
        completedAt: completionRecord.completed_at,
        estimatedWaitTime: completionRecord.estimatedWaitTime
      } : null,
      
      hasInsurance: !!insuranceRecord,
      hasClinical: !!clinicalRecord,
      hasCompletion: !!completionRecord
    };
    
    console.log('Returning patient detail for:', submission.patientName);
    
    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Admin detail error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch patient details',
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

// Initialize database and start server
async function startServer() {
  try {
    // Try to initialize database, but don't fail if it doesn't work
    try {
      await initializeDatabase();
      console.log('Database initialized successfully');
    } catch (dbError) {
      console.warn('Database initialization failed, continuing without database:', dbError.message);
    }
    
    app.listen(PORT, () => {
      console.log(`Simplified server is running on port ${PORT}`);
      console.log(`Health check available at: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();