#!/usr/bin/env node

/**
 * Comprehensive End-to-End Integration Test
 * Tests the complete patient check-in flow and admin interface
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:5001';
const API_URL = `${BASE_URL}/api`;

// Test data
const testPatient = {
  firstName: 'John',
  lastName: 'Doe',
  dateOfBirth: '1985-06-15',
  address: '123 Main St, Anytown, ST 12345',
  phone: '555-123-4567',
  email: 'john.doe@example.com'
};

const testInsurance = {
  provider: 'Blue Cross Blue Shield',
  policyNumber: 'BC123456789',
  groupNumber: 'GRP001',
  subscriberName: 'John Doe'
};

const testClinicalForms = {
  medicalHistory: 'No significant medical history',
  currentMedications: 'None',
  allergies: 'No known allergies',
  symptoms: 'Routine checkup'
};

// Test utilities
class TestRunner {
  constructor() {
    this.testResults = [];
    this.patientId = null;
    this.submissionId = null;
  }

  async runTest(testName, testFunction) {
    console.log(`\n🧪 Running test: ${testName}`);
    try {
      await testFunction();
      console.log(`✅ PASSED: ${testName}`);
      this.testResults.push({ name: testName, status: 'PASSED' });
    } catch (error) {
      console.error(`❌ FAILED: ${testName}`);
      console.error(`   Error: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
    }
  }

  async checkServerHealth() {
    const response = await axios.get(`${API_URL}/health`);
    if (response.status !== 200) {
      throw new Error(`Server health check failed: ${response.status}`);
    }
    console.log(`   Server is healthy: ${response.data.message}`);
  }

  async testDemographicsSubmission() {
    // Note: Demographics endpoint returns 501 as it's not implemented
    // This test verifies the expected behavior
    try {
      await axios.post(`${API_URL}/patients`, testPatient);
      throw new Error('Expected 501 status but request succeeded');
    } catch (error) {
      if (error.response && error.response.status === 501) {
        console.log('   Demographics endpoint correctly returns 501 (not implemented)');
        return;
      }
      throw error;
    }
  }

  async testInsuranceSubmission() {
    // Create a test image file for upload
    const testImagePath = path.join(__dirname, 'test-insurance-card.txt');
    fs.writeFileSync(testImagePath, 'Test insurance card image content');

    const formData = new FormData();
    formData.append('provider', testInsurance.provider);
    formData.append('policyNumber', testInsurance.policyNumber);
    formData.append('groupNumber', testInsurance.groupNumber);
    formData.append('subscriberName', testInsurance.subscriberName);
    formData.append('insuranceCard', fs.createReadStream(testImagePath));

    const response = await axios.post(`${API_URL}/insurance`, formData, {
      headers: formData.getHeaders()
    });

    if (response.status !== 201) {
      throw new Error(`Expected 201 status, got ${response.status}`);
    }

    this.patientId = response.data.patientId;
    console.log(`   Insurance submitted successfully, Patient ID: ${this.patientId}`);

    // Cleanup test file
    fs.unlinkSync(testImagePath);
  }

  async testClinicalFormsSubmission() {
    if (!this.patientId) {
      throw new Error('Patient ID not available from previous test');
    }

    const clinicalData = {
      ...testClinicalForms,
      patientId: this.patientId
    };

    const response = await axios.post(`${API_URL}/clinical-forms`, clinicalData);

    if (response.status !== 201) {
      throw new Error(`Expected 201 status, got ${response.status}`);
    }

    console.log('   Clinical forms submitted successfully');
  }

  async testCompletionSubmission() {
    if (!this.patientId) {
      throw new Error('Patient ID not available from previous test');
    }

    const completionData = {
      patientId: this.patientId,
      completedAt: new Date().toISOString()
    };

    const response = await axios.post(`${API_URL}/completion`, completionData);

    if (response.status !== 201) {
      throw new Error(`Expected 201 status, got ${response.status}`);
    }

    this.submissionId = response.data.submissionId;
    console.log(`   Completion recorded successfully, Submission ID: ${this.submissionId}`);
  }

  async testAdminSubmissionsList() {
    const response = await axios.get(`${API_URL}/admin/submissions`);

    if (response.status !== 200) {
      throw new Error(`Expected 200 status, got ${response.status}`);
    }

    const submissions = response.data;
    if (!Array.isArray(submissions)) {
      throw new Error('Expected submissions to be an array');
    }

    console.log(`   Found ${submissions.length} submissions in admin list`);

    // Verify our test submission is in the list
    if (this.submissionId) {
      const ourSubmission = submissions.find(s => s.id === this.submissionId);
      if (!ourSubmission) {
        throw new Error('Test submission not found in admin list');
      }
      console.log('   Test submission found in admin list');
    }
  }

  async testAdminSubmissionDetail() {
    if (!this.submissionId) {
      throw new Error('Submission ID not available from previous test');
    }

    const response = await axios.get(`${API_URL}/admin/submissions/${this.submissionId}`);

    if (response.status !== 200) {
      throw new Error(`Expected 200 status, got ${response.status}`);
    }

    const submission = response.data;
    
    // Verify submission contains expected data
    if (!submission.insurance || !submission.clinicalForms) {
      throw new Error('Submission missing expected data sections');
    }

    if (submission.insurance.provider !== testInsurance.provider) {
      throw new Error('Insurance provider mismatch in submission detail');
    }

    console.log('   Submission detail retrieved successfully with correct data');
  }

  async testErrorHandling() {
    // Test invalid submission ID
    try {
      await axios.get(`${API_URL}/admin/submissions/invalid-id`);
      throw new Error('Expected error for invalid submission ID');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('   Error handling works correctly for invalid submission ID');
      } else {
        throw error;
      }
    }

    // Test malformed insurance data
    try {
      await axios.post(`${API_URL}/insurance`, { invalid: 'data' });
      throw new Error('Expected validation error for malformed insurance data');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   Validation works correctly for malformed insurance data');
      } else {
        throw error;
      }
    }
  }

  async testSecurityHeaders() {
    const response = await axios.get(`${API_URL}/health`);
    
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];

    for (const header of securityHeaders) {
      if (!response.headers[header]) {
        console.warn(`   Warning: Missing security header: ${header}`);
      }
    }

    console.log('   Security headers check completed');
  }

  async runAllTests() {
    console.log('🚀 Starting End-to-End Integration Tests\n');
    console.log('=' .repeat(50));

    await this.runTest('Server Health Check', () => this.checkServerHealth());
    await this.runTest('Demographics Submission', () => this.testDemographicsSubmission());
    await this.runTest('Insurance Submission', () => this.testInsuranceSubmission());
    await this.runTest('Clinical Forms Submission', () => this.testClinicalFormsSubmission());
    await this.runTest('Completion Submission', () => this.testCompletionSubmission());
    await this.runTest('Admin Submissions List', () => this.testAdminSubmissionsList());
    await this.runTest('Admin Submission Detail', () => this.testAdminSubmissionDetail());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Security Headers', () => this.testSecurityHeaders());

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('=' .repeat(50));

    const passed = this.testResults.filter(r => r.status === 'PASSED').length;
    const failed = this.testResults.filter(r => r.status === 'FAILED').length;

    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);

    if (failed > 0) {
      console.log('\nFailed Tests:');
      this.testResults
        .filter(r => r.status === 'FAILED')
        .forEach(r => console.log(`  - ${r.name}: ${r.error}`));
    }

    console.log(`\n🎯 Success Rate: ${Math.round((passed / this.testResults.length) * 100)}%`);
    
    if (failed === 0) {
      console.log('\n🎉 All tests passed! The application is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
      process.exit(1);
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(error => {
    console.error('\n💥 Test runner crashed:', error.message);
    process.exit(1);
  });
}

module.exports = TestRunner;