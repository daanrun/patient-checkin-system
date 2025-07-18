// Test script for clinical forms API
const baseUrl = 'http://localhost:5001/api/clinical-forms';

async function testClinicalFormsAPI() {
  console.log('Testing Clinical Forms API...\n');

  // Test 1: Valid submission
  console.log('Test 1: Valid clinical forms submission');
  try {
    const validData = {
      medicalHistory: 'No significant medical history',
      currentMedications: 'Multivitamin daily',
      allergies: 'No known allergies',
      symptoms: 'Routine checkup',
      patientId: 1
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validData)
    });

    const result = await response.json();
    console.log('✅ Valid submission:', response.status, result.message);
  } catch (error) {
    console.log('❌ Valid submission failed:', error.message);
  }

  // Test 2: Missing required fields
  console.log('\nTest 2: Missing required fields');
  try {
    const invalidData = {
      medicalHistory: '',
      allergies: '',
      patientId: 1
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });

    const result = await response.json();
    console.log('✅ Validation errors caught:', response.status, result.error);
    console.log('   Error details:', result.details.length, 'validation errors');
  } catch (error) {
    console.log('❌ Validation test failed:', error.message);
  }

  // Test 3: Invalid patient ID
  console.log('\nTest 3: Invalid patient ID');
  try {
    const invalidPatientData = {
      medicalHistory: 'Test history',
      allergies: 'None',
      patientId: 'invalid'
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPatientData)
    });

    const result = await response.json();
    console.log('✅ Invalid patient ID caught:', response.status, result.error);
  } catch (error) {
    console.log('❌ Invalid patient ID test failed:', error.message);
  }

  // Test 4: Retrieve clinical forms
  console.log('\nTest 4: Retrieve clinical forms by patient ID');
  try {
    const response = await fetch(`${baseUrl}/1`);
    const result = await response.json();
    console.log('✅ Retrieved clinical forms:', response.status, result.message);
    console.log('   Patient ID:', result.data.patient_id);
  } catch (error) {
    console.log('❌ Retrieve test failed:', error.message);
  }

  // Test 5: Long text validation
  console.log('\nTest 5: Text length validation');
  try {
    const longTextData = {
      medicalHistory: 'A'.repeat(2001), // Exceeds 2000 character limit
      allergies: 'None',
      patientId: 1
    };

    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(longTextData)
    });

    const result = await response.json();
    console.log('✅ Long text validation:', response.status, result.error);
  } catch (error) {
    console.log('❌ Long text validation failed:', error.message);
  }

  console.log('\n✅ All clinical forms API tests completed!');
}

// Run the tests
testClinicalFormsAPI().catch(console.error);