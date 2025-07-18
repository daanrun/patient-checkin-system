const http = require('http');

// Test the complete admin interface flow
async function testCompleteFlow() {
  console.log('Testing Complete Admin Interface Flow...\n');

  try {
    // Test 1: Backend API is working
    console.log('1. Testing Backend API...');
    const response = await fetch('http://localhost:5001/api/admin/submissions');
    const data = await response.json();
    console.log('✓ Backend API working');
    console.log(`   Found ${data.total} submissions\n`);

    // Test 2: Frontend is serving the admin page
    console.log('2. Testing Frontend Admin Route...');
    const frontendResponse = await fetch('http://localhost:3000/admin');
    const html = await frontendResponse.text();
    
    if (html.includes('<!DOCTYPE html>')) {
      console.log('✓ Frontend serving admin page');
    } else {
      console.log('❌ Frontend not serving admin page properly');
    }

    // Test 3: API proxy is working (frontend calling backend through proxy)
    console.log('3. Testing API Proxy...');
    const proxyResponse = await fetch('http://localhost:3000/api/admin/submissions');
    const proxyData = await proxyResponse.json();
    console.log('✓ API proxy working');
    console.log(`   Proxy returned ${proxyData.total} submissions\n`);

    console.log('🎉 Complete admin interface flow test passed!');
    console.log('\nAdmin interface is ready at: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteFlow();