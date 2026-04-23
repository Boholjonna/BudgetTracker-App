/**
 * Expense Tracker Unit Tests
 * 
 * Tests for expense tracker functionality
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.5
 */

import { expenseTracker } from './expense.manager';
import { storageService } from '../services/storage.service';
import { categoryManager } from './category.manager';

// Mock the storage service
jest.mock('../services/storage.service', () => ({
  storageService: {
    saveExpense: jest.fn(),
    getAllExpenses: jest.fn(),
    deleteExpenses: jest.fn(),
  },
}));

// Mock the category manager
jest.mock('./category.manager', () => ({
  categoryManager: {
    getAllCategories: jest.fn(),
  },
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

describe('ExpenseTracker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Date.now mock
    jest.spyOn(Date, 'now').mockReturnValue(1234567890000);
    
    // Default mock: categories exist
    (categoryManager.getAllCategories as jest.Mock).mockResolvedValue([
      { id: 'cat_food', name: 'Food', isDefault: true },
      { id: 'cat_transport', name: 'Transport', isDefault: true },
      { id: 'custom_cat_1', name: 'Custom Category', isDefault: false },
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('addExpense', () => {
    it('should add a valid expense with category and return the entry', async () => {
      const amount = 50.75;
      const categoryId = 'cat_food';
      
      const result = await expenseTracker.addExpense(amount, categoryId);

      expect(result).toEqual({
        id: 'test-uuid-1234',
        amount: 50.75,
        categoryId: 'cat_food',
        timestamp: 1234567890000,
      });

      expect(storageService.saveExpense).toHaveBeenCalledWith({
        id: 'test-uuid-1234',
        amount: 50.75,
        categoryId: 'cat_food',
        timestamp: 1234567890000,
      });
    });

    it('should reject invalid amount (zero)', async () => {
      await expect(expenseTracker.addExpense(0, 'cat_food')).rejects.toThrow(
        'Amount must be greater than zero'
      );

      expect(storageService.saveExpense).not.toHaveBeenCalled();
    });

    it('should reject invalid amount (negative)', async () => {
      await expect(expenseTracker.addExpense(-25, 'cat_food')).rejects.toThrow(
        'Amount must be greater than zero'
      );

      expect(storageService.saveExpense).not.toHaveBeenCalled();
    });

    it('should reject expense without category (empty string)', async () => {
      await expect(expenseTracker.addExpense(100, '')).rejects.toThrow(
        'Category ID is required'
      );

      expect(storageService.saveExpense).not.toHaveBeenCalled();
    });

    it('should reject expense without category (whitespace only)', async () => {
      await expect(expenseTracker.addExpense(100, '   ')).rejects.toThrow(
        'Category ID is required'
      );

      expect(storageService.saveExpense).not.toHaveBeenCalled();
    });

    it('should reject expense with non-existent category ID', async () => {
      await expect(expenseTracker.addExpense(100, 'invalid_category')).rejects.toThrow(
        'Invalid category ID: category does not exist'
      );

      expect(storageService.saveExpense).not.toHaveBeenCalled();
    });

    it('should accept expense with default category', async () => {
      const result = await expenseTracker.addExpense(100, 'cat_food');

      expect(result.categoryId).toBe('cat_food');
      expect(storageService.saveExpense).toHaveBeenCalled();
    });

    it('should accept expense with custom category', async () => {
      const result = await expenseTracker.addExpense(100, 'custom_cat_1');

      expect(result.categoryId).toBe('custom_cat_1');
      expect(storageService.saveExpense).toHaveBeenCalled();
    });

    it('should generate unique IDs for each expense', async () => {
      const { v4: uuidv4 } = require('uuid');
      uuidv4.mockReturnValueOnce('uuid-1').mockReturnValueOnce('uuid-2');

      const result1 = await expenseTracker.addExpense(100, 'cat_food');
      const result2 = await expenseTracker.addExpense(200, 'cat_transport');

      expect(result1.id).toBe('uuid-1');
      expect(result2.id).toBe('uuid-2');
      expect(result1.id).not.toBe(result2.id);
    });

    it('should generate timestamps for each expense', async () => {
      const dateSpy = jest.spyOn(Date, 'now');
      dateSpy.mockReturnValueOnce(1000000000000).mockReturnValueOnce(2000000000000);

      const result1 = await expenseTracker.addExpense(100, 'cat_food');
      const result2 = await expenseTracker.addExpense(200, 'cat_transport');

      expect(result1.timestamp).toBe(1000000000000);
      expect(result2.timestamp).toBe(2000000000000);
    });

    it('should handle decimal amounts correctly', async () => {
      const amount = 123.45;
      
      const result = await expenseTracker.addExpense(amount, 'cat_food');

      expect(result.amount).toBe(123.45);
      expect(storageService.saveExpense).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 123.45 })
      );
    });
  });

  describe('validateAmount', () => {
    it('should validate positive number strings', () => {
      const result = expenseTracker.validateAmount('100.50');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty strings', () => {
      const result = expenseTracker.validateAmount('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount cannot be empty');
    });

    it('should reject non-numeric strings', () => {
      const result = expenseTracker.validateAmount('abc');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be a valid number');
    });

    it('should reject zero', () => {
      const result = expenseTracker.validateAmount('0');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than zero');
    });

    it('should reject negative numbers', () => {
      const result = expenseTracker.validateAmount('-50');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Amount must be greater than zero');
    });
  });

  describe('getTotalExpenses', () => {
    it('should return sum of all expenses', async () => {
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([
        { id: '1', amount: 100, categoryId: 'cat_food', timestamp: 1000 },
        { id: '2', amount: 200, categoryId: 'cat_transport', timestamp: 2000 },
        { id: '3', amount: 50.50, categoryId: 'cat_food', timestamp: 3000 },
      ]);

      const total = await expenseTracker.getTotalExpenses();

      expect(total).toBe(350.50);
    });

    it('should return 0 for empty expenses list', async () => {
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([]);

      const total = await expenseTracker.getTotalExpenses();

      expect(total).toBe(0);
    });

    it('should handle single expense', async () => {
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([
        { id: '1', amount: 123.45, categoryId: 'cat_food', timestamp: 1000 },
      ]);

      const total = await expenseTracker.getTotalExpenses();

      expect(total).toBe(123.45);
    });
  });

  describe('getExpensesByCategory', () => {
    beforeEach(() => {
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue([
        { id: '1', amount: 100, categoryId: 'cat_food', timestamp: 1000 },
        { id: '2', amount: 200, categoryId: 'cat_transport', timestamp: 2000 },
        { id: '3', amount: 50.50, categoryId: 'cat_food', timestamp: 3000 },
        { id: '4', amount: 75, categoryId: 'cat_transport', timestamp: 4000 },
        { id: '5', amount: 25, categoryId: 'custom_cat_1', timestamp: 5000 },
      ]);
    });

    it('should return all expenses for a specific category', async () => {
      const expenses = await expenseTracker.getExpensesByCategory('cat_food');

      expect(expenses).toHaveLength(2);
      expect(expenses[0]).toEqual({
        id: '1',
        amount: 100,
        categoryId: 'cat_food',
        timestamp: 1000,
      });
      expect(expenses[1]).toEqual({
        id: '3',
        amount: 50.50,
        categoryId: 'cat_food',
        timestamp: 3000,
      });
    });

    it('should return empty array for category with no expenses', async () => {
      const expenses = await expenseTracker.getExpensesByCategory('cat_parcel');

      expect(expenses).toHaveLength(0);
      expect(expenses).toEqual([]);
    });

    it('should return expenses for custom category', async () => {
      const expenses = await expenseTracker.getExpensesByCategory('custom_cat_1');

      expect(expenses).toHaveLength(1);
      expect(expenses[0]).toEqual({
        id: '5',
        amount: 25,
        categoryId: 'custom_cat_1',
        timestamp: 5000,
      });
    });

    it('should not return expenses from other categories', async () => {
      const expenses = await expenseTracker.getExpensesByCategory('cat_transport');

      expect(expenses).toHaveLength(2);
      expect(expenses.every(e => e.categoryId === 'cat_transport')).toBe(true);
      expect(expenses.some(e => e.categoryId === 'cat_food')).toBe(false);
    });
  });
});
