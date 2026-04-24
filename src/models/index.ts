/**
 * Core Data Models for Budget Tracker App
 * 
 * This file defines all TypeScript interfaces for data structures
 * used throughout the application.
 */

/**
 * Represents a single earning entry
 * Requirements: 8.1
 */
export interface EarningEntry {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Earning amount (positive decimal) */
  amount: number;
  /** Unix timestamp in milliseconds */
  timestamp: number;
}

/**
 * Represents a single expense entry
 * Requirements: 8.2
 */
export interface ExpenseEntry {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Expense amount (positive decimal) */
  amount: number;
  /** Reference to Category.id */
  categoryId: string;
  /** Unix timestamp in milliseconds */
  timestamp: number;
}

/**
 * Represents an expense category (default or custom)
 * Requirements: 8.3
 */
export interface Category {
  /** Unique identifier (UUID v4 or predefined constant) */
  id: string;
  /** Category name (non-empty string) */
  name: string;
  /** True for system-provided default categories */
  isDefault: boolean;
}

/**
 * Represents theme settings
 * Requirements: 8.4
 */
export interface Theme {
  /** Primary theme color (hex color code) */
  primaryColor: string;
  /** Currency symbol for display */
  currency: string;
}

/**
 * Represents the complete application state
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export interface AppState {
  /** All earning entries */
  earnings: EarningEntry[];
  /** All expense entries */
  expenses: ExpenseEntry[];
  /** All categories (default + custom) */
  categories: Category[];
  /** Current theme settings */
  theme: Theme;
  /** Calculated available funds: sum(earnings) - sum(expenses) */
  availableFunds: number;
}

/**
 * Represents the result of a validation operation
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
export interface ValidationResult {
  /** Whether the validation passed */
  isValid: boolean;
  /** Error message if validation failed */
  error?: string;
}

/**
 * Represents a budget estimate calculation result
 */
export interface BudgetEstimate {
  /** Calculated daily budget amount */
  dailyBudget: number;
  /** Total available amount for the period */
  availableAmount: number;
  /** Start date of the budget period */
  startDate: Date;
  /** End date of the budget period */
  endDate: Date;
  /** Number of days in the period (inclusive) */
  numberOfDays: number;
}

/**
 * Represents spending analytics for a single category
 */
export interface CategorySpending {
  /** The category being analyzed */
  category: Category;
  /** Total amount spent in this category */
  totalAmount: number;
  /** Percentage of total spending (0-100) */
  percentage: number;
  /** Rank by spending amount (1 = highest spending) */
  rank: number;
}

/**
 * Represents the result of a data deletion operation
 */
export interface DeletionResult {
  /** Number of earning entries deleted */
  deletedEarnings: number;
  /** Number of expense entries deleted */
  deletedExpenses: number;
  /** Recalculated available funds after deletion */
  newAvailableFunds: number;
}

/**
 * Represents a count of entries in a date range
 */
export interface EntryCount {
  /** Number of earning entries */
  earnings: number;
  /** Number of expense entries */
  expenses: number;
}

/**
 * Represents a recurring payment (bills, subscriptions, etc.)
 * Requirements: Recurring payments feature
 */
export interface RecurringPayment {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Payment name (e.g., "Rent", "Netflix") */
  name: string;
  /** Payment amount (positive decimal) */
  amount: number;
  /** Payment frequency */
  frequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly';
  /** Next due date (Unix timestamp in milliseconds) */
  nextDueDate: number;
  /** Payment category (e.g., "Housing", "Utilities") */
  category: string;
  /** Unix timestamp when payment was created */
  createdAt: number;
}
