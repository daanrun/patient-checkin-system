const puppeteer = require('puppeteer');

async function testAdminDetailView() {
  console.log('🧪 Testing Admin Detail View...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to admin dashboard
    console.log('📱 Navigating to admin dashboard...');
    await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle0' });
    
    // Wait for submissions to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    console.log('✅ Admin dashboard loaded with submissions');
    
    // Click on the first "View Details" button
    console.log('🔍 Clicking on first View Details button...');
    await page.click('table tbody tr:first-child button');
    
    // Wait for detail view to load
    await page.waitForSelector('h1', { timeout: 5000 });
    const pageTitle = await page.$eval('h1', el => el.textContent);
    console.log(`✅ Detail view loaded with title: ${pageTitle}`);
    
    // Check if patient information is displayed
    const patientInfoExists = await page.$('h2:contains("Patient Information")') !== null;
    if (patientInfoExists) {
      console.log('✅ Patient information section found');
    }
    
    // Check if insurance information is displayed
    const insuranceInfoExists = await page.$('h2:contains("Insurance Information")') !== null;
    if (insuranceInfoExists) {
      console.log('✅ Insurance information section found');
    }
    
    // Check if clinical forms are displayed
    const clinicalFormsExists = await page.$('h2:contains("Clinical Forms")') !== null;
    if (clinicalFormsExists) {
      console.log('✅ Clinical forms section found');
    }
    
    // Test back button
    console.log('🔙 Testing back button...');
    await page.click('button:contains("Back to Dashboard")');
    await page.waitForSelector('h1:contains("Admin Dashboard")', { timeout: 5000 });
    console.log('✅ Back button works correctly');
    
    console.log('🎉 All admin detail view tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testAdminDetailView().catch(console.error);