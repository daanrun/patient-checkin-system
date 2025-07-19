#!/usr/bin/env node

/**
 * API Debug Test - Simulates exact frontend calls
 */

const https = require('https');
const http = require('http');

async function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

async function testInsuranceAPI() {
  console.log('🧪 Testing Insurance API - Simulating Frontend Calls');
  console.log('====================================================');
  
  const baseUrl = 'https://checkinpatient.netlify.app';
  
  try {
    // Test 1: Health check
    console.log('\n1️⃣ Testing Health Check...');
    const healthOptions = {
      hostname: 'checkinpatient.netlify.app',
      port: 443,
      path: '/api/health',
      method: 'GET',
      protocol: 'https:',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://checkinpatient.netlify.app',
        'Referer': 'https://checkinpatient.netlify.app/insurance'
      }
    };
    
    const healthResponse = await makeRequest(healthOptions);
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Body: ${healthResponse.body}`);
    
    // Test 2: OPTIONS preflight request (what browser does first)
    console.log('\n2️⃣ Testing OPTIONS Preflight Request...');
    const optionsRequest = {
      hostname: 'checkinpatient.netlify.app',
      port: 443,
      path: '/api/insurance',
      method: 'OPTIONS',
      protocol: 'https:',
      headers: {
        'Origin': 'https://checkinpatient.netlify.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Referer': 'https://checkinpatient.netlify.app/insurance'
      }
    };
    
    const optionsResponse = await makeRequest(optionsRequest);
    console.log(`   Status: ${optionsResponse.status}`);
    console.log(`   CORS Headers:`);
    console.log(`     Access-Control-Allow-Origin: ${optionsResponse.headers['access-control-allow-origin']}`);
    console.log(`     Access-Control-Allow-Methods: ${optionsResponse.headers['access-control-allow-methods']}`);
    console.log(`     Access-Control-Allow-Headers: ${optionsResponse.headers['access-control-allow-headers']}`);
    
    // Test 3: Actual POST request (what frontend does)
    console.log('\n3️⃣ Testing POST Request (Simulating Frontend)...');
    const insuranceData = {
      provider: 'Test Insurance Company',
      policyNumber: 'TEST123456',
      groupNumber: '',
      subscriberName: 'John Doe Test',
      patientId: 12345,
      hasFiles: false,
      fileNames: []
    };
    
    const postOptions = {
      hostname: 'checkinpatient.netlify.app',
      port: 443,
      path: '/api/insurance',
      method: 'POST',
      protocol: 'https:',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://checkinpatient.netlify.app',
        'Referer': 'https://checkinpatient.netlify.app/insurance',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    };
    
    const postData = JSON.stringify(insuranceData);
    postOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    
    console.log(`   Sending data: ${postData}`);
    
    const postResponse = await makeRequest(postOptions, postData);
    console.log(`   Status: ${postResponse.status}`);
    console.log(`   Response Headers:`);
    Object.keys(postResponse.headers).forEach(key => {
      if (key.startsWith('access-control') || key === 'content-type') {
        console.log(`     ${key}: ${postResponse.headers[key]}`);
      }
    });
    console.log(`   Body: ${postResponse.body}`);
    
    // Test 4: Check what happens with different origins
    console.log('\n4️⃣ Testing with Different Origin (Debug)...');
    const testOriginOptions = {
      ...postOptions,
      headers: {
        ...postOptions.headers,
        'Origin': 'https://example.com'
      }
    };
    
    const originTestResponse = await makeRequest(testOriginOptions, postData);
    console.log(`   Status with different origin: ${originTestResponse.status}`);
    console.log(`   CORS Allow Origin: ${originTestResponse.headers['access-control-allow-origin']}`);
    
    // Summary
    console.log('\n📊 SUMMARY');
    console.log('===========');
    console.log(`Health Check: ${healthResponse.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`OPTIONS Request: ${optionsResponse.status === 200 || optionsResponse.status === 204 ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`POST Request: ${postResponse.status === 200 || postResponse.status === 201 ? '✅ PASS' : '❌ FAIL'}`);
    
    if (postResponse.status >= 400) {
      console.log('\n❌ POST Request Failed - This is likely the issue!');
      console.log(`   Status: ${postResponse.status}`);
      console.log(`   Body: ${postResponse.body}`);
    }
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testInsuranceAPI();
}

module.exports = testInsuranceAPI;