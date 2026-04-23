/**
 * Data Manager
 * 
 * Handles data deletion operations and date range filtering.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

import { DeletionResult, EntryCount, EarningEntry, ExpenseEntry } from '../models';
import { storageService } from '../services/storage.service';
import { earningsManager } from './earnings.manager';
import { expenseTracker } from './expense.manager';

/**
 * Data Manager Interface
 */
export interface DataManager {
  deleteByMonth(year: number, month: number): Promise<DeletionResult>;
  deleteByDateRange(startDate: Date, endDate: Date): Promise<DeletionResult>;
  getEntriesInRange(startDate: Date, endDate: Date): Promise<EntryCount>;
}

/**
 * Implementation of DataManager
 */
class DataManagerImpl implements DataManager {
  /**
   * Delete all entries from a specific month
   * Requirements: 6.1, 6.3, 6.4, 6.5, 6.6
   * 
   * @param year - The year (e.g., 2024)
   * @param month - The month (1-12, where 1 = January)
   * @returns DeletionResult with counts and recalculated funds
   */
  async deleteByMonth(year: number, month: number): Promise<DeletionResult> {
    // Create date range for the entire month
    // month is 1-based (1 = January), but Date constructor expects 0-based
    const startDate = new Date(year, month - 1, 1);
    
    // Get the last day of the month by going to the first day of next month and subtracting 1 day
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    // Use deleteByDateRange to perform the actual deletion
    return this.deleteByDateRange(startDate, endDate);
  }

  /**
   * Delete all entries within a custom date range
   * Requirements: 6.2, 6.3, 6.4, 6.5, 6.7
   * 
   * @param startDate - The start date of the range (inclusive)
   * @param endDate - The end date of the range (inclusive)
   * @returns DeletionResult with counts and recalculated funds
   */
  async deleteByDateRange(startDate: Date, endDate: Date): Promise<DeletionResult> {
    // Get all entries
    const allEarnings = await storageService.getAllEarnings();
    const allExpenses = await storageService.getAllExpenses();

    // Filter entries within the date range
    const earningsToDelete = this.filterEntriesInRange(allEarnings, startDate, endDate);
    const expensesToDelete = this.filterEntriesInRange(allExpenses, startDate, endDate);

    // Extract IDs of entries to delete
    const earningIdsToDelete = earningsToDelete.map(entry => entry.id);
    const expenseIdsToDelete = expensesToDelete.map(entry => entry.id);

    // Delete the entries from storage (Requirement 6.3)
    await storageService.deleteEarnings(earningIdsToDelete);
    await storageService.deleteExpenses(expenseIdsToDelete);

    // Recalculate available funds based on remaining entries (Requirement 6.4)
    const totalEarnings = await earningsManager.getTotalEarnings();
    const totalExpenses = await expenseTracker.getTotalExpenses();
    const newAvailableFunds = totalEarnings - totalExpenses;

    return {
      deletedEarnings: earningsToDelete.length,
      deletedExpenses: expensesToDelete.length,
      newAvailableFunds,
    };
  }

  /**
   * Get count of entries within a date range (for confirmation prompts)
   * Requirements: 6.5
   * 
   * @param startDate - The start date of the range (inclusive)
   * @param endDate - The end date of the range (inclusive)
   * @returns EntryCount with number of earnings and expenses in range
   */
  async getEntriesInRange(startDate: Date, endDate: Date): Promise<EntryCount> {
    // Get all entries
    const allEarnings = await storageService.getAllEarnings();
    const allExpenses = await storageService.getAllExpenses();

    // Filter entries within the date range
    const earningsInRange = this.filterEntriesInRange(allEarnings, startDate, endDate);
    const expensesInRange = this.filterEntriesInRange(allExpenses, startDate, endDate);

    return {
      earnings: earningsInRange.length,
      expenses: expensesInRange.length,
    };
  }

  /**
   * Filter entries by timestamp range
   * Helper method to identify entries within a date range
   * 
   * @param entries - Array of entries with timestamp property
   * @param startDate - The start date of the range (inclusive)
   * @param endDate - The end date of the range (inclusive)
   * @returns Filtered array of entries within the range
   */
  private filterEntriesInRange<T extends { timestamp: number }>(
    entries: T[],
    startDate: Date,
    endDate: Date
  ): T[] {
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();

    return entries.filter(entry => {
      return entry.timestamp >= startTimestamp && entry.timestamp <= endTimestamp;
    });
  }
}

/**
 * Singleton instance of the data manager
 */
export const dataManager = new DataManagerImpl();
