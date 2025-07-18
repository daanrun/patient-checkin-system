const { db } = require('../database/db');

class CheckInCompletion {
  // Create a check-in completion record
  static create(completionData) {
    return new Promise((resolve, reject) => {
      const { patient_id, estimated_wait_time = 20 } = completionData;
      
      const sql = `
        INSERT INTO check_in_completions (patient_id, estimated_wait_time)
        VALUES (?, ?)
      `;
      
      db.run(sql, [patient_id, estimated_wait_time], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, patient_id, estimated_wait_time, completed_at: new Date().toISOString() });
        }
      });
    });
  }

  // Get completion by patient ID
  static getByPatientId(patient_id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM check_in_completions WHERE patient_id = ?';
      
      db.get(sql, [patient_id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Update email sent status
  static markEmailSent(patient_id) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE check_in_completions SET email_sent = TRUE WHERE patient_id = ?';
      
      db.run(sql, [patient_id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ updated: this.changes > 0 });
        }
      });
    });
  }

  // Get all completions with patient info
  static getAllWithPatientInfo() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT cc.*, p.first_name, p.last_name, p.email, p.phone
        FROM check_in_completions cc
        JOIN patients p ON cc.patient_id = p.id
        ORDER BY cc.completed_at DESC
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
}

module.exports = CheckInCompletion;