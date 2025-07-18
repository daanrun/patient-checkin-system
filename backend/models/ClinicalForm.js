const { db } = require('../database/db');

class ClinicalForm {
  // Create clinical form record
  static create(clinicalData) {
    return new Promise((resolve, reject) => {
      const { patient_id, medical_history, current_medications, allergies, symptoms } = clinicalData;
      
      const sql = `
        INSERT INTO clinical_forms (patient_id, medical_history, current_medications, allergies, symptoms)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [patient_id, medical_history, current_medications, allergies, symptoms], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...clinicalData });
        }
      });
    });
  }

  // Get clinical form by patient ID
  static getByPatientId(patient_id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM clinical_forms WHERE patient_id = ?';
      
      db.get(sql, [patient_id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get clinical form by ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM clinical_forms WHERE id = ?';
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get all clinical forms
  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT cf.*, p.first_name, p.last_name 
        FROM clinical_forms cf 
        JOIN patients p ON cf.patient_id = p.id 
        ORDER BY cf.created_at DESC
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Update clinical form
  static update(id, clinicalData) {
    return new Promise((resolve, reject) => {
      const { medical_history, current_medications, allergies, symptoms } = clinicalData;
      
      const sql = `
        UPDATE clinical_forms 
        SET medical_history = ?, current_medications = ?, allergies = ?, symptoms = ?
        WHERE id = ?
      `;
      
      db.run(sql, [medical_history, current_medications, allergies, symptoms, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...clinicalData });
        }
      });
    });
  }

  // Delete clinical form
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM clinical_forms WHERE id = ?';
      
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

module.exports = ClinicalForm;