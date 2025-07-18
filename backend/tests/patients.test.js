const request = require('supertest');
const express = require('express');
const patientsRouter = require('../routes/patients');
const { initializeDatabase } = require('../database/db');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/patients', patientsRouter);

// Test data
const validPatientData = {
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1990-01-15',
  address: '123 Main St, Anytown, ST 12345',
  phone: '555-123-4567',
  email: 'john.doe@example.com'
};

describe('POST /api/patients', () => {
  beforeAll(async () => {
    // Initialize database before running tests
    await initializeDatabase();
  });

  describe('Valid patient data', () => {
    test('should create patient with valid data', async () => {
      const response = await request(app)
        .post('/api/patients')
        .send(validPatientData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Patient demographics saved successfully');
      expect(response.body).toHaveProperty('patient');
      expect(response.body.patient).toHaveProperty('id');
      expect(response.body.patient.first_name).toBe(validPatientData.first_name);
      expect(response.body.patient.email).toBe(validPatientData.email.toLowerCase());
    });
  });

  describe('Invalid patient data - missing required fields', () => {
    test('should return 400 when first_name is missing', async () => {
      const invalidData = { ...validPatientData };
      delete invalidData.first_name;

      const response = await request(app)
        .post('/api/patients')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('First name is required');
    });

    test('should return 400 when last_name is missing', async () => {
      const invalidData = { ...validPatientData };
      delete invalidData.last_name;

      const response = await request(app)
        .post('/api/patients')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Last name is required');
    });

    test('should return 400 when date_of_birth is missing', async () => {
      const invalidData = { ...validPatientData };
      delete invalidData.date_of_birth;

      const response = await request(app)
        .post('/api/patients')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Date of birth is required');
    });

    test('should return 400 when address is missing', async () => {
      const invalidData = { ...validPatientData };
      delete invalidData.address;

      const response = await request(app)
        .post('/api/patients')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Address is required');
    });

    test('should return 400 when phone is missing', async () => {
      const invalidData = { ...validPatientData };
      delete invalidData.phone;

      const response = await request(app)
        .post('/api/patients')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Phone number is required');
    });

    test('should return 400 when email is missing', async () => {
      const invalidData = { ...validPatientData };
      delete invalidData.email;

      const response = await request(app)
        .post('/api/patients')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Email is required');
    });
  });

  describe('Invalid patient data - format validation', () => {
    test('should return 400 when email format is invalid', async () => {
      const invalidData = { ...validPatientData, email: 'invalid-email' };

      const response = await request(app)
        .post('/api/patients')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Email format is invalid');
    });

    test('should return 400 when date format is invalid', async () => {
      const invalidData = { ...validPatientData, date_of_birth: '01/15/1990' };

      const response = await request(app)
        .post('/api/patients')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Date of birth must be in YYYY-MM-DD format');
    });

    test('should return 400 when phone format is invalid', async () => {
      const invalidData = { ...validPatientData, phone: 'invalid-phone!' };

      const response = await request(app)
        .post('/api/patients')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('Phone number format is invalid');
    });
  });

  describe('Empty or whitespace fields', () => {
    test('should return 400 when fields contain only whitespace', async () => {
      const invalidData = {
        first_name: '   ',
        last_name: '   ',
        date_of_birth: '   ',
        address: '   ',
        phone: '   ',
        email: '   '
      };

      const response = await request(app)
        .post('/api/patients')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Validation failed');
      expect(response.body.details).toContain('First name is required');
      expect(response.body.details).toContain('Last name is required');
      expect(response.body.details).toContain('Date of birth is required');
      expect(response.body.details).toContain('Address is required');
      expect(response.body.details).toContain('Phone number is required');
      expect(response.body.details).toContain('Email is required');
    });
  });
});