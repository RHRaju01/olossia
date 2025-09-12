/**
 * Formatting Utilities
 * Enterprise-grade formatting functions for display
 */

import { ECOMMERCE_CONFIG } from '../config/index.js';

/**
 * Formats a price with currency symbol
 * @param {number} price - The price to format
 * @param {string} currency - The currency code (default: USD)
 * @param {string} locale - The locale for formatting (default: en-US)
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, currency = 'USD', locale = 'en-US') => {
  if (typeof price !== 'number' || isNaN(price)) {
    return `${ECOMMERCE_CONFIG.CURRENCY.SYMBOL}0.00`;
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Formats a number with thousand separators
 * @param {number} number - The number to format
 * @param {string} locale - The locale for formatting (default: en-US)
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, locale = 'en-US') => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  return new Intl.NumberFormat(locale).format(number);
};

/**
 * Formats a date in various formats
 * @param {Date|string|number} date - The date to format
 * @param {string} format - The format type (short, medium, long, time)
 * @param {string} locale - The locale for formatting (default: en-US)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'medium', locale = 'en-US') => {
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    medium: { year: 'numeric', month: 'long', day: 'numeric' },
    long: { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    },
    time: { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    },
    datetime: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  };
  
  return new Intl.DateTimeFormat(locale, options[format] || options.medium)
    .format(dateObj);
};

/**
 * Formats a relative time (e.g., "2 hours ago")
 * @param {Date|string|number} date - The date to format
 * @param {string} locale - The locale for formatting (default: en-US)
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date, locale = 'en-US') => {
  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2628000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count !== 0) {
      return rtf.format(-count, interval.label);
    }
  }
  
  return rtf.format(0, 'second');
};

/**
 * Formats a phone number for display
 * @param {string} phone - The phone number to format
 * @param {string} format - The format type (default: (xxx) xxx-xxxx)
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone, format = 'us') => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (format === 'us' && cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  if (format === 'international' && cleaned.length >= 10) {
    const countryCode = cleaned.slice(0, -10);
    const number = cleaned.slice(-10);
    return `+${countryCode} (${number.slice(0, 3)}) ${number.slice(3, 6)}-${number.slice(6)}`;
  }
  
  return phone;
};

/**
 * Formats a credit card number for display
 * @param {string} cardNumber - The card number to format
 * @param {boolean} mask - Whether to mask the number (default: false)
 * @returns {string} Formatted card number
 */
export const formatCreditCard = (cardNumber, mask = false) => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\D/g, '');
  
  if (mask && cleaned.length >= 4) {
    const lastFour = cleaned.slice(-4);
    const masked = '*'.repeat(cleaned.length - 4);
    return `${masked.replace(/(.{4})/g, '$1 ').trim()} ${lastFour}`;
  }
  
  return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Formats a percentage value
 * @param {number} value - The value to format as percentage
 * @param {number} decimals - Number of decimal places (default: 1)
 * @param {string} locale - The locale for formatting (default: en-US)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1, locale = 'en-US') => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

/**
 * Formats file size in human-readable format
 * @param {number} bytes - The size in bytes
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Truncates text to a specified length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length (default: 100)
 * @param {string} suffix - Suffix to add when truncated (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Capitalizes the first letter of each word
 * @param {string} text - The text to capitalize
 * @returns {string} Capitalized text
 */
export const capitalizeWords = text => {
  if (!text || typeof text !== 'string') return '';
  
  return text.replace(/\w\S*/g, word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
};

/**
 * Converts camelCase to kebab-case
 * @param {string} text - The camelCase text
 * @returns {string} kebab-case text
 */
export const camelToKebab = text => {
  if (!text || typeof text !== 'string') return '';
  
  return text.replace(/([A-Z])/g, '-$1').toLowerCase();
};

/**
 * Converts kebab-case to camelCase
 * @param {string} text - The kebab-case text
 * @returns {string} camelCase text
 */
export const kebabToCamel = text => {
  if (!text || typeof text !== 'string') return '';
  
  return text.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

/**
 * Generates initials from a name
 * @param {string} name - The full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} Initials
 */
export const getInitials = (name, maxInitials = 2) => {
  if (!name || typeof name !== 'string') return '';
  
  return name
    .split(' ')
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
};

export default {
  formatPrice,
  formatNumber,
  formatDate,
  formatRelativeTime,
  formatPhoneNumber,
  formatCreditCard,
  formatPercentage,
  formatFileSize,
  truncateText,
  capitalizeWords,
  camelToKebab,
  kebabToCamel,
  getInitials,
};
