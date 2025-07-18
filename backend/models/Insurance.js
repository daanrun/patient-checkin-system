const { db } = require('../database/db');

class Insurance {
  // Create insurance record
  static create(insuranceData) {
    return new Promise((resolve, reject) => {
      const { patient_id, provider, policy_number, group_number, subscriber_name, card_image_path } = insuranceData;
      
      const sql = `
        INSERT INTO insurance (patient_id, provider, policy_number, group_number, subscriber_name, card_image_path)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [patient_id, provider, policy_number, group_number, subscriber_name, card_image_path], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...insuranceData });
        }
      });
    });
  }

  // Get insurance by patient ID
  static getByPatientId(patient_id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM insurance WHERE patient_id = ?';
      
      db.get(sql, [patient_id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get insurance by ID
  static getById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM insurance WHERE id = ?';
      
      db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Get all insurance records
  static getAll() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT i.*, p.first_name, p.last_name 
        FROM insurance i 
        JOIN patients p ON i.patient_id = p.id 
        ORDER BY i.created_at DESC
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

  // Update insurance record
  static update(id, insuranceData) {
    return new Promise((resolve, reject) => {
      const { provider, policy_number, group_number, subscriber_name, card_image_path } = insuranceData;
      
      const sql = `
        UPDATE insurance 
        SET provider = ?, policy_number = ?, group_number = ?, subscriber_name = ?, card_image_path = ?
        WHERE id = ?
      `;
      
      db.run(sql, [provider, policy_number, group_number, subscriber_name, card_image_path, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, ...insuranceData });
        }
      });
    });
  }

  // Delete insurance record
  static delete(id) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM insurance WHERE id = ?';
      
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

module.exports = Insurance;