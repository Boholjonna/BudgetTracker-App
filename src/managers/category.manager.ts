/**
 * Category Manager
 * 
 * Manages expense categories (default and custom).
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { Category, ValidationResult } from '../models';
import { storageService } from '../services/storage.service';
import { validateNonEmptyString } from '../services/validation.service';
import { generateUUID } from '../utils/uuid';

/**
 * Default categories provided by the system
 * Requirements: 4.3
 */
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_food', name: 'Food', isDefault: true },
  { id: 'cat_parcel', name: 'Parcel', isDefault: true },
  { id: 'cat_transport', name: 'Transport', isDefault: true },
];

/**
 * Category Manager Interface
 */
export interface CategoryManager {
  createCategory(name: string): Promise<Category>;
  validateCategoryName(name: string): ValidationResult;
  getAllCategories(): Promise<Category[]>;
  getDefaultCategories(): Category[];
}

/**
 * Implementation of CategoryManager
 */
class CategoryManagerImpl implements CategoryManager {
  /**
   * Create a new custom category
   * Requirements: 4.1, 4.2, 4.5
   * 
   * @param name - The category name (must be non-empty)
   * @returns The created category
   * @throws Error if name is empty or storage fails
   */
  async createCategory(name: string): Promise<Category> {
    // Validate category name is not empty
    const validation = this.validateCategoryName(name);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid category name');
    }

    // Generate unique ID using expo-crypto
    const id = generateUUID();

    // Create category (custom categories are not default)
    const category: Category = {
      id,
      name: name.trim(),
      isDefault: false,
    };

    // Store category in local storage
    await storageService.saveCategory(category);

    return category;
  }

  /**
   * Validate a category name string input
   * Requirements: 4.1
   * 
   * @param name - The category name to validate
   * @returns ValidationResult indicating if the input is valid
   */
  validateCategoryName(name: string): ValidationResult {
    return validateNonEmptyString(name);
  }

  /**
   * Get all categories (default + custom)
   * Requirements: 4.4
   * 
   * @returns Array of all available categories
   */
  async getAllCategories(): Promise<Category[]> {
    // Get custom categories from storage
    const customCategories = await storageService.getAllCategories();
    
    // Combine default categories with custom categories
    return [...DEFAULT_CATEGORIES, ...customCategories];
  }

  /**
   * Get only the default categories
   * Requirements: 4.3
   * 
   * @returns Array of default categories
   */
  getDefaultCategories(): Category[] {
    return [...DEFAULT_CATEGORIES];
  }
}

/**
 * Singleton instance of the category manager
 */
export const categoryManager = new CategoryManagerImpl();

/**
 * Export default categories for testing purposes
 */
export { DEFAULT_CATEGORIES };
