/**
 * Analytics Engine
 * 
 * Generates spending analytics and insights by aggregating expense data.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { CategorySpending } from '../models';
import { storageService } from '../services/storage.service';
import { categoryManager } from './category.manager';

/**
 * Analytics Engine Interface
 */
export interface AnalyticsEngine {
  getCategorySpending(): Promise<CategorySpending[]>;
  getTotalSpending(): Promise<number>;
}

/**
 * Implementation of AnalyticsEngine
 */
class AnalyticsEngineImpl implements AnalyticsEngine {
  /**
   * Get spending analytics for all categories
   * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
   * 
   * Calculates total spending per category, percentages, and ranks categories
   * by spending amount in descending order.
   * 
   * @returns Array of CategorySpending objects ranked by spending amount
   */
  async getCategorySpending(): Promise<CategorySpending[]> {
    // Get all expenses from storage (Requirement 5.5)
    const expenses = await storageService.getAllExpenses();
    
    // Get all categories (default + custom)
    const allCategories = await categoryManager.getAllCategories();
    
    // Calculate total spending across all expenses
    const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Aggregate spending by category (Requirement 5.1)
    const categoryTotals = new Map<string, number>();
    
    for (const expense of expenses) {
      const currentTotal = categoryTotals.get(expense.categoryId) || 0;
      categoryTotals.set(expense.categoryId, currentTotal + expense.amount);
    }
    
    // Build CategorySpending objects
    const categorySpendingList: CategorySpending[] = [];
    
    for (const category of allCategories) {
      const totalAmount = categoryTotals.get(category.id) || 0;
      
      // Calculate percentage of total spending (Requirement 5.4)
      // Handle division by zero: if no expenses, percentage is 0
      const percentage = totalSpending > 0 ? (totalAmount / totalSpending) * 100 : 0;
      
      categorySpendingList.push({
        category,
        totalAmount,
        percentage,
        rank: 0, // Will be set after sorting
      });
    }
    
    // Sort by total spending amount in descending order (Requirement 5.2)
    categorySpendingList.sort((a, b) => b.totalAmount - a.totalAmount);
    
    // Assign ranks based on sorted order (Requirement 5.2)
    // Rank 1 = highest spending
    categorySpendingList.forEach((item, index) => {
      item.rank = index + 1;
    });
    
    return categorySpendingList;
  }

  /**
   * Get the total spending across all expenses
   * Requirements: 5.1
   * 
   * @returns The sum of all expense amounts
   */
  async getTotalSpending(): Promise<number> {
    const expenses = await storageService.getAllExpenses();
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  }
}

/**
 * Singleton instance of the analytics engine
 */
export const analyticsEngine = new AnalyticsEngineImpl();
