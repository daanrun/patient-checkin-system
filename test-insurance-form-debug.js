#!/usr/bin/env node

/**
 * Frontend Insurance Form Debug Test
 * Tests the exact user flow and captures network errors
 */

const puppeteer = require('puppeteer');

async function testInsuranceForm() {
  let browser;
  
  try {
    console.log('🚀 Starting Insurance Form Debug Test');
    console.log('=====================================');
    
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      devtools: true,  // Open dev tools
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Enable request interception to log all network requests
    await page.setRequestInterception(true);
    
    const requests = [];
    const responses = [];
    
    page.on('request', (request) => {
      console.log(`📤 REQUEST: ${request.method()} ${request.url()}`);
      if (request.url().includes('/api/')) {
        console.log(`   Headers:`, request.headers());
        if (request.postData()) {
          console.log(`   Body:`, request.postData());
        }
      }
      requests.push({
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        postData: request.postData()
      });
      request.continue();
    });
    
    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        console.log(`📥 RESPONSE: ${response.status()} ${response.url()}`);
        console.log(`   Headers:`, response.headers());
      }
      responses.push({
        status: response.status(),
        url: response.url(),
        headers: response.headers()
      });
    });
    
    // Capture console logs
    page.on('console', (msg) => {
      console.log(`🖥️  CONSOLE: ${msg.text()}`);
    });
    
    // Capture page errors
    page.on('pageerror', (error) => {
      console.error(`❌ PAGE ERROR: ${error.message}`);
    });
    
    // Navigate to the site
    console.log('\n📍 Navigating to site...');
    await page.goto('https://checkinpatient.netlify.app', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for page to load
    await page.waitForSelector('.step-container', { timeout: 10000 });
    console.log('✅ Page loaded successfully');
    
    // Navigate to insurance page
    console.log('\n📍 Navigating to insurance page...');
    await page.goto('https://checkinpatient.netlify.app/insurance', { 
      waitUntil: 'networkidle2' 
    });
    
    // Wait for insurance form
    await page.waitForSelector('#provider', { timeout: 10000 });
    console.log('✅ Insurance form loaded');
    
    // Fill out the form
    console.log('\n📝 Filling out insurance form...');
    await page.type('#provider', 'Test Insurance Company');
    await page.type('#policyNumber', 'TEST123456');
    await page.type('#subscriberName', 'John Doe Test');
    
    console.log('✅ Form filled out');
    
    // Click submit button
    console.log('\n🔄 Submitting form...');
    const submitButton = await page.$('button[type="submit"]');
    
    if (!submitButton) {
      throw new Error('Submit button not found');
    }
    
    // Wait for any network requests after clicking submit
    const responsePromise = page.waitForResponse(
      response => response.url().includes('/api/insurance'),
      { timeout: 10000 }
    ).catch(() => null);
    
    await submitButton.click();
    console.log('✅ Submit button clicked');
    
    // Wait for response or timeout
    const apiResponse = await responsePromise;
    
    if (apiResponse) {
      console.log(`\n📥 API Response received: ${apiResponse.status()}`);
      const responseText = await apiResponse.text();
      console.log(`   Response body: ${responseText}`);
    } else {
      console.log('\n❌ No API response received within timeout');
    }
    
    // Wait a bit to see what happens
    await page.waitForTimeout(5000);
    
    // Check current URL
    const currentUrl = page.url();
    console.log(`\n📍 Current URL: ${currentUrl}`);
    
    // Check for error messages
    const errorElements = await page.$$('.error-message, .submit-error');
    if (errorElements.length > 0) {
      console.log('\n❌ Error messages found:');
      for (const element of errorElements) {
        const text = await element.textContent();
        console.log(`   - ${text}`);
      }
    }
    
    // Check if still loading
    const loadingButton = await page.$('button:disabled');
    if (loadingButton) {
      const buttonText = await loadingButton.textContent();
      console.log(`\n⏳ Button still loading: "${buttonText}"`);
    }
    
    // Summary
    console.log('\n📊 SUMMARY');
    console.log('===========');
    console.log(`Total requests: ${requests.length}`);
    console.log(`API requests: ${requests.filter(r => r.url.includes('/api/')).length}`);
    console.log(`Failed responses: ${responses.filter(r => r.status >= 400).length}`);
    
    const apiRequests = requests.filter(r => r.url.includes('/api/insurance'));
    const apiResponses = responses.filter(r => r.url.includes('/api/insurance'));
    
    console.log(`\nInsurance API requests: ${apiRequests.length}`);
    console.log(`Insurance API responses: ${apiResponses.length}`);
    
    if (apiResponses.length > 0) {
      apiResponses.forEach((response, index) => {
        console.log(`  Response ${index + 1}: ${response.status} ${response.url}`);
      });
    }
    
    // Keep browser open for manual inspection
    console.log('\n🔍 Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Install puppeteer if not available
async function installPuppeteer() {
  const { execSync } = require('child_process');
  try {
    require('puppeteer');
  } catch (error) {
    console.log('📦 Installing Puppeteer...');
    execSync('npm install puppeteer', { stdio: 'inherit' });
  }
}

// Run the test
if (require.main === module) {
  installPuppeteer().then(() => {
    testInsuranceForm().catch(console.error);
  });
}

module.exports = testInsuranceForm;