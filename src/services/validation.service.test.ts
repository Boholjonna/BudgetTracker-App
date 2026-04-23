/**
 * Unit Tests for Validation Service
 * 
 * Tests edge cases for validation functions.
 * Requirements: 1.1, 2.1, 4.1, 10.1, 10.2
 */

import {
  validatePositiveNumber,
  validateNonEmptyString,
  validateDateRange,
} from './validation.service';

describe('Validation Service', () => {
  describe('validatePositiveNumber', () => {
    it('should accept valid positive integers', () => {
      const result = validatePositiveNumber('42');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept valid positive decimals', () => {
      const result = validatePositiveNumber('3.14');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept very small positive numbers', () => {
      const result = validatePositiveNumber('0.01');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject zero', () => {
      const result = validatePositiveNumber('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than zero');
    });

    it('should reject negative numbers', () => {
      const result = validatePositiveNumber('-5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than zero');
    });

    it('should reject negative decimals', () => {
      const result = validatePositiveNumber('-0.5');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than zero');
    });

    it('should reject empty string', () => {
      const result = validatePositiveNumber('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount cannot be empty');
    });

    it('should reject whitespace-only string', () => {
      const result = validatePositiveNumber('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount cannot be empty');
    });

    it('should reject non-numeric strings', () => {
      const result = validatePositiveNumber('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a valid number');
    });

    it('should reject strings with invalid characters', () => {
      const result = validatePositiveNumber('12.34.56');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a valid number');
    });

    it('should reject infinity', () => {
      const result = validatePositiveNumber('Infinity');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a finite number');
    });
  });

  describe('validateNonEmptyString', () => {
    it('should accept valid non-empty strings', () => {
      const result = validateNonEmptyString('Food');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept strings with leading/trailing spaces', () => {
      const result = validateNonEmptyString('  Transport  ');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept strings with special characters', () => {
      const result = validateNonEmptyString('Food & Drinks');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty string', () => {
      const result = validateNonEmptyString('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input cannot be empty or contain only whitespace');
    });

    it('should reject whitespace-only string', () => {
      const result = validateNonEmptyString('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input cannot be empty or contain only whitespace');
    });

    it('should reject string with only tabs', () => {
      const result = validateNonEmptyString('\t\t');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input cannot be empty or contain only whitespace');
    });

    it('should reject string with only newlines', () => {
      const result = validateNonEmptyString('\n\n');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input cannot be empty or contain only whitespace');
    });
  });

  describe('validateDateRange', () => {
    it('should accept valid date range with start before end', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept date range with equal start and end dates', () => {
      const date = new Date('2024-01-15');
      const result = validateDateRange(date, date);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should accept date range spanning multiple years', () => {
      const startDate = new Date('2023-12-01');
      const endDate = new Date('2024-02-28');
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject inverted date range (end before start)', () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-01-01');
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Start date must be before or equal to end date');
    });

    it('should reject invalid start date', () => {
      const startDate = new Date('invalid');
      const endDate = new Date('2024-01-31');
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Start date is not a valid date');
    });

    it('should reject invalid end date', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('invalid');
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('End date is not a valid date');
    });

    it('should reject both invalid dates', () => {
      const startDate = new Date('invalid');
      const endDate = new Date('also invalid');
      const result = validateDateRange(startDate, endDate);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Start date is not a valid date');
    });
  });
});
