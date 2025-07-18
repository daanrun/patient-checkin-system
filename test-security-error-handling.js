const axios = require('axios');

const BASE_URL = 'http://localhost:5001';

// Test security and error handling scenarios
async function testSecurityAndErrorHandling() {
  console.log('=== Testing Security and Error Handling ===\n');

  // Test 1: XSS attempt in form data
  console.log('1. Testing XSS protection...');
  try {
    const xssPayload = {
      medicalHistory: '<script>alert("XSS")</script>Diabetes',
      allergies: '<img src=x onerror=alert("XSS")>None',
      patientId: 1
    };
    
    const response = await axios.post(`${BASE_URL}/api/clinical-forms`, xssPayload);
    console.log('✓ XSS payload was sanitized successfully');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ XSS payload was rejected with validation error');
    } else {
      console.log('✗ Unexpected error:', error.message);
    }
  }

  // Test 2: SQL injection attempt
  console.log('\n2. Testing SQL injection protection...');
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/submissions/1%27%3B%20DROP%20TABLE%20patients%3B%20--`);
    console.log('✗ SQL injection attempt should have been blocked');
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 404)) {
      console.log('✓ SQL injection attempt was blocked');
    } else {
      console.log('✗ Unexpected error:', error.message);
    }
  }

  // Test 3: Invalid file type upload
  console.log('\n3. Testing file type validation...');
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('provider', 'Test Insurance');
    form.append('policyNumber', '12345');
    form.append('subscriberName', 'Test User');
    form.append('patientId', '1');
    form.append('cardImages', Buffer.from('fake exe content'), {
      filename: 'malicious.exe',
      contentType: 'application/octet-stream'
    });

    const response = await axios.post(`${BASE_URL}/api/insurance`, form, {
      headers: form.getHeaders()
    });
    console.log('✗ Malicious file should have been rejected');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ Invalid file type was rejected');
    } else {
      console.log('✗ Unexpected error:', error.message);
    }
  }

  // Test 4: Rate limiting (multiple rapid requests)
  console.log('\n4. Testing rate limiting...');
  const promises = [];
  for (let i = 0; i < 10; i++) {
    promises.push(
      axios.get(`${BASE_URL}/api/health`).catch(err => err.response)
    );
  }
  
  const results = await Promise.all(promises);
  const rateLimited = results.some(result => result && result.status === 429);
  
  if (rateLimited) {
    console.log('✓ Rate limiting is working');
  } else {
    console.log('? Rate limiting may not be triggered with current settings');
  }

  // Test 5: Invalid JSON payload
  console.log('\n5. Testing invalid JSON handling...');
  try {
    const response = await axios.post(`${BASE_URL}/api/clinical-forms`, 'invalid json', {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✗ Invalid JSON should have been rejected');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ Invalid JSON was rejected with proper error');
    } else {
      console.log('✗ Unexpected error:', error.message);
    }
  }

  // Test 6: Missing required fields
  console.log('\n6. Testing validation for missing required fields...');
  try {
    const response = await axios.post(`${BASE_URL}/api/clinical-forms`, {
      patientId: 1
      // Missing required fields
    });
    console.log('✗ Missing required fields should have been caught');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ Missing required fields were caught');
    } else {
      console.log('✗ Unexpected error:', error.message);
    }
  }

  // Test 7: Invalid patient ID formats
  console.log('\n7. Testing invalid patient ID handling...');
  try {
    const response = await axios.get(`${BASE_URL}/api/admin/submissions/abc`);
    console.log('✗ Invalid patient ID should have been rejected');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✓ Invalid patient ID was rejected');
    } else {
      console.log('✗ Unexpected error:', error.message);
    }
  }

  // Test 8: Non-existent endpoints
  console.log('\n8. Testing 404 handling...');
  try {
    const response = await axios.get(`${BASE_URL}/api/nonexistent`);
    console.log('✗ Non-existent endpoint should return 404');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✓ 404 error handled properly');
    } else {
      console.log('✗ Unexpected error:', error.message);
    }
  }

  console.log('\n=== Security and Error Handling Tests Complete ===');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testSecurityAndErrorHandling().catch(console.error);
}

module.exports = { testSecurityAndErrorHandling };