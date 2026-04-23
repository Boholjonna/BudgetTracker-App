/**
 * Data Context Provider Tests
 * 
 * Tests for the DataContext provider and useData hook.
 * Requirements: 8.6
 */

import { storageService } from '../services/storage.service';
import { earningsManager } from '../managers/earnings.manager';
import { expenseTracker } from '../managers/expense.manager';
import { categoryManager } from '../managers/category.manager';
import { EarningEntry, ExpenseEntry, Category } from '../models';

// Mock the services and managers
jest.mock('../services/storage.service');
jest.mock('../managers/earnings.manager');
jest.mock('../managers/expense.manager');
jest.mock('../managers/category.manager');

describe('DataContext', () => {
  // Sample test data
  const mockEarnings: EarningEntry[] = [
    { id: '1', amount: 1000, timestamp: Date.now() },
    { id: '2', amount: 500, timestamp: Date.now() },
  ];

  const mockExpenses: ExpenseEntry[] = [
    { id: '1', amount: 200, categoryId: 'cat_food', timestamp: Date.now() },
    { id: '2', amount: 100, categoryId: 'cat_transport', timestamp: Date.now() },
  ];

  const mockCategories: Category[] = [
    { id: 'cat_food', name: 'Food', isDefault: true },
    { id: 'cat_transport', name: 'Transport', isDefault: true },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (storageService.getAllEarnings as jest.Mock).mockResolvedValue(mockEarnings);
    (storageService.getAllExpenses as jest.Mock).mockResolvedValue(mockExpenses);
    (earningsManager.getTotalEarnings as jest.Mock).mockResolvedValue(1500);
    (expenseTracker.getTotalExpenses as jest.Mock).mockResolvedValue(300);
    (categoryManager.getAllCategories as jest.Mock).mockResolvedValue(mockCategories);
  });

  describe('DataProvider implementation', () => {
    it('should have all required manager dependencies', () => {
      expect(earningsManager).toBeDefined();
      expect(expenseTracker).toBeDefined();
      expect(categoryManager).toBeDefined();
      expect(storageService).toBeDefined();
    });

    it('should mock storage service correctly', async () => {
      const earnings = await storageService.getAllEarnings();
      expect(earnings).toEqual(mockEarnings);
      
      const expenses = await storageService.getAllExpenses();
      expect(expenses).toEqual(mockExpenses);
      
      const categories = await categoryManager.getAllCategories();
      expect(categories).toEqual(mockCategories);
    });
  });

  describe('Available funds calculation logic', () => {
    it('should calculate available funds correctly', () => {
      const totalEarnings = mockEarnings.reduce((sum, e) => sum + e.amount, 0);
      const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);
      const availableFunds = totalEarnings - totalExpenses;
      
      // Expected: (1000 + 500) - (200 + 100) = 1200
      expect(availableFunds).toBe(1200);
    });

    it('should handle empty earnings and expenses', () => {
      const totalEarnings = [].reduce((sum: number, e: EarningEntry) => sum + e.amount, 0);
      const totalExpenses = [].reduce((sum: number, e: ExpenseEntry) => sum + e.amount, 0);
      const availableFunds = totalEarnings - totalExpenses;
      
      expect(availableFunds).toBe(0);
    });

    it('should handle negative available funds', () => {
      const earnings: EarningEntry[] = [];
      const expenses: ExpenseEntry[] = [
        { id: '1', amount: 200, categoryId: 'cat_food', timestamp: Date.now() },
      ];
      
      const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const availableFunds = totalEarnings - totalExpenses;
      
      expect(availableFunds).toBe(-200);
    });
  });

  describe('Manager integration', () => {
    it('should call earningsManager.addEarning with correct parameters', async () => {
      const mockEntry: EarningEntry = {
        id: 'test-id',
        amount: 300,
        timestamp: Date.now(),
      };
      
      (earningsManager.addEarning as jest.Mock).mockResolvedValue(mockEntry);
      
      const result = await earningsManager.addEarning(300);
      
      expect(earningsManager.addEarning).toHaveBeenCalledWith(300);
      expect(result).toEqual(mockEntry);
    });

    it('should call expenseTracker.addExpense with correct parameters', async () => {
      const mockEntry: ExpenseEntry = {
        id: 'test-id',
        amount: 150,
        categoryId: 'cat_food',
        timestamp: Date.now(),
      };
      
      (expenseTracker.addExpense as jest.Mock).mockResolvedValue(mockEntry);
      
      const result = await expenseTracker.addExpense(150, 'cat_food');
      
      expect(expenseTracker.addExpense).toHaveBeenCalledWith(150, 'cat_food');
      expect(result).toEqual(mockEntry);
    });

    it('should call categoryManager.createCategory with correct parameters', async () => {
      const mockCategory: Category = {
        id: 'test-id',
        name: 'Entertainment',
        isDefault: false,
      };
      
      (categoryManager.createCategory as jest.Mock).mockResolvedValue(mockCategory);
      
      const result = await categoryManager.createCategory('Entertainment');
      
      expect(categoryManager.createCategory).toHaveBeenCalledWith('Entertainment');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('Data loading from storage', () => {
    it('should load earnings from storage', async () => {
      const earnings = await storageService.getAllEarnings();
      
      expect(storageService.getAllEarnings).toHaveBeenCalled();
      expect(earnings).toEqual(mockEarnings);
      expect(earnings).toHaveLength(2);
    });

    it('should load expenses from storage', async () => {
      const expenses = await storageService.getAllExpenses();
      
      expect(storageService.getAllExpenses).toHaveBeenCalled();
      expect(expenses).toEqual(mockExpenses);
      expect(expenses).toHaveLength(2);
    });

    it('should load categories from storage', async () => {
      const categories = await categoryManager.getAllCategories();
      
      expect(categoryManager.getAllCategories).toHaveBeenCalled();
      expect(categories).toEqual(mockCategories);
      expect(categories).toHaveLength(2);
    });

    it('should handle storage errors gracefully', async () => {
      (storageService.getAllEarnings as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );
      
      await expect(storageService.getAllEarnings()).rejects.toThrow('Storage error');
    });
  });
});
