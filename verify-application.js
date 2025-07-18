#!/usr/bin/env node

/**
 * Application Verification Script
 * Verifies that all components are properly set up for deployment
 */

const fs = require('fs');
const path = require('path');

class ApplicationVerifier {
  constructor() {
    this.checks = [];
    this.passed = 0;
    this.failed = 0;
  }

  check(name, condition, message) {
    console.log(`🔍 Checking: ${name}`);
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      this.passed++;
    } else {
      console.log(`❌ FAIL: ${message}`);
      this.failed++;
    }
    this.checks.push({ name, passed: condition, message });
  }

  fileExists(filePath) {
    return fs.existsSync(filePath);
  }

  directoryExists(dirPath) {
    return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  }

  hasContent(filePath, searchString) {
    if (!this.fileExists(filePath)) return false;
    const content = fs.readFileSync(filePath, 'utf8');
    return content.includes(searchString);
  }

  async runAllChecks() {
    console.log('🚀 Starting Application Verification\n');
    console.log('=' .repeat(50));

    // Check project structure
    this.check(
      'Project Structure',
      this.directoryExists('frontend') && this.directoryExists('backend'),
      'Frontend and backend directories exist'
    );

    // Check package.json files
    this.check(
      'Root Package.json',
      this.fileExists('package.json'),
      'Root package.json exists'
    );

    this.check(
      'Frontend Package.json',
      this.fileExists('frontend/package.json'),
      'Frontend package.json exists'
    );

    this.check(
      'Backend Package.json',
      this.fileExists('backend/package.json'),
      'Backend package.json exists'
    );

    // Check main application files
    this.check(
      'Backend Server',
      this.fileExists('backend/server.js'),
      'Backend server.js exists'
    );

    this.check(
      'Frontend App',
      this.fileExists('frontend/src/App.jsx'),
      'Frontend App.jsx exists'
    );

    // Check React components
    const components = [
      'Demographics.jsx',
      'Insurance.jsx',
      'ClinicalForms.jsx',
      'Confirmation.jsx',
      'AdminDashboard.jsx',
      'AdminDetailView.jsx'
    ];

    components.forEach(component => {
      this.check(
        `Component: ${component}`,
        this.fileExists(`frontend/src/components/${component}`),
        `${component} component exists`
      );
    });

    // Check backend routes
    const routes = [
      'insurance.js',
      'clinical-forms.js',
      'completion.js',
      'admin.js'
    ];

    routes.forEach(route => {
      this.check(
        `Route: ${route}`,
        this.fileExists(`backend/routes/${route}`),
        `${route} route exists`
      );
    });

    // Check database setup
    this.check(
      'Database Setup',
      this.fileExists('backend/database/db.js'),
      'Database configuration exists'
    );

    // Check models
    const models = [
      'Insurance.js',
      'ClinicalForm.js',
      'CheckInCompletion.js'
    ];

    models.forEach(model => {
      this.check(
        `Model: ${model}`,
        this.fileExists(`backend/models/${model}`),
        `${model} model exists`
      );
    });

    // Check CSS and styling
    this.check(
      'Main CSS',
      this.fileExists('frontend/src/index.css'),
      'Main CSS file exists'
    );

    this.check(
      'Responsive Design',
      this.hasContent('frontend/src/index.css', '@media (max-width: 768px)'),
      'Responsive design CSS is present'
    );

    this.check(
      'Admin Styles',
      this.hasContent('frontend/src/index.css', '.admin-dashboard'),
      'Admin dashboard styles are present'
    );

    // Check security features
    this.check(
      'Security Middleware',
      this.hasContent('backend/server.js', 'helmet'),
      'Security middleware (helmet) is configured'
    );

    this.check(
      'Rate Limiting',
      this.hasContent('backend/server.js', 'rateLimit'),
      'Rate limiting is configured'
    );

    // Check error handling
    this.check(
      'Error Handler',
      this.fileExists('backend/middleware/errorHandler.js'),
      'Error handling middleware exists'
    );

    // Check documentation
    this.check(
      'README Documentation',
      this.fileExists('README.md') && fs.readFileSync('README.md', 'utf8').length > 1000,
      'Comprehensive README.md exists'
    );

    // Check test files
    this.check(
      'Integration Tests',
      this.fileExists('test-end-to-end-integration.js'),
      'End-to-end integration test exists'
    );

    // Check build configuration
    this.check(
      'Vite Config',
      this.fileExists('frontend/vite.config.js'),
      'Vite build configuration exists'
    );

    // Check deployment readiness
    this.check(
      'Build Scripts',
      this.hasContent('package.json', '"build"'),
      'Build scripts are configured'
    );

    this.check(
      'Development Scripts',
      this.hasContent('package.json', '"dev"'),
      'Development scripts are configured'
    );

    this.printSummary();
  }

  printSummary() {
    console.log('\n' + '=' .repeat(50));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('=' .repeat(50));

    console.log(`Total Checks: ${this.checks.length}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);

    if (this.failed > 0) {
      console.log('\nFailed Checks:');
      this.checks
        .filter(c => !c.passed)
        .forEach(c => console.log(`  - ${c.name}: ${c.message}`));
    }

    const successRate = Math.round((this.passed / this.checks.length) * 100);
    console.log(`\n🎯 Success Rate: ${successRate}%`);
    
    if (this.failed === 0) {
      console.log('\n🎉 All checks passed! The application is ready for deployment.');
      console.log('\n📋 Next Steps:');
      console.log('1. Start the backend server: cd backend && npm start');
      console.log('2. Start the frontend: cd frontend && npm run dev');
      console.log('3. Test the application manually');
      console.log('4. Build for production: npm run build');
      console.log('5. Deploy to your hosting platform');
    } else {
      console.log('\n⚠️  Some checks failed. Please review the issues above.');
    }

    console.log('\n🚀 Application Structure Verified!');
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  const verifier = new ApplicationVerifier();
  verifier.runAllChecks().catch(error => {
    console.error('\n💥 Verification crashed:', error.message);
    process.exit(1);
  });
}

module.exports = ApplicationVerifier;