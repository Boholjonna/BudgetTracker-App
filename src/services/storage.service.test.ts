/**
 * Storage Service Unit Tests
 * 
 * Tests for the AsyncStorage wrapper service
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.6
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { storageService, STORAGE_KEYS } from './storage.service';
import { EarningEntry, ExpenseEntry, Category, Theme } from '../models';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe('Storage Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Earnings Operations', () => {
    const mockEarning: EarningEntry = {
      id: 'earning-1',
      amount: 100.50,
      timestamp: Date.now(),
    };

    it('should save an earning entry', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveEarning(mockEarning);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EARNINGS,
        JSON.stringify([mockEarning])
      );
    });

    it('should retrieve all earnings', async () => {
      const mockEarnings = [mockEarning];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockEarnings));

      const result = await storageService.getAllEarnings();

      expect(result).toEqual(mockEarnings);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.EARNINGS);
    });

    it('should return empty array when no earnings exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.getAllEarnings();

      expect(result).toEqual([]);
    });

    it('should delete earnings by IDs', async () => {
      const earnings = [
        { id: 'earning-1', amount: 100, timestamp: Date.now() },
        { id: 'earning-2', amount: 200, timestamp: Date.now() },
        { id: 'earning-3', amount: 300, timestamp: Date.now() },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(earnings));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.deleteEarnings(['earning-1', 'earning-3']);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EARNINGS,
        JSON.stringify([earnings[1]])
      );
    });

    it('should throw error when save fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(storageService.saveEarning(mockEarning)).rejects.toThrow('Failed to save earning');
    });
  });

  describe('Expenses Operations', () => {
    const mockExpense: ExpenseEntry = {
      id: 'expense-1',
      amount: 50.25,
      categoryId: 'cat-food',
      timestamp: Date.now(),
    };

    it('should save an expense entry', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveExpense(mockExpense);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EXPENSES,
        JSON.stringify([mockExpense])
      );
    });

    it('should retrieve all expenses', async () => {
      const mockExpenses = [mockExpense];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockExpenses));

      const result = await storageService.getAllExpenses();

      expect(result).toEqual(mockExpenses);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.EXPENSES);
    });

    it('should return empty array when no expenses exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.getAllExpenses();

      expect(result).toEqual([]);
    });

    it('should delete expenses by IDs', async () => {
      const expenses = [
        { id: 'expense-1', amount: 50, categoryId: 'cat-1', timestamp: Date.now() },
        { id: 'expense-2', amount: 75, categoryId: 'cat-2', timestamp: Date.now() },
      ];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(expenses));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.deleteExpenses(['expense-1']);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.EXPENSES,
        JSON.stringify([expenses[1]])
      );
    });

    it('should throw error when retrieve fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(storageService.getAllExpenses()).rejects.toThrow('Failed to retrieve expenses');
    });
  });

  describe('Categories Operations', () => {
    const mockCategory: Category = {
      id: 'cat-custom',
      name: 'Entertainment',
      isDefault: false,
    };

    it('should save a category', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveCategory(mockCategory);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.CATEGORIES,
        JSON.stringify([mockCategory])
      );
    });

    it('should retrieve all categories', async () => {
      const mockCategories = [mockCategory];
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockCategories));

      const result = await storageService.getAllCategories();

      expect(result).toEqual(mockCategories);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.CATEGORIES);
    });

    it('should return empty array when no categories exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.getAllCategories();

      expect(result).toEqual([]);
    });

    it('should throw error when save fails', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(storageService.saveCategory(mockCategory)).rejects.toThrow('Failed to save category');
    });
  });

  describe('Theme Operations', () => {
    const mockTheme: Theme = {
      primaryColor: '#00FF00',
      currency: '$'
    };

    it('should save theme preferences', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.saveTheme(mockTheme);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.THEME,
        JSON.stringify(mockTheme)
      );
    });

    it('should retrieve theme preferences', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockTheme));

      const result = await storageService.getTheme();

      expect(result).toEqual(mockTheme);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.THEME);
    });

    it('should return null when no theme exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await storageService.getTheme();

      expect(result).toBeNull();
    });

    it('should throw error when save fails', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(storageService.saveTheme(mockTheme)).rejects.toThrow('Failed to save theme');
    });
  });

  describe('Utility Operations', () => {
    it('should clear all storage', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await storageService.clear();

      expect(AsyncStorage.removeItem).toHaveBeenCalledTimes(5);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.EARNINGS);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.EXPENSES);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.CATEGORIES);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.THEME);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.RECURRING_PAYMENTS);
    });

    it('should throw error when clear fails', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await expect(storageService.clear()).rejects.toThrow('Failed to clear storage');
    });
  });

  describe('Error Handling', () => {
    it('should handle JSON parse errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

      await expect(storageService.getAllEarnings()).rejects.toThrow('Failed to retrieve earnings');
    });

    it('should handle storage quota exceeded errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('QuotaExceededError'));

      const mockEarning: EarningEntry = {
        id: 'earning-1',
        amount: 100,
        timestamp: Date.now(),
      };

      await expect(storageService.saveEarning(mockEarning)).rejects.toThrow('Failed to save earning');
    });
  });
});
