/**
 * Analytics Engine Tests
 * 
 * Unit tests for the Analytics Engine component
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { analyticsEngine } from './analytics.manager';
import { storageService } from '../services/storage.service';
import { categoryManager } from './category.manager';
import { ExpenseEntry, Category } from '../models';

// Mock the storage service
jest.mock('../services/storage.service', () => ({
  storageService: {
    getAllExpenses: jest.fn(),
  },
}));

// Mock the category manager
jest.mock('./category.manager', () => ({
  categoryManager: {
    getAllCategories: jest.fn(),
  },
}));

describe('Analytics Engine', () => {
  const mockCategories: Category[] = [
    { id: 'cat_food', name: 'Food', isDefault: true },
    { id: 'cat_transport', name: 'Transport', isDefault: true },
    { id: 'cat_parcel', name: 'Parcel', isDefault: true },
  ];

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock behavior
    (categoryManager.getAllCategories as jest.Mock).mockResolvedValue(mockCategories);
    (storageService.getAllExpenses as jest.Mock).mockResolvedValue([]);
  });

  describe('getTotalSpending', () => {
    it('should return 0 when there are no expenses', async () => {
      const total = await analyticsEngine.getTotalSpending();
      expect(total).toBe(0);
    });

    it('should return the sum of all expense amounts', async () => {
      const mockExpenses: ExpenseEntry[] = [
        { id: '1', amount: 100, categoryId: 'cat_food', timestamp: Date.now() },
        { id: '2', amount: 50, categoryId: 'cat_food', timestamp: Date.now() },
        { id: '3', amount: 25.50, categoryId: 'cat_food', timestamp: Date.now() },
      ];
      
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(mockExpenses);

      const total = await analyticsEngine.getTotalSpending();
      expect(total).toBe(175.50);
    });
  });

  describe('getCategorySpending', () => {
    it('should return empty analytics when there are no expenses', async () => {
      const analytics = await analyticsEngine.getCategorySpending();
      
      // Should include all categories (default + custom)
      expect(analytics.length).toBe(mockCategories.length);
      
      // All categories should have 0 spending
      analytics.forEach(item => {
        expect(item.totalAmount).toBe(0);
        expect(item.percentage).toBe(0);
      });
    });

    it('should calculate total spending per category correctly', async () => {
      const mockExpenses: ExpenseEntry[] = [
        { id: '1', amount: 100, categoryId: 'cat_food', timestamp: Date.now() },
        { id: '2', amount: 50, categoryId: 'cat_food', timestamp: Date.now() },
        { id: '3', amount: 75, categoryId: 'cat_transport', timestamp: Date.now() },
      ];
      
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(mockExpenses);

      const analytics = await analyticsEngine.getCategorySpending();

      // Find the analytics for our categories
      const foodAnalytics = analytics.find(a => a.category.id === 'cat_food')!;
      const transportAnalytics = analytics.find(a => a.category.id === 'cat_transport')!;

      expect(foodAnalytics.totalAmount).toBe(150);
      expect(transportAnalytics.totalAmount).toBe(75);
    });

    it('should rank categories by spending amount in descending order', async () => {
      const mockExpenses: ExpenseEntry[] = [
        { id: '1', amount: 100, categoryId: 'cat_food', timestamp: Date.now() },
        { id: '2', amount: 50, categoryId: 'cat_transport', timestamp: Date.now() },
        { id: '3', amount: 25, categoryId: 'cat_parcel', timestamp: Date.now() },
      ];
      
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(mockExpenses);

      const analytics = await analyticsEngine.getCategorySpending();

      // Find the analytics for our categories
      const foodAnalytics = analytics.find(a => a.category.id === 'cat_food')!;
      const transportAnalytics = analytics.find(a => a.category.id === 'cat_transport')!;
      const parcelAnalytics = analytics.find(a => a.category.id === 'cat_parcel')!;

      // Verify ranking (1 = highest spending)
      expect(foodAnalytics.rank).toBeLessThan(transportAnalytics.rank);
      expect(transportAnalytics.rank).toBeLessThan(parcelAnalytics.rank);
    });

    it('should calculate spending percentages correctly', async () => {
      const mockExpenses: ExpenseEntry[] = [
        { id: '1', amount: 60, categoryId: 'cat_food', timestamp: Date.now() },
        { id: '2', amount: 40, categoryId: 'cat_transport', timestamp: Date.now() },
      ];
      
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(mockExpenses);

      const analytics = await analyticsEngine.getCategorySpending();

      // Find the analytics for our categories
      const foodAnalytics = analytics.find(a => a.category.id === 'cat_food')!;
      const transportAnalytics = analytics.find(a => a.category.id === 'cat_transport')!;

      expect(foodAnalytics.percentage).toBe(60);
      expect(transportAnalytics.percentage).toBe(40);
    });

    it('should have percentages that sum to 100% when there are expenses', async () => {
      const mockExpenses: ExpenseEntry[] = [
        { id: '1', amount: 33.33, categoryId: 'cat_food', timestamp: Date.now() },
        { id: '2', amount: 33.33, categoryId: 'cat_transport', timestamp: Date.now() },
        { id: '3', amount: 33.34, categoryId: 'cat_parcel', timestamp: Date.now() },
      ];
      
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(mockExpenses);

      const analytics = await analyticsEngine.getCategorySpending();

      // Sum percentages for categories with spending
      const totalPercentage = analytics
        .filter(a => a.totalAmount > 0)
        .reduce((sum, item) => sum + item.percentage, 0);

      // Should be approximately 100% (allowing for floating point rounding)
      expect(totalPercentage).toBeCloseTo(100, 10);
    });

    it('should include custom categories in analytics', async () => {
      const customCategory: Category = { id: 'cat_custom', name: 'Entertainment', isDefault: false };
      const categoriesWithCustom = [...mockCategories, customCategory];
      
      (categoryManager.getAllCategories as jest.Mock).mockResolvedValue(categoriesWithCustom);
      
      const mockExpenses: ExpenseEntry[] = [
        { id: '1', amount: 50, categoryId: 'cat_custom', timestamp: Date.now() },
      ];
      
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(mockExpenses);

      const analytics = await analyticsEngine.getCategorySpending();

      // Find the analytics for our custom category
      const customAnalytics = analytics.find(a => a.category.id === 'cat_custom')!;

      expect(customAnalytics).toBeDefined();
      expect(customAnalytics.totalAmount).toBe(50);
      expect(customAnalytics.percentage).toBe(100);
    });

    it('should handle decimal amounts correctly', async () => {
      const mockExpenses: ExpenseEntry[] = [
        { id: '1', amount: 10.50, categoryId: 'cat_food', timestamp: Date.now() },
        { id: '2', amount: 20.75, categoryId: 'cat_food', timestamp: Date.now() },
        { id: '3', amount: 5.25, categoryId: 'cat_food', timestamp: Date.now() },
      ];
      
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(mockExpenses);

      const analytics = await analyticsEngine.getCategorySpending();
      const foodAnalytics = analytics.find(a => a.category.id === 'cat_food')!;

      expect(foodAnalytics.totalAmount).toBe(36.50);
    });

    it('should return all categories even if they have no expenses', async () => {
      const mockExpenses: ExpenseEntry[] = [
        { id: '1', amount: 100, categoryId: 'cat_food', timestamp: Date.now() },
      ];
      
      (storageService.getAllExpenses as jest.Mock).mockResolvedValue(mockExpenses);

      const analytics = await analyticsEngine.getCategorySpending();

      // Should return analytics for all categories
      expect(analytics.length).toBe(mockCategories.length);

      // Categories without expenses should have 0 amount and percentage
      const parcelAnalytics = analytics.find(a => a.category.name === 'Parcel')!;
      expect(parcelAnalytics.totalAmount).toBe(0);
      expect(parcelAnalytics.percentage).toBe(0);
    });
  });
});
