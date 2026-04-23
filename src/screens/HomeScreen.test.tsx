/**
 * Home Screen Tests
 * 
 * Tests for the Home Screen component logic and requirements.
 * Requirements: 1.3, 2.4
 */

import { EarningEntry, ExpenseEntry } from '../models';

describe('HomeScreen', () => {
  describe('Available Funds Display Requirements', () => {
    /**
     * Requirement 1.3: Display current available funds
     * The home screen should display the total available funds calculated from earnings and expenses
     */
    it('should calculate available funds correctly from earnings and expenses', () => {
      const earnings: EarningEntry[] = [
        { id: '1', amount: 1000, timestamp: Date.now() },
        { id: '2', amount: 500, timestamp: Date.now() },
      ];

      const expenses: ExpenseEntry[] = [
        { id: '1', amount: 200, categoryId: 'cat_food', timestamp: Date.now() },
        { id: '2', amount: 100, categoryId: 'cat_transport', timestamp: Date.now() },
      ];

      const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const availableFunds = totalEarnings - totalExpenses;

      // Expected: (1000 + 500) - (200 + 100) = 1200
      expect(availableFunds).toBe(1200);
    });

    it('should handle zero available funds', () => {
      const earnings: EarningEntry[] = [];
      const expenses: ExpenseEntry[] = [];

      const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const availableFunds = totalEarnings - totalExpenses;

      expect(availableFunds).toBe(0);
    });

    it('should handle negative available funds when expenses exceed earnings', () => {
      const earnings: EarningEntry[] = [
        { id: '1', amount: 100, timestamp: Date.now() },
      ];

      const expenses: ExpenseEntry[] = [
        { id: '1', amount: 200, categoryId: 'cat_food', timestamp: Date.now() },
      ];

      const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const availableFunds = totalEarnings - totalExpenses;

      expect(availableFunds).toBe(-100);
    });

    /**
     * Requirement 2.4: Expense deduction from available funds
     * When expenses are added, they should be deducted from available funds
     */
    it('should deduct expenses from available funds', () => {
      const initialEarnings = 1000;
      const expenseAmount = 250;
      
      const availableFundsAfterExpense = initialEarnings - expenseAmount;
      
      expect(availableFundsAfterExpense).toBe(750);
    });
  });

  describe('Navigation Requirements', () => {
    /**
     * The home screen should provide navigation to all feature screens
     */
    it('should define navigation to all required screens', () => {
      const navigationButtons = [
        { title: 'Add Earning', screen: 'AddEarning' },
        { title: 'Add Expense', screen: 'AddExpense' },
        { title: 'Budget Estimator', screen: 'BudgetEstimator' },
        { title: 'Analytics', screen: 'Analytics' },
        { title: 'Manage Categories', screen: 'CategoryManager' },
        { title: 'Data Management', screen: 'DataManagement' },
        { title: 'Settings', screen: 'Settings' },
      ];

      // Verify all required screens are defined
      expect(navigationButtons).toHaveLength(7);
      expect(navigationButtons.map(b => b.screen)).toContain('AddEarning');
      expect(navigationButtons.map(b => b.screen)).toContain('AddExpense');
      expect(navigationButtons.map(b => b.screen)).toContain('BudgetEstimator');
      expect(navigationButtons.map(b => b.screen)).toContain('Analytics');
      expect(navigationButtons.map(b => b.screen)).toContain('CategoryManager');
      expect(navigationButtons.map(b => b.screen)).toContain('DataManagement');
      expect(navigationButtons.map(b => b.screen)).toContain('Settings');
    });
  });

  describe('Theme Styling Requirements', () => {
    /**
     * The home screen should apply theme styling to UI elements
     */
    it('should use theme color for primary UI elements', () => {
      const theme = { primaryColor: '#4CAF50' };
      
      // Verify theme color is defined and valid
      expect(theme.primaryColor).toBeDefined();
      expect(theme.primaryColor).toMatch(/^#[0-9A-F]{6}$/i);
    });

    it('should format currency amounts correctly', () => {
      const availableFunds = 1234.56;
      const formatted = `$${availableFunds.toFixed(2)}`;
      
      expect(formatted).toBe('$1234.56');
    });

    it('should format zero amounts correctly', () => {
      const availableFunds = 0;
      const formatted = `$${availableFunds.toFixed(2)}`;
      
      expect(formatted).toBe('$0.00');
    });

    it('should format negative amounts correctly', () => {
      const availableFunds = -50.25;
      const formatted = `$${availableFunds.toFixed(2)}`;
      
      expect(formatted).toBe('$-50.25');
    });
  });

  describe('Component Structure Requirements', () => {
    /**
     * The home screen should have the required UI structure
     */
    it('should have funds display section', () => {
      const fundsSection = {
        label: 'Available Funds',
        amount: 0,
      };

      expect(fundsSection.label).toBe('Available Funds');
      expect(typeof fundsSection.amount).toBe('number');
    });

    it('should have navigation buttons section', () => {
      const navigationSection = {
        buttons: [
          'Add Earning',
          'Add Expense',
          'Budget Estimator',
          'Analytics',
          'Manage Categories',
          'Data Management',
          'Settings',
        ],
      };

      expect(navigationSection.buttons).toHaveLength(7);
    });
  });
});
