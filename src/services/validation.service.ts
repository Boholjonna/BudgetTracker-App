/**
 * Validation Service
 * 
 * Provides centralized input validation logic for the Budget Tracker App.
 * Requirements: 1.1, 2.1, 4.1, 10.1, 10.2
 */

import { ValidationResult } from '../models';

/**
 * Validates that a string input represents a positive number (greater than zero).
 * 
 * Requirements: 1.1, 2.1, 10.1
 * 
 * @param input - The string to validate as a positive number
 * @returns ValidationResult indicating if the input is valid and any error message
 */
export function validatePositiveNumber(input: string): ValidationResult {
  // Check for empty or whitespace-only input
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: 'Amount cannot be empty',
    };
  }

  // Check if the input is a valid number
  const numValue = Number(input);
  
  if (isNaN(numValue)) {
    return {
      isValid: false,
      error: 'Amount must be a valid number',
    };
  }

  // Check if the number is positive (greater than zero)
  if (numValue <= 0) {
    return {
      isValid: false,
      error: 'Amount must be greater than zero',
    };
  }

  // Check for infinity
  if (!isFinite(numValue)) {
    return {
      isValid: false,
      error: 'Amount must be a finite number',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates that a string input is not empty and contains at least one non-whitespace character.
 * 
 * Requirements: 4.1
 * 
 * @param input - The string to validate as non-empty
 * @returns ValidationResult indicating if the input is valid and any error message
 */
export function validateNonEmptyString(input: string): ValidationResult {
  // Check if input is null, undefined, or empty after trimming
  if (!input || input.trim() === '') {
    return {
      isValid: false,
      error: 'Input cannot be empty or contain only whitespace',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates that a date range is valid (start date is before or equal to end date).
 * 
 * Requirements: 10.2
 * 
 * @param startDate - The start date of the range
 * @param endDate - The end date of the range
 * @returns ValidationResult indicating if the date range is valid and any error message
 */
export function validateDateRange(startDate: Date, endDate: Date): ValidationResult {
  // Check if dates are valid Date objects
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
    return {
      isValid: false,
      error: 'Start date is not a valid date',
    };
  }

  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
    return {
      isValid: false,
      error: 'End date is not a valid date',
    };
  }

  // Check if start date is before or equal to end date
  if (startDate.getTime() > endDate.getTime()) {
    return {
      isValid: false,
      error: 'Start date must be before or equal to end date',
    };
  }

  return {
    isValid: true,
  };
}
