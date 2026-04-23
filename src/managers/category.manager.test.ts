/**
 * Category Manager Unit Tests
 * 
 * Tests for category manager functionality
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { categoryManager, DEFAULT_CATEGORIES } from './category.manager';
import { storageService } from '../services/storage.service';

// Mock the storage service
jest.mock('../services/storage.service', () => ({
  storageService: {
    saveCategory: jest.fn(),
    getAllCategories: jest.fn(),
  },
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-1234'),
}));

describe('CategoryManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a valid custom category and return it', async () => {
      const name = 'Entertainment';
      
      const result = await categoryManager.createCategory(name);

      expect(result).toEqual({
        id: 'test-uuid-1234',
        name: 'Entertainment',
        isDefault: false,
      });

      expect(storageService.saveCategory).toHaveBeenCalledWith({
        id: 'test-uuid-1234',
        name: 'Entertainment',
        isDefault: false,
      });
    });

    it('should trim whitespace from category names', async () => {
      const name = '  Shopping  ';
      
      const result = await categoryManager.createCategory(name);

      expect(result.name).toBe('Shopping');
      expect(storageService.saveCategory).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Shopping' })
      );
    });

    it('should reject empty category name', async () => {
      await expect(categoryManager.createCategory('')).rejects.toThrow(
        'Input cannot be empty or contain only whitespace'
      );

      expect(storageService.saveCategory).not.toHaveBeenCalled();
    });

    it('should reject whitespace-only category name', async () => {
      await expect(categoryManager.createCategory('   ')).rejects.toThrow(
        'Input cannot be empty or contain only whitespace'
      );

      expect(storageService.saveCategory).not.toHaveBeenCalled();
    });

    it('should generate unique IDs for each category', async () => {
      const { v4: uuidv4 } = require('uuid');
      uuidv4.mockReturnValueOnce('uuid-1').mockReturnValueOnce('uuid-2');

      const result1 = await categoryManager.createCategory('Category 1');
      const result2 = await categoryManager.createCategory('Category 2');

      expect(result1.id).toBe('uuid-1');
      expect(result2.id).toBe('uuid-2');
      expect(result1.id).not.toBe(result2.id);
    });

    it('should mark custom categories as not default', async () => {
      const result = await categoryManager.createCategory('Custom');

      expect(result.isDefault).toBe(false);
    });
  });

  describe('validateCategoryName', () => {
    it('should validate non-empty strings', () => {
      const result = categoryManager.validateCategoryName('Food');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty strings', () => {
      const result = categoryManager.validateCategoryName('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input cannot be empty or contain only whitespace');
    });

    it('should reject whitespace-only strings', () => {
      const result = categoryManager.validateCategoryName('   ');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Input cannot be empty or contain only whitespace');
    });

    it('should accept strings with leading/trailing whitespace', () => {
      const result = categoryManager.validateCategoryName('  Valid  ');
      expect(result.isValid).toBe(true);
    });
  });

  describe('getAllCategories', () => {
    it('should return default categories when no custom categories exist', async () => {
      (storageService.getAllCategories as jest.Mock).mockResolvedValue([]);

      const categories = await categoryManager.getAllCategories();

      expect(categories).toEqual(DEFAULT_CATEGORIES);
      expect(categories).toHaveLength(3);
      expect(categories.map(c => c.name)).toEqual(['Food', 'Parcel', 'Transport']);
    });

    it('should return default categories plus custom categories', async () => {
      const customCategories = [
        { id: 'custom-1', name: 'Entertainment', isDefault: false },
        { id: 'custom-2', name: 'Shopping', isDefault: false },
      ];
      (storageService.getAllCategories as jest.Mock).mockResolvedValue(customCategories);

      const categories = await categoryManager.getAllCategories();

      expect(categories).toHaveLength(5);
      expect(categories.slice(0, 3)).toEqual(DEFAULT_CATEGORIES);
      expect(categories.slice(3)).toEqual(customCategories);
    });

    it('should always include default categories', async () => {
      const customCategories = [
        { id: 'custom-1', name: 'Custom', isDefault: false },
      ];
      (storageService.getAllCategories as jest.Mock).mockResolvedValue(customCategories);

      const categories = await categoryManager.getAllCategories();

      const defaultCategoryNames = categories
        .filter(c => c.isDefault)
        .map(c => c.name);

      expect(defaultCategoryNames).toEqual(['Food', 'Parcel', 'Transport']);
    });

    it('should handle storage errors gracefully', async () => {
      (storageService.getAllCategories as jest.Mock).mockRejectedValue(
        new Error('Storage error')
      );

      await expect(categoryManager.getAllCategories()).rejects.toThrow('Storage error');
    });
  });

  describe('getDefaultCategories', () => {
    it('should return the three default categories', () => {
      const categories = categoryManager.getDefaultCategories();

      expect(categories).toHaveLength(3);
      expect(categories).toEqual([
        { id: 'cat_food', name: 'Food', isDefault: true },
        { id: 'cat_parcel', name: 'Parcel', isDefault: true },
        { id: 'cat_transport', name: 'Transport', isDefault: true },
      ]);
    });

    it('should return a new array each time (not mutate original)', () => {
      const categories1 = categoryManager.getDefaultCategories();
      const categories2 = categoryManager.getDefaultCategories();

      expect(categories1).toEqual(categories2);
      expect(categories1).not.toBe(categories2);
    });

    it('should return categories marked as default', () => {
      const categories = categoryManager.getDefaultCategories();

      expect(categories.every(c => c.isDefault)).toBe(true);
    });
  });

  describe('DEFAULT_CATEGORIES', () => {
    it('should contain food, parcel, and transport', () => {
      expect(DEFAULT_CATEGORIES).toHaveLength(3);
      
      const names = DEFAULT_CATEGORIES.map(c => c.name);
      expect(names).toContain('Food');
      expect(names).toContain('Parcel');
      expect(names).toContain('Transport');
    });

    it('should have predefined IDs', () => {
      const ids = DEFAULT_CATEGORIES.map(c => c.id);
      expect(ids).toContain('cat_food');
      expect(ids).toContain('cat_parcel');
      expect(ids).toContain('cat_transport');
    });

    it('should all be marked as default', () => {
      expect(DEFAULT_CATEGORIES.every(c => c.isDefault)).toBe(true);
    });
  });
});
