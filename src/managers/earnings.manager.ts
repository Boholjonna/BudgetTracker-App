/**
 * Earnings Manager
 * 
 * Handles income entry creation, validation, and retrieval.
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { EarningEntry, ValidationResult } from '../models';
import { storageService } from '../services/storage.service';
import { validatePositiveNumber } from '../services/validation.service';
import { generateUUID } from '../utils/uuid';

/**
 * Earnings Manager Interface
 */
export interface EarningsManager {
  addEarning(amount: number): Promise<EarningEntry>;
  validateAmount(amount: string): ValidationResult;
  getTotalEarnings(): Promise<number>;
}

/**
 * Implementation of EarningsManager
 */
class EarningsManagerImpl implements EarningsManager {
  /**
   * Add a new earning entry
   * Requirements: 1.1, 1.2, 1.3, 1.4
   * 
   * @param amount - The earning amount (must be positive)
   * @returns The created earning entry
   * @throws Error if amount is not positive or storage fails
   */
  async addEarning(amount: number): Promise<EarningEntry> {
    // Validate amount is positive
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    // Generate unique ID using expo-crypto
    const id = generateUUID();

    // Generate timestamp (Unix timestamp in milliseconds)
    const timestamp = Date.now();

    // Create earning entry
    const entry: EarningEntry = {
      id,
      amount,
      timestamp,
    };

    // Store entry in local storage
    await storageService.saveEarning(entry);

    return entry;
  }

  /**
   * Validate an amount string input
   * Requirements: 1.1
   * 
   * @param amount - The amount string to validate
   * @returns ValidationResult indicating if the input is valid
   */
  validateAmount(amount: string): ValidationResult {
    return validatePositiveNumber(amount);
  }

  /**
   * Get the total of all earnings
   * Requirements: 1.3
   * 
   * @returns The sum of all earning amounts
   */
  async getTotalEarnings(): Promise<number> {
    const earnings = await storageService.getAllEarnings();
    return earnings.reduce((total, entry) => total + entry.amount, 0);
  }
}

/**
 * Singleton instance of the earnings manager
 */
export const earningsManager = new EarningsManagerImpl();
