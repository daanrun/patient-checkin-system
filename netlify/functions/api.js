const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { initializeDatabase } = require('../../backend/database/db');

const app = express();

// Basic middleware for JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
  origin: ['https://checkinpatient.netlify.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));

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
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Patient Check-in API is running', 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Import route handlers
const insuranceRouter = require('../../backend/routes/insurance');
const clinicalFormsRouter = require('../../backend/routes/clinical-forms');
const completionRouter = require('../../backend/routes/completion');
const adminRouter = require('../../backend/routes/admin');

// API routes
app.use('/api/insurance', insuranceRouter);
app.use('/api/clinical-forms', clinicalFormsRouter);
app.use('/api/completion', completionRouter);
app.use('/api/admin', adminRouter);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    path: req.originalUrl,
    method: req.method
  });
});

// Initialize database
let dbInitialized = false;
const initDB = async () => {
  if (!dbInitialized) {
    await initializeDatabase();
    dbInitialized = true;
  }
};

// Wrap the app with serverless
const handler = serverless(app);

module.exports.handler = async (event, context) => {
  await initDB();
  return handler(event, context);
};