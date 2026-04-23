/**
 * Managers Module Exports
 * 
 * Centralized exports for all business logic managers
 */

export { earningsManager, type EarningsManager } from './earnings.manager';
export { categoryManager, type CategoryManager, DEFAULT_CATEGORIES } from './category.manager';
export { expenseTracker, type ExpenseTracker } from './expense.manager';
export { budgetCalculator, type BudgetCalculator } from './budget.manager';
export { analyticsEngine, type AnalyticsEngine } from './analytics.manager';
export { dataManager, type DataManager } from './data.manager';
export { themeManager, type ThemeManager } from './theme.manager';
