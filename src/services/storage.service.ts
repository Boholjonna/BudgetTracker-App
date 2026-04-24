/**
 * Storage Service
 * 
 * Provides a type-safe wrapper around AsyncStorage for persisting
 * application data locally on the device.
 * 
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.6
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { EarningEntry, ExpenseEntry, Category, Theme, RecurringPayment } from '../models';

/**
 * Storage keys for AsyncStorage
 */
const STORAGE_KEYS = {
  EARNINGS: '@earnings',
  EXPENSES: '@expenses',
  CATEGORIES: '@categories',
  THEME: '@theme',
  RECURRING_PAYMENTS: '@recurring_payments',
} as const;

/**
 * Storage Service Interface
 * Provides methods for persisting and retrieving application data
 */
export interface StorageService {
  // Earnings operations
  saveEarning(entry: EarningEntry): Promise<void>;
  getAllEarnings(): Promise<EarningEntry[]>;
  deleteEarnings(ids: string[]): Promise<void>;

  // Expenses operations
  saveExpense(entry: ExpenseEntry): Promise<void>;
  getAllExpenses(): Promise<ExpenseEntry[]>;
  deleteExpenses(ids: string[]): Promise<void>;

  // Categories operations
  saveCategory(category: Category): Promise<void>;
  getAllCategories(): Promise<Category[]>;

  // Theme operations
  saveTheme(theme: Theme): Promise<void>;
  getTheme(): Promise<Theme | null>;

  // Recurring payments operations
  saveRecurringPayment(payment: RecurringPayment): Promise<void>;
  getAllRecurringPayments(): Promise<RecurringPayment[]>;
  deleteRecurringPayment(id: string): Promise<void>;
  updateRecurringPayment(payment: RecurringPayment): Promise<void>;

  // Utility operations
  clear(): Promise<void>;
}

/**
 * Implementation of StorageService using AsyncStorage
 */
class AsyncStorageService implements StorageService {
  /**
   * Save an earning entry to storage
   * Requirements: 8.1
   */
  async saveEarning(entry: EarningEntry): Promise<void> {
    try {
      const earnings = await this.getAllEarnings();
      earnings.push(entry);
      await AsyncStorage.setItem(STORAGE_KEYS.EARNINGS, JSON.stringify(earnings));
    } catch (error) {
      throw new Error(`Failed to save earning: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve all earning entries from storage
   * Requirements: 8.1
   */
  async getAllEarnings(): Promise<EarningEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EARNINGS);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as EarningEntry[];
    } catch (error) {
      throw new Error(`Failed to retrieve earnings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete earning entries by IDs
   * Requirements: 8.1, 8.6
   */
  async deleteEarnings(ids: string[]): Promise<void> {
    try {
      const earnings = await this.getAllEarnings();
      const filtered = earnings.filter(entry => !ids.includes(entry.id));
      await AsyncStorage.setItem(STORAGE_KEYS.EARNINGS, JSON.stringify(filtered));
    } catch (error) {
      throw new Error(`Failed to delete earnings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save an expense entry to storage
   * Requirements: 8.2
   */
  async saveExpense(entry: ExpenseEntry): Promise<void> {
    try {
      const expenses = await this.getAllExpenses();
      expenses.push(entry);
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (error) {
      throw new Error(`Failed to save expense: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve all expense entries from storage
   * Requirements: 8.2
   */
  async getAllExpenses(): Promise<ExpenseEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as ExpenseEntry[];
    } catch (error) {
      throw new Error(`Failed to retrieve expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete expense entries by IDs
   * Requirements: 8.2, 8.6
   */
  async deleteExpenses(ids: string[]): Promise<void> {
    try {
      const expenses = await this.getAllExpenses();
      const filtered = expenses.filter(entry => !ids.includes(entry.id));
      await AsyncStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
    } catch (error) {
      throw new Error(`Failed to delete expenses: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save a category to storage
   * Requirements: 8.3
   */
  async saveCategory(category: Category): Promise<void> {
    try {
      const categories = await this.getAllCategories();
      categories.push(category);
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      throw new Error(`Failed to save category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve all categories from storage
   * Requirements: 8.3
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as Category[];
    } catch (error) {
      throw new Error(`Failed to retrieve categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save theme preferences to storage
   * Requirements: 8.4
   */
  async saveTheme(theme: Theme): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, JSON.stringify(theme));
    } catch (error) {
      throw new Error(`Failed to save theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve theme preferences from storage
   * Requirements: 8.4
   */
  async getTheme(): Promise<Theme | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as Theme;
    } catch (error) {
      throw new Error(`Failed to retrieve theme: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Save a recurring payment to storage
   */
  async saveRecurringPayment(payment: RecurringPayment): Promise<void> {
    try {
      const payments = await this.getAllRecurringPayments();
      payments.push(payment);
      await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_PAYMENTS, JSON.stringify(payments));
    } catch (error) {
      throw new Error(`Failed to save recurring payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Retrieve all recurring payments from storage
   */
  async getAllRecurringPayments(): Promise<RecurringPayment[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECURRING_PAYMENTS);
      if (!data) {
        return [];
      }
      return JSON.parse(data) as RecurringPayment[];
    } catch (error) {
      throw new Error(`Failed to retrieve recurring payments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete a recurring payment by ID
   */
  async deleteRecurringPayment(id: string): Promise<void> {
    try {
      const payments = await this.getAllRecurringPayments();
      const filtered = payments.filter(payment => payment.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_PAYMENTS, JSON.stringify(filtered));
    } catch (error) {
      throw new Error(`Failed to delete recurring payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update a recurring payment
   */
  async updateRecurringPayment(payment: RecurringPayment): Promise<void> {
    try {
      const payments = await this.getAllRecurringPayments();
      const index = payments.findIndex(p => p.id === payment.id);
      if (index !== -1) {
        payments[index] = payment;
        await AsyncStorage.setItem(STORAGE_KEYS.RECURRING_PAYMENTS, JSON.stringify(payments));
      } else {
        throw new Error('Recurring payment not found');
      }
    } catch (error) {
      throw new Error(`Failed to update recurring payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all data from storage
   * Utility method for testing and data reset
   */
  async clear(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.EARNINGS),
        AsyncStorage.removeItem(STORAGE_KEYS.EXPENSES),
        AsyncStorage.removeItem(STORAGE_KEYS.CATEGORIES),
        AsyncStorage.removeItem(STORAGE_KEYS.THEME),
        AsyncStorage.removeItem(STORAGE_KEYS.RECURRING_PAYMENTS),
      ]);
    } catch (error) {
      throw new Error(`Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Singleton instance of the storage service
 */
export const storageService = new AsyncStorageService();

/**
 * Export storage keys for testing purposes
 */
export { STORAGE_KEYS };
