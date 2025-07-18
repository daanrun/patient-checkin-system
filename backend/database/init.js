const { initializeDatabase } = require('./db');

// Initialize the database
async function init() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  init();
}

module.exports = { init };