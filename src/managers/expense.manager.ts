/**
 * Expense Tracker
 * 
 * Handles expense entry creation, validation, and retrieval.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.5
 */

import { v4 as uuidv4 } from 'uuid';
import { ExpenseEntry, ValidationResult } from '../models';
import { storageService } from '../services/storage.service';
import { validatePositiveNumber } from '../services/validation.service';
import { categoryManager } from './category.manager';

/**
 * Expense Tracker Interface
 */
export interface ExpenseTracker {
  addExpense(amount: number, categoryId: string): Promise<ExpenseEntry>;
  validateAmount(amount: string): ValidationResult;
  getTotalExpenses(): Promise<number>;
  getExpensesByCategory(categoryId: string): Promise<ExpenseEntry[]>;
}

/**
 * Implementation of ExpenseTracker
 */
class ExpenseTrackerImpl implements ExpenseTracker {
  /**
   * Add a new expense entry
   * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.5
   * 
   * @param amount - The expense amount (must be positive)
   * @param categoryId - The category ID (must reference a valid category)
   * @returns The created expense entry
   * @throws Error if amount is not positive, category is invalid, or storage fails
   */
  async addExpense(amount: number, categoryId: string): Promise<ExpenseEntry> {
    // Validate amount is positive (Requirement 2.1)
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    // Validate category ID is not empty (Requirement 2.2)
    if (!categoryId || categoryId.trim() === '') {
      throw new Error('Category ID is required');
    }

    // Validate category ID references a valid category (Requirement 10.5)
    const allCategories = await categoryManager.getAllCategories();
    const categoryExists = allCategories.some(cat => cat.id === categoryId);
    
    if (!categoryExists) {
      throw new Error('Invalid category ID: category does not exist');
    }

    // Generate unique ID using UUID v4
    const id = uuidv4();

    // Generate timestamp (Unix timestamp in milliseconds)
    const timestamp = Date.now();

    // Create expense entry
    const entry: ExpenseEntry = {
      id,
      amount,
      categoryId,
      timestamp,
    };

    // Store entry in local storage (Requirement 2.3)
    await storageService.saveExpense(entry);

    return entry;
  }

  /**
   * Validate an amount string input
   * Requirements: 2.1
   * 
   * @param amount - The amount string to validate
   * @returns ValidationResult indicating if the input is valid
   */
  validateAmount(amount: string): ValidationResult {
    return validatePositiveNumber(amount);
  }

  /**
   * Get the total of all expenses
   * Requirements: 2.4
   * 
   * @returns The sum of all expense amounts
   */
  async getTotalExpenses(): Promise<number> {
    const expenses = await storageService.getAllExpenses();
    return expenses.reduce((total, entry) => total + entry.amount, 0);
  }

  /**
   * Get all expenses for a specific category
   * Requirements: 2.5
   * 
   * @param categoryId - The category ID to filter by
   * @returns Array of expense entries for the specified category
   */
  async getExpensesByCategory(categoryId: string): Promise<ExpenseEntry[]> {
    const expenses = await storageService.getAllExpenses();
    return expenses.filter(entry => entry.categoryId === categoryId);
  }
}

/**
 * Singleton instance of the expense tracker
 */
export const expenseTracker = new ExpenseTrackerImpl();
