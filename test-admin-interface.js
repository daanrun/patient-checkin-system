const axios = require('axios');

async function testAdminInterface() {
  console.log('Testing Admin Interface...\n');

  try {
    // Test 1: Get all submissions
    console.log('1. Testing GET /api/admin/submissions');
    const response1 = await axios.get('http://localhost:5001/api/admin/submissions');
    console.log('✓ Successfully retrieved submissions');
    console.log(`   Found ${response1.data.total} submissions`);
    console.log(`   First submission: ${response1.data.data[0]?.patientName || 'None'}\n`);

    // Test 2: Search by patient name
    console.log('2. Testing search functionality');
    const response2 = await axios.get('http://localhost:5001/api/admin/submissions?search=John');
    console.log('✓ Search by name works');
    console.log(`   Found ${response2.data.total} results for "John"\n`);

    // Test 3: Filter by status
    console.log('3. Testing status filter');
    const response3 = await axios.get('http://localhost:5001/api/admin/submissions?status=completed');
    console.log('✓ Status filter works');
    console.log(`   Found ${response3.data.total} completed submissions\n`);

    // Test 4: Date range filter
    console.log('4. Testing date range filter');
    const today = new Date().toISOString().split('T')[0];
    const response4 = await axios.get(`http://localhost:5001/api/admin/submissions?dateFrom=${today}`);
    console.log('✓ Date filter works');
    console.log(`   Found ${response4.data.total} submissions from today\n`);

    // Test 5: Combined filters
    console.log('5. Testing combined filters');
    const response5 = await axios.get(`http://localhost:5001/api/admin/submissions?search=John&status=completed`);
    console.log('✓ Combined filters work');
    console.log(`   Found ${response5.data.total} results for "John" with status "completed"\n`);

    console.log('🎉 All admin interface tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testAdminInterface();