/**
 * Data Context Provider
 * 
 * Provides centralized state management for earnings, expenses, categories,
 * and available funds calculation.
 * Requirements: 8.6
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { EarningEntry, ExpenseEntry, Category } from '../models';
import { earningsManager, expenseTracker, categoryManager } from '../managers';

/**
 * Data Context State Interface
 */
interface DataContextState {
  // Data arrays
  earnings: EarningEntry[];
  expenses: ExpenseEntry[];
  categories: Category[];
  
  // Calculated values
  availableFunds: number;
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  addEarning: (amount: number) => Promise<EarningEntry>;
  addExpense: (amount: number, categoryId: string) => Promise<ExpenseEntry>;
  addCategory: (name: string) => Promise<Category>;
  refreshData: () => Promise<void>;
}

/**
 * Create the context with undefined default value
 */
const DataContext = createContext<DataContextState | undefined>(undefined);

/**
 * Data Provider Props
 */
interface DataProviderProps {
  children: ReactNode;
}

/**
 * Data Context Provider Component
 * 
 * Manages application data state and provides hooks for accessing and updating data.
 * Loads data from storage on mount.
 * Requirements: 8.6
 */
export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [earnings, setEarnings] = useState<EarningEntry[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableFunds, setAvailableFunds] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Calculate available funds from earnings and expenses
   * Requirements: 8.6
   */
  const calculateAvailableFunds = useCallback((
    earningsData: EarningEntry[],
    expensesData: ExpenseEntry[]
  ): number => {
    const totalEarnings = earningsData.reduce((sum, entry) => sum + entry.amount, 0);
    const totalExpenses = expensesData.reduce((sum, entry) => sum + entry.amount, 0);
    return totalEarnings - totalExpenses;
  }, []);

  /**
   * Load all data from storage
   * Requirements: 8.6
   */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load data from managers
      const [earningsData, expensesData, categoriesData] = await Promise.all([
        earningsManager.getTotalEarnings().then(async () => {
          // Get actual earnings array from storage
          const { storageService } = await import('../services/storage.service');
          return storageService.getAllEarnings();
        }),
        expenseTracker.getTotalExpenses().then(async () => {
          // Get actual expenses array from storage
          const { storageService } = await import('../services/storage.service');
          return storageService.getAllExpenses();
        }),
        categoryManager.getAllCategories(),
      ]);

      // Update state
      setEarnings(earningsData);
      setExpenses(expensesData);
      setCategories(categoriesData);
      
      // Calculate and set available funds
      const funds = calculateAvailableFunds(earningsData, expensesData);
      setAvailableFunds(funds);
    } catch (error) {
      console.error('Failed to load data from storage:', error);
      // Initialize with empty data on error
      setEarnings([]);
      setExpenses([]);
      setCategories([]);
      setAvailableFunds(0);
    } finally {
      setIsLoading(false);
    }
  }, [calculateAvailableFunds]);

  /**
   * Load data on mount
   * Requirements: 8.6
   */
  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Add a new earning entry
   * Requirements: 8.6
   */
  const addEarning = useCallback(async (amount: number): Promise<EarningEntry> => {
    const entry = await earningsManager.addEarning(amount);
    
    // Update local state
    const updatedEarnings = [...earnings, entry];
    setEarnings(updatedEarnings);
    
    // Recalculate available funds
    const funds = calculateAvailableFunds(updatedEarnings, expenses);
    setAvailableFunds(funds);
    
    return entry;
  }, [earnings, expenses, calculateAvailableFunds]);

  /**
   * Add a new expense entry
   * Requirements: 8.6
   */
  const addExpense = useCallback(async (amount: number, categoryId: string): Promise<ExpenseEntry> => {
    const entry = await expenseTracker.addExpense(amount, categoryId);
    
    // Update local state
    const updatedExpenses = [...expenses, entry];
    setExpenses(updatedExpenses);
    
    // Recalculate available funds
    const funds = calculateAvailableFunds(earnings, updatedExpenses);
    setAvailableFunds(funds);
    
    return entry;
  }, [earnings, expenses, calculateAvailableFunds]);

  /**
   * Add a new category
   * Requirements: 8.6
   */
  const addCategory = useCallback(async (name: string): Promise<Category> => {
    const category = await categoryManager.createCategory(name);
    
    // Update local state
    setCategories([...categories, category]);
    
    return category;
  }, [categories]);

  /**
   * Refresh all data from storage
   * Requirements: 8.6
   */
  const refreshData = useCallback(async (): Promise<void> => {
    await loadData();
  }, [loadData]);

  const value: DataContextState = {
    earnings,
    expenses,
    categories,
    availableFunds,
    isLoading,
    addEarning,
    addExpense,
    addCategory,
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

/**
 * Hook to access the data context
 * Requirements: 8.6
 * 
 * @throws Error if used outside of DataProvider
 */
export const useData = (): DataContextState => {
  const context = useContext(DataContext);
  
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
};
