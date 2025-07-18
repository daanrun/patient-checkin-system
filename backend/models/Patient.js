const { db } = require('../database/db');

class Patient {
  // Create a new patient
  static create(patientData) {
    return new Promise((resolve, reject) => {
      const { first_name, last_name, date_of_birth, address, phone, email } = patientData;
      
      const sql = `
        INSERT INTO patients (first_name, last_name, date_of_birth, address, phone, email)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [first_name, last_name, date_of_birth, address, phone, email], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...patientData });
        }
      });
    });
  }

  // Get patient by ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM patients WHERE id = ?';
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get all patients
  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM patients ORDER BY created_at DESC';
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Update patient
  static update(id, patientData) {
    return new Promise((resolve, reject) => {
      const { first_name, last_name, date_of_birth, address, phone, email } = patientData;
      
      const sql = `
        UPDATE patients 
        SET first_name = ?, last_name = ?, date_of_birth = ?, address = ?, phone = ?, email = ?
        WHERE id = ?
      `;
      
      db.run(sql, [first_name, last_name, date_of_birth, address, phone, email, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...patientData });
        }
      });
    });
  }

  // Delete patient
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM patients WHERE id = ?';
      
      db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deletedRows: this.changes });
        }
      });
    });
  }
}

module.exports = Patient;