/**
 * Data Manager Unit Tests
 * 
 * Tests for data manager functionality
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { dataManager } from './data.manager';
import { storageService } from '../services/storage.service';
import { earningsManager } from './earnings.manager';
import { expenseTracker } from './expense.manager';
import { EarningEntry, ExpenseEntry } from '../models';

// Mock the storage service
jest.mock('../services/storage.service', () => ({
  storageService: {
    getAllEarnings: jest.fn(),
    getAllExpenses: jest.fn(),
    deleteEarnings: jest.fn(),
    deleteExpenses: jest.fn(),
  },
}));

// Mock the earnings manager
jest.mock('./earnings.manager', () => ({
  earningsManager: {
    getTotalEarnings: jest.fn(),
  },
}));

// Mock the expense tracker
jest.mock('./expense.manager', () => ({
  expenseTracker: {
    getTotalExpenses: jest.fn(),
  },
}));

describe('DataManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteByMonth', () => {
    it('should delete all entries from a specific month', async () => {
      // Setup: Create entries for January 2024
      const earningsInJan: EarningEntry[] = [
        { id: 'e1', amount: 100, timestamp: new Date(2024, 0, 5).getTime() },
        { id: 'e2', amount: 200, timestamp: new Date(2024, 0, 15).getTime() },
      ];

      const expensesInJan: ExpenseEntry[] = [
        { id: 'ex1', amount: 50, categoryId: 'cat1', timestamp: new Date(2024, 0, 10).getTime() },
      ];

      const earningsOutsideJan: EarningEntry[] = [
        { id: 'e3', amount: 300, timestamp: new Date(2024, 1, 5).getTime() }, // February
      ];

      const expensesOutsideJan: ExpenseEntry[] = [
        { id: 'ex2', amount: 75, categoryId: 'cat1', timestamp: new Date(2023, 11, 25).getTime() }, // December 2023
      ];

      (storageService.getAllEarnings as jest.Mock).mockResolvedValue([
        ...earningsInJan,
        ...earningsOutsideJan,
      ]);

      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([
        ...expensesInJan,
        ...expensesOutsideJan,
      ]);

      // After deletion, only entries outside January remain
      (earningsManager.getTotalEarnings as jest.Mock).mockResolvedValue(300);
      (expenseTracker.getTotalExpenses as jest.Mock).mockResolvedValue(75);

      // Execute: Delete January 2024 (month 1)
      const result = await dataManager.deleteByMonth(2024, 1);

      // Verify: Correct entries were deleted
      expect(storageService.deleteEarnings).toHaveBeenCalledWith(['e1', 'e2']);
      expect(storageService.deleteExpenses).toHaveBeenCalledWith(['ex1']);

      // Verify: Result contains correct counts
      expect(result.deletedEarnings).toBe(2);
      expect(result.deletedExpenses).toBe(1);

      // Verify: Available funds recalculated (300 - 75 = 225)
      expect(result.newAvailableFunds).toBe(225);
    });

    it('should handle month with no entries', async () => {
      // Setup: No entries in March 2024
      (storageService.getAllEarnings as jest.Mock).mockResolvedValue([
        { id: 'e1', amount: 100, timestamp: new Date(2024, 1, 5).getTime() }, // February
      ]);

      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([
        { id: 'ex1', amount: 50, categoryId: 'cat1', timestamp: new Date(2024, 1, 10).getTime() }, // February
      ]);

      (earningsManager.getTotalEarnings as jest.Mock).mockResolvedValue(100);
      (expenseTracker.getTotalExpenses as jest.Mock).mockResolvedValue(50);

      // Execute: Delete March 2024 (month 3)
      const result = await dataManager.deleteByMonth(2024, 3);

      // Verify: No entries deleted
      expect(storageService.deleteEarnings).toHaveBeenCalledWith([]);
      expect(storageService.deleteExpenses).toHaveBeenCalledWith([]);

      expect(result.deletedEarnings).toBe(0);
      expect(result.deletedExpenses).toBe(0);
      expect(result.newAvailableFunds).toBe(50);
    });

    it('should handle December correctly', async () => {
      // Setup: Entries in December 2024
      const earningsInDec: EarningEntry[] = [
        { id: 'e1', amount: 500, timestamp: new Date(2024, 11, 1).getTime() },
        { id: 'e2', amount: 600, timestamp: new Date(2024, 11, 31, 23, 59, 59).getTime() },
      ];

      (storageService.getAllEarnings as jest.Mock).mockResolvedValue(earningsInDec);
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([]);

      (earningsManager.getTotalEarnings as jest.Mock).mockResolvedValue(0);
      (expenseTracker.getTotalExpenses as jest.Mock).mockResolvedValue(0);

      // Execute: Delete December 2024 (month 12)
      const result = await dataManager.deleteByMonth(2024, 12);

      // Verify: Both December entries deleted
      expect(storageService.deleteEarnings).toHaveBeenCalledWith(['e1', 'e2']);
      expect(result.deletedEarnings).toBe(2);
    });

    it('should handle leap year February correctly', async () => {
      // Setup: Entries in February 2024 (leap year - 29 days)
      const earningsInFeb: EarningEntry[] = [
        { id: 'e1', amount: 100, timestamp: new Date(2024, 1, 29).getTime() }, // Feb 29, 2024
      ];

      (storageService.getAllEarnings as jest.Mock).mockResolvedValue(earningsInFeb);
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([]);

      (earningsManager.getTotalEarnings as jest.Mock).mockResolvedValue(0);
      (expenseTracker.getTotalExpenses as jest.Mock).mockResolvedValue(0);

      // Execute: Delete February 2024 (month 2)
      const result = await dataManager.deleteByMonth(2024, 2);

      // Verify: February 29 entry deleted
      expect(storageService.deleteEarnings).toHaveBeenCalledWith(['e1']);
      expect(result.deletedEarnings).toBe(1);
    });
  });

  describe('deleteByDateRange', () => {
    it('should delete entries within custom date range', async () => {
      // Setup: Entries across multiple dates
      const earnings: EarningEntry[] = [
        { id: 'e1', amount: 100, timestamp: new Date(2024, 0, 5).getTime() },
        { id: 'e2', amount: 200, timestamp: new Date(2024, 0, 15).getTime() },
        { id: 'e3', amount: 300, timestamp: new Date(2024, 0, 25).getTime() },
      ];

      const expenses: ExpenseEntry[] = [
        { id: 'ex1', amount: 50, categoryId: 'cat1', timestamp: new Date(2024, 0, 8).getTime() },
        { id: 'ex2', amount: 75, categoryId: 'cat1', timestamp: new Date(2024, 0, 20).getTime() },
      ];

      (storageService.getAllEarnings as jest.Mock).mockResolvedValue(earnings);
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(expenses);

      // After deletion, only entries outside range remain
      (earningsManager.getTotalEarnings as jest.Mock).mockResolvedValue(300);
      (expenseTracker.getTotalExpenses as jest.Mock).mockResolvedValue(0);

      // Execute: Delete entries from Jan 10 to Jan 20, 2024
      const startDate = new Date(2024, 0, 10);
      const endDate = new Date(2024, 0, 20);
      const result = await dataManager.deleteByDateRange(startDate, endDate);

      // Verify: Only entries within range deleted (e2, ex2)
      // ex1 is on Jan 8, which is before Jan 10, so it should not be deleted
      expect(storageService.deleteEarnings).toHaveBeenCalledWith(['e2']);
      expect(storageService.deleteExpenses).toHaveBeenCalledWith(['ex2']);

      expect(result.deletedEarnings).toBe(1);
      expect(result.deletedExpenses).toBe(1);
      expect(result.newAvailableFunds).toBe(300);
    });

    it('should include entries on boundary dates (inclusive)', async () => {
      // Setup: Entries exactly on start and end dates
      const earnings: EarningEntry[] = [
        { id: 'e1', amount: 100, timestamp: new Date(2024, 0, 10, 0, 0, 0).getTime() }, // Start boundary
        { id: 'e2', amount: 200, timestamp: new Date(2024, 0, 20, 23, 59, 59).getTime() }, // End boundary
        { id: 'e3', amount: 300, timestamp: new Date(2024, 0, 9, 23, 59, 59).getTime() }, // Before start
        { id: 'e4', amount: 400, timestamp: new Date(2024, 0, 21, 0, 0, 0).getTime() }, // After end
      ];

      (storageService.getAllEarnings as jest.Mock).mockResolvedValue(earnings);
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([]);

      (earningsManager.getTotalEarnings as jest.Mock).mockResolvedValue(700);
      (expenseTracker.getTotalExpenses as jest.Mock).mockResolvedValue(0);

      // Execute: Delete from Jan 10 to Jan 20, 2024
      const startDate = new Date(2024, 0, 10, 0, 0, 0);
      const endDate = new Date(2024, 0, 20, 23, 59, 59);
      const result = await dataManager.deleteByDateRange(startDate, endDate);

      // Verify: Entries on boundaries included (e1, e2)
      expect(storageService.deleteEarnings).toHaveBeenCalledWith(['e1', 'e2']);
      expect(result.deletedEarnings).toBe(2);
    });

    it('should handle empty date range', async () => {
      // Setup: No entries in range
      (storageService.getAllEarnings as jest.Mock).mockResolvedValue([
        { id: 'e1', amount: 100, timestamp: new Date(2024, 0, 5).getTime() },
      ]);

      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([]);

      (earningsManager.getTotalEarnings as jest.Mock).mockResolvedValue(100);
      (expenseTracker.getTotalExpenses as jest.Mock).mockResolvedValue(0);

      // Execute: Delete from Jan 10 to Jan 20 (no entries in this range)
      const startDate = new Date(2024, 0, 10);
      const endDate = new Date(2024, 0, 20);
      const result = await dataManager.deleteByDateRange(startDate, endDate);

      // Verify: No entries deleted
      expect(storageService.deleteEarnings).toHaveBeenCalledWith([]);
      expect(storageService.deleteExpenses).toHaveBeenCalledWith([]);

      expect(result.deletedEarnings).toBe(0);
      expect(result.deletedExpenses).toBe(0);
      expect(result.newAvailableFunds).toBe(100);
    });

    it('should recalculate available funds after deletion', async () => {
      // Setup: Entries that will be deleted
      (storageService.getAllEarnings as jest.Mock).mockResolvedValue([
        { id: 'e1', amount: 1000, timestamp: new Date(2024, 0, 15).getTime() },
      ]);

      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([
        { id: 'ex1', amount: 300, categoryId: 'cat1', timestamp: new Date(2024, 0, 15).getTime() },
      ]);

      // After deletion, recalculated totals
      (earningsManager.getTotalEarnings as jest.Mock).mockResolvedValue(500);
      (expenseTracker.getTotalExpenses as jest.Mock).mockResolvedValue(200);

      // Execute
      const startDate = new Date(2024, 0, 10);
      const endDate = new Date(2024, 0, 20);
      const result = await dataManager.deleteByDateRange(startDate, endDate);

      // Verify: Available funds = 500 - 200 = 300
      expect(result.newAvailableFunds).toBe(300);
      expect(earningsManager.getTotalEarnings).toHaveBeenCalled();
      expect(expenseTracker.getTotalExpenses).toHaveBeenCalled();
    });
  });

  describe('getEntriesInRange', () => {
    it('should return count of entries in date range', async () => {
      // Setup: Entries across multiple dates
      const earnings: EarningEntry[] = [
        { id: 'e1', amount: 100, timestamp: new Date(2024, 0, 5).getTime() },
        { id: 'e2', amount: 200, timestamp: new Date(2024, 0, 15).getTime() },
        { id: 'e3', amount: 300, timestamp: new Date(2024, 0, 25).getTime() },
      ];

      const expenses: ExpenseEntry[] = [
        { id: 'ex1', amount: 50, categoryId: 'cat1', timestamp: new Date(2024, 0, 8).getTime() },
        { id: 'ex2', amount: 75, categoryId: 'cat1', timestamp: new Date(2024, 0, 20).getTime() },
        { id: 'ex3', amount: 100, categoryId: 'cat1', timestamp: new Date(2024, 0, 30).getTime() },
      ];

      (storageService.getAllEarnings as jest.Mock).mockResolvedValue(earnings);
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(expenses);

      // Execute: Get entries from Jan 10 to Jan 20, 2024
      const startDate = new Date(2024, 0, 10);
      const endDate = new Date(2024, 0, 20);
      const result = await dataManager.getEntriesInRange(startDate, endDate);

      // Verify: Count of entries in range (e2, ex2)
      expect(result.earnings).toBe(1);
      expect(result.expenses).toBe(1);
    });

    it('should return zero counts for empty range', async () => {
      // Setup: No entries in range
      (storageService.getAllEarnings as jest.Mock).mockResolvedValue([
        { id: 'e1', amount: 100, timestamp: new Date(2024, 0, 5).getTime() },
      ]);

      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([
        { id: 'ex1', amount: 50, categoryId: 'cat1', timestamp: new Date(2024, 0, 5).getTime() },
      ]);

      // Execute: Get entries from Jan 10 to Jan 20 (no entries in this range)
      const startDate = new Date(2024, 0, 10);
      const endDate = new Date(2024, 0, 20);
      const result = await dataManager.getEntriesInRange(startDate, endDate);

      // Verify: Zero counts
      expect(result.earnings).toBe(0);
      expect(result.expenses).toBe(0);
    });

    it('should include entries on boundary dates', async () => {
      // Setup: Entries exactly on boundaries
      const earnings: EarningEntry[] = [
        { id: 'e1', amount: 100, timestamp: new Date(2024, 0, 10, 0, 0, 0).getTime() },
        { id: 'e2', amount: 200, timestamp: new Date(2024, 0, 20, 23, 59, 59).getTime() },
      ];

      (storageService.getAllEarnings as jest.Mock).mockResolvedValue(earnings);
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([]);

      // Execute
      const startDate = new Date(2024, 0, 10, 0, 0, 0);
      const endDate = new Date(2024, 0, 20, 23, 59, 59);
      const result = await dataManager.getEntriesInRange(startDate, endDate);

      // Verify: Both boundary entries included
      expect(result.earnings).toBe(2);
      expect(result.expenses).toBe(0);
    });

    it('should handle all entries in range', async () => {
      // Setup: All entries within range
      const earnings: EarningEntry[] = [
        { id: 'e1', amount: 100, timestamp: new Date(2024, 0, 15).getTime() },
        { id: 'e2', amount: 200, timestamp: new Date(2024, 0, 16).getTime() },
      ];

      const expenses: ExpenseEntry[] = [
        { id: 'ex1', amount: 50, categoryId: 'cat1', timestamp: new Date(2024, 0, 15).getTime() },
        { id: 'ex2', amount: 75, categoryId: 'cat1', timestamp: new Date(2024, 0, 16).getTime() },
        { id: 'ex3', amount: 100, categoryId: 'cat1', timestamp: new Date(2024, 0, 17).getTime() },
      ];

      (storageService.getAllEarnings as jest.Mock).mockResolvedValue(earnings);
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(expenses);

      // Execute: Wide range that includes all entries
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 0, 31);
      const result = await dataManager.getEntriesInRange(startDate, endDate);

      // Verify: All entries counted
      expect(result.earnings).toBe(2);
      expect(result.expenses).toBe(3);
    });
  });
});
