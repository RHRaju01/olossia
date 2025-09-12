/**
 * Validation Utilities
 * Enterprise-grade validation functions for forms and data
 */

import { REGEX_PATTERNS } from '../constants/index.js';

/**
 * Validates an email address
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidEmail = email => {
  if (!email || typeof email !== 'string') return false;
  return REGEX_PATTERNS.EMAIL.test(email.trim());
};

/**
 * Validates a password
 * @param {string} password - The password to validate
 * @returns {object} Validation result with isValid and errors
 */
export const validatePassword = password => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates a phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidPhone = phone => {
  if (!phone || typeof phone !== 'string') return false;
  return REGEX_PATTERNS.PHONE.test(phone.replace(/\s/g, ''));
};

/**
 * Validates a postal/zip code
 * @param {string} postalCode - The postal code to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidPostalCode = postalCode => {
  if (!postalCode || typeof postalCode !== 'string') return false;
  return REGEX_PATTERNS.POSTAL_CODE.test(postalCode);
};

/**
 * Validates a credit card number
 * @param {string} cardNumber - The card number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidCreditCard = cardNumber => {
  if (!cardNumber || typeof cardNumber !== 'string') return false;
  const cleaned = cardNumber.replace(/\s/g, '');
  return REGEX_PATTERNS.CREDIT_CARD.test(cleaned) && luhnCheck(cleaned);
};

/**
 * Luhn algorithm for credit card validation
 * @param {string} cardNumber - The card number to check
 * @returns {boolean} True if valid, false otherwise
 */
const luhnCheck = cardNumber => {
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

/**
 * Validates CVV code
 * @param {string} cvv - The CVV to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidCVV = cvv => {
  if (!cvv || typeof cvv !== 'string') return false;
  return REGEX_PATTERNS.CVV.test(cvv);
};

/**
 * Validates required fields in an object
 * @param {object} data - The data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object} Validation result with isValid and errors
 */
export const validateRequiredFields = (data, requiredFields) => {
  const errors = {};
  let isValid = true;
  
  requiredFields.forEach(field => {
    if (!data[field] || (typeof data[field] === 'string' && !data[field].trim())) {
      errors[field] = 'This field is required';
      isValid = false;
    }
  });
  
  return { isValid, errors };
};

/**
 * Validates a form object with custom validators
 * @param {object} data - The form data to validate
 * @param {object} validators - Object with field validators
 * @returns {object} Validation result with isValid and errors
 */
export const validateForm = (data, validators) => {
  const errors = {};
  let isValid = true;
  
  Object.keys(validators).forEach(field => {
    const validator = validators[field];
    const value = data[field];
    
    if (typeof validator === 'function') {
      const result = validator(value);
      if (result !== true) {
        errors[field] = result;
        isValid = false;
      }
    } else if (Array.isArray(validator)) {
      // Multiple validators for a field
      for (const validatorFn of validator) {
        const result = validatorFn(value);
        if (result !== true) {
          errors[field] = result;
          isValid = false;
          break;
        }
      }
    }
  });
  
  return { isValid, errors };
};

/**
 * Sanitizes HTML content to prevent XSS
 * @param {string} html - The HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHtml = html => {
  if (!html || typeof html !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Validates URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidUrl = url => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates file type and size
 * @param {File} file - The file to validate
 * @param {object} options - Validation options
 * @returns {object} Validation result
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push('File is required');
    return { isValid: false, errors };
  }
  
  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  validatePassword,
  isValidPhone,
  isValidPostalCode,
  isValidCreditCard,
  isValidCVV,
  validateRequiredFields,
  validateForm,
  sanitizeHtml,
  isValidUrl,
  validateFile,
};
