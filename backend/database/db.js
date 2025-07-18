const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, 'patient_checkin.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create patients table
      db.run(`
        CREATE TABLE IF NOT EXISTS patients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          date_of_birth TEXT NOT NULL,
          address TEXT NOT NULL,
          phone TEXT NOT NULL,
          email TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating patients table:', err.message);
          reject(err);
          return;
        }
        console.log('Patients table created or already exists');
      });

      // Create insurance table
      db.run(`
        CREATE TABLE IF NOT EXISTS insurance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          provider TEXT NOT NULL,
          policy_number TEXT NOT NULL,
          group_number TEXT NOT NULL,
          subscriber_name TEXT NOT NULL,
          card_image_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating insurance table:', err.message);
          reject(err);
          return;
        }
        console.log('Insurance table created or already exists');
      });

      // Create clinical_forms table
      db.run(`
        CREATE TABLE IF NOT EXISTS clinical_forms (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          medical_history TEXT,
          current_medications TEXT,
          allergies TEXT,
          symptoms TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES patients (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating clinical_forms table:', err.message);
          reject(err);
          return;
        }
        console.log('Clinical forms table created or already exists');
      });

      // Create check_in_completions table for tracking completion status
      db.run(`
        CREATE TABLE IF NOT EXISTS check_in_completions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          patient_id INTEGER NOT NULL,
          completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          email_sent BOOLEAN DEFAULT FALSE,
          estimated_wait_time INTEGER DEFAULT 20,
          FOREIGN KEY (patient_id) REFERENCES patients (id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating check_in_completions table:', err.message);
          reject(err);
          return;
        }
        console.log('Check-in completions table created or already exists');
        resolve();
      });
    });
  });
};

module.exports = {
  db,
  initializeDatabase
};