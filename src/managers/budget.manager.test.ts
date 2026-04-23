/**
 * Budget Calculator Manager Tests
 * 
 * Unit tests for budget calculation functionality
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.6
 */

import { budgetCalculator } from './budget.manager';

describe('BudgetCalculator', () => {
  describe('calculateDailyBudget', () => {
    it('should calculate daily budget correctly for a multi-day period', () => {
      // Test case: $100 over 10 days = $10 per day
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-10');
      const availableAmount = 100;

      const result = budgetCalculator.calculateDailyBudget(availableAmount, startDate, endDate);

      expect(result.dailyBudget).toBe(10);
      expect(result.availableAmount).toBe(100);
      expect(result.numberOfDays).toBe(10);
      expect(result.startDate).toEqual(startDate);
      expect(result.endDate).toEqual(endDate);
    });

    it('should handle single-day period (same start and end date)', () => {
      // Edge case: same day period should be treated as 1 day
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');
      const availableAmount = 50;

      const result = budgetCalculator.calculateDailyBudget(availableAmount, startDate, endDate);

      expect(result.dailyBudget).toBe(50);
      expect(result.numberOfDays).toBe(1);
    });

    it('should handle zero available amount', () => {
      // Edge case: zero budget
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      const availableAmount = 0;

      const result = budgetCalculator.calculateDailyBudget(availableAmount, startDate, endDate);

      expect(result.dailyBudget).toBe(0);
      expect(result.availableAmount).toBe(0);
    });

    it('should handle decimal amounts correctly', () => {
      // Test case: $100 over 3 days = $33.333... per day
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-03');
      const availableAmount = 100;

      const result = budgetCalculator.calculateDailyBudget(availableAmount, startDate, endDate);

      expect(result.dailyBudget).toBeCloseTo(33.333333, 5);
      expect(result.numberOfDays).toBe(3);
    });

    it('should throw error for negative available amount', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-05');
      const availableAmount = -100;

      expect(() => {
        budgetCalculator.calculateDailyBudget(availableAmount, startDate, endDate);
      }).toThrow('Available amount cannot be negative');
    });

    it('should throw error when end date is before start date', () => {
      const startDate = new Date('2024-01-10');
      const endDate = new Date('2024-01-05');
      const availableAmount = 100;

      expect(() => {
        budgetCalculator.calculateDailyBudget(availableAmount, startDate, endDate);
      }).toThrow('End date must be on or after start date');
    });

    it('should recalculate correctly when parameters change', () => {
      // Test recalculation with different parameters
      const startDate1 = new Date('2024-01-01');
      const endDate1 = new Date('2024-01-10');
      const amount1 = 100;

      const result1 = budgetCalculator.calculateDailyBudget(amount1, startDate1, endDate1);
      expect(result1.dailyBudget).toBe(10);

      // Change amount
      const amount2 = 200;
      const result2 = budgetCalculator.calculateDailyBudget(amount2, startDate1, endDate1);
      expect(result2.dailyBudget).toBe(20);

      // Change date range
      const endDate2 = new Date('2024-01-20');
      const result3 = budgetCalculator.calculateDailyBudget(amount1, startDate1, endDate2);
      expect(result3.dailyBudget).toBe(5);
    });
  });

  describe('getDaysInPeriod', () => {
    it('should calculate days correctly for a multi-day period', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-10');

      const days = budgetCalculator.getDaysInPeriod(startDate, endDate);

      // Jan 1 to Jan 10 is 10 days (inclusive)
      expect(days).toBe(10);
    });

    it('should return 1 for same day period', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');

      const days = budgetCalculator.getDaysInPeriod(startDate, endDate);

      expect(days).toBe(1);
    });

    it('should handle leap year correctly', () => {
      // 2024 is a leap year, February has 29 days
      const startDate = new Date('2024-02-01');
      const endDate = new Date('2024-02-29');

      const days = budgetCalculator.getDaysInPeriod(startDate, endDate);

      // Feb 1 to Feb 29 in leap year is 29 days
      expect(days).toBe(29);
    });

    it('should handle non-leap year correctly', () => {
      // 2023 is not a leap year, February has 28 days
      const startDate = new Date('2023-02-01');
      const endDate = new Date('2023-02-28');

      const days = budgetCalculator.getDaysInPeriod(startDate, endDate);

      // Feb 1 to Feb 28 in non-leap year is 28 days
      expect(days).toBe(28);
    });

    it('should handle month boundaries correctly', () => {
      const startDate = new Date('2024-01-31');
      const endDate = new Date('2024-02-01');

      const days = budgetCalculator.getDaysInPeriod(startDate, endDate);

      // Jan 31 to Feb 1 is 2 days
      expect(days).toBe(2);
    });

    it('should handle year boundaries correctly', () => {
      const startDate = new Date('2023-12-31');
      const endDate = new Date('2024-01-01');

      const days = budgetCalculator.getDaysInPeriod(startDate, endDate);

      // Dec 31 to Jan 1 is 2 days
      expect(days).toBe(2);
    });

    it('should handle long periods correctly', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-12-31');

      const days = budgetCalculator.getDaysInPeriod(startDate, endDate);

      // Full year 2024 (leap year) is 366 days
      expect(days).toBe(366);
    });
  });
});
