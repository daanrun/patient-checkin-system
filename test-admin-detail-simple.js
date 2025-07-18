// Simple test to verify admin detail view functionality
const fetch = require('node-fetch');

async function testAdminDetailAPI() {
  console.log('🧪 Testing Admin Detail View API...');
  
  try {
    // Test getting list of submissions
    console.log('📋 Testing submissions list...');
    const listResponse = await fetch('http://localhost:5001/api/admin/submissions');
    const listData = await listResponse.json();
    
    if (listData.data && listData.data.length > 0) {
      console.log(`✅ Found ${listData.data.length} submissions`);
      
      // Test getting detail for first submission
      const firstSubmissionId = listData.data[0].id;
      console.log(`🔍 Testing detail view for submission ID: ${firstSubmissionId}`);
      
      const detailResponse = await fetch(`http://localhost:5001/api/admin/submissions/${firstSubmissionId}`);
      const detailData = await detailResponse.json();
      
      if (detailData.data) {
        console.log('✅ Detail view API working correctly');
        console.log(`   Patient: ${detailData.data.patient.firstName} ${detailData.data.patient.lastName}`);
        console.log(`   Status: ${detailData.data.status}`);
        console.log(`   Has Insurance: ${detailData.data.insurance ? 'Yes' : 'No'}`);
        console.log(`   Has Clinical Forms: ${detailData.data.clinicalForms ? 'Yes' : 'No'}`);
        console.log(`   Has Completion: ${detailData.data.completion ? 'Yes' : 'No'}`);
      } else {
        throw new Error('Detail data not found');
      }
    } else {
      console.log('⚠️  No submissions found to test with');
    }
    
    // Test error handling
    console.log('🚫 Testing error handling...');
    const errorResponse = await fetch('http://localhost:5001/api/admin/submissions/999');
    const errorData = await errorResponse.json();
    
    if (errorData.error === 'Submission not found') {
      console.log('✅ Error handling working correctly');
    } else {
      throw new Error('Error handling not working as expected');
    }
    
    console.log('🎉 All API tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  }
}

// Run the test
testAdminDetailAPI().catch(console.error);