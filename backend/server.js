const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5001;

// Basic middleware for JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
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
const patientsRouter = require('./routes/patients');

// Basic routing structure
app.use('/api/patients', patientsRouter);

app.use('/api/insurance', (req, res) => {
  res.status(501).json({ error: 'Insurance endpoint not yet implemented' });
});

app.use('/api/clinical-forms', (req, res) => {
  res.status(501).json({ error: 'Clinical forms endpoint not yet implemented' });
});

app.use('/api/admin', (req, res) => {
  res.status(501).json({ error: 'Admin endpoint not yet implemented' });
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
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check available at: http://localhost:${PORT}/api/health`);
    });
    
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

startServer();