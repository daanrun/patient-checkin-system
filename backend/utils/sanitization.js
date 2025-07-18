const validator = require('validator');
const xss = require('xss');

/**
 * Sanitize and validate input data
 */
class InputSanitizer {
  /**
   * Sanitize string input by removing XSS and trimming
   */
  static sanitizeString(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    // Remove XSS attempts and trim whitespace
    return xss(validator.escape(input.trim()));
  }

  /**
   * Sanitize email input
   */
  static sanitizeEmail(email) {
    if (typeof email !== 'string') {
      return email;
    }
    
    const sanitized = email.trim().toLowerCase();
    return validator.isEmail(sanitized) ? sanitized : null;
  }

  /**
   * Sanitize phone number input
   */
  static sanitizePhone(phone) {
    if (typeof phone !== 'string') {
      return phone;
    }
    
    // Remove all non-digit characters except + and -
    const cleaned = phone.replace(/[^\d+\-\s()]/g, '');
    return cleaned.trim();
  }

  /**
   * Sanitize numeric input
   */
  static sanitizeNumber(input, options = {}) {
    const { min, max, isInteger = false } = options;
    
    if (typeof input === 'number') {
      if (isInteger && !Number.isInteger(input)) {
        return null;
      }
      if (min !== undefined && input < min) {
        return null;
      }
      if (max !== undefined && input > max) {
        return null;
      }
      return input;
    }
    
    if (typeof input === 'string') {
      const parsed = isInteger ? parseInt(input, 10) : parseFloat(input);
      if (isNaN(parsed)) {
        return null;
      }
      return this.sanitizeNumber(parsed, options);
    }
    
    return null;
  }

  /**
   * Sanitize date input
   */
  static sanitizeDate(dateInput) {
    if (!dateInput) {
      return null;
    }
    
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      return null;
    }
    
    // Check if date is reasonable (not too far in past or future)
    const now = new Date();
    const minDate = new Date(now.getFullYear() - 150, 0, 1); // 150 years ago
    const maxDate = new Date(now.getFullYear() + 10, 11, 31); // 10 years from now
    
    if (date < minDate || date > maxDate) {
      return null;
    }
    
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  /**
   * Sanitize object by applying sanitization to all string properties
   */
  static sanitizeObject(obj, schema = {}) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    
    const sanitized = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const fieldSchema = schema[key] || {};
      
      switch (fieldSchema.type) {
        case 'email':
          sanitized[key] = this.sanitizeEmail(value);
          break;
        case 'phone':
          sanitized[key] = this.sanitizePhone(value);
          break;
        case 'number':
          sanitized[key] = this.sanitizeNumber(value, fieldSchema.options);
          break;
        case 'date':
          sanitized[key] = this.sanitizeDate(value);
          break;
        case 'string':
        default:
          sanitized[key] = this.sanitizeString(value);
          break;
      }
    }
    
    return sanitized;
  }

  /**
   * Validate required fields
   */
  static validateRequired(obj, requiredFields) {
    const missing = [];
    
    for (const field of requiredFields) {
      if (!obj[field] || (typeof obj[field] === 'string' && obj[field].trim() === '')) {
        missing.push(field);
      }
    }
    
    return missing;
  }
}

module.exports = InputSanitizer;