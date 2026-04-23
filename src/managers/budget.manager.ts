/**
 * Budget Calculator Manager
 * 
 * Handles daily budget calculations based on available funds and time periods.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { differenceInDays } from 'date-fns';
import { BudgetEstimate } from '../models';

/**
 * Budget Calculator Interface
 */
export interface BudgetCalculator {
  calculateDailyBudget(availableAmount: number, startDate: Date, endDate: Date): BudgetEstimate;
  getDaysInPeriod(startDate: Date, endDate: Date): number;
}

/**
 * Implementation of BudgetCalculator
 */
class BudgetCalculatorImpl implements BudgetCalculator {
  /**
   * Calculate daily budget based on available amount and time period
   * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
   * 
   * @param availableAmount - The total amount available for the period (must be positive)
   * @param startDate - The start date of the budget period
   * @param endDate - The end date of the budget period (must be >= startDate)
   * @returns BudgetEstimate containing daily budget and period details
   * @throws Error if availableAmount is negative or endDate is before startDate
   */
  calculateDailyBudget(availableAmount: number, startDate: Date, endDate: Date): BudgetEstimate {
    // Validate available amount is not negative
    if (availableAmount < 0) {
      throw new Error('Available amount cannot be negative');
    }

    // Validate date range
    if (endDate < startDate) {
      throw new Error('End date must be on or after start date');
    }

    // Calculate number of days in the period (inclusive)
    const numberOfDays = this.getDaysInPeriod(startDate, endDate);

    // Calculate daily budget
    // Handle edge case: if numberOfDays is 0 (same day), treat as 1 day
    const effectiveDays = numberOfDays === 0 ? 1 : numberOfDays;
    const dailyBudget = availableAmount / effectiveDays;

    return {
      dailyBudget,
      availableAmount,
      startDate,
      endDate,
      numberOfDays: effectiveDays,
    };
  }

  /**
   * Get the number of days in a period (inclusive)
   * Requirements: 3.1, 3.2
   * 
   * Uses date-fns to handle edge cases like leap years correctly.
   * 
   * @param startDate - The start date of the period
   * @param endDate - The end date of the period
   * @returns The number of days between the dates (inclusive)
   */
  getDaysInPeriod(startDate: Date, endDate: Date): number {
    // Use date-fns differenceInDays which handles leap years correctly
    // differenceInDays returns the difference in calendar days
    const daysDifference = differenceInDays(endDate, startDate);
    
    // Add 1 to make it inclusive (e.g., Jan 1 to Jan 3 is 3 days, not 2)
    return daysDifference + 1;
  }
}

/**
 * Singleton instance of the budget calculator
 */
export const budgetCalculator = new BudgetCalculatorImpl();
