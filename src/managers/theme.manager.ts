/**
 * Theme Manager
 * 
 * Manages application theme customization, persistence, and loading.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { Theme } from '../models';
import { storageService } from '../services/storage.service';

/**
 * Default green theme color with USD currency
 * Requirement: 7.1
 */
const DEFAULT_THEME: Theme = {
  primaryColor: '#4CAF50', // Material Design Green 500
  currency: '$', // Default to USD
};

/**
 * Theme Manager Interface
 */
export interface ThemeManager {
  setTheme(color: string, currency?: string): Promise<void>;
  setCurrency(currency: string): Promise<void>;
  getTheme(): Promise<Theme>;
  getDefaultTheme(): Theme;
}

/**
 * Implementation of ThemeManager
 */
class ThemeManagerImpl implements ThemeManager {
  /**
   * Set and persist a custom theme color
   * Requirements: 7.3, 7.4
   * 
   * @param color - Hex color code for the primary theme color
   * @param currency - Optional currency symbol
   */
  async setTheme(color: string, currency?: string): Promise<void> {
    // Get current theme to preserve currency if not provided
    const currentTheme = await this.getTheme();
    
    const theme: Theme = {
      primaryColor: color,
      currency: currency || currentTheme.currency,
    };
    
    // Persist theme to storage (Requirement 7.4)
    await storageService.saveTheme(theme);
  }

  /**
   * Set and persist currency symbol
   * Requirements: 7.3, 7.4
   * 
   * @param currency - Currency symbol to use
   */
  async setCurrency(currency: string): Promise<void> {
    // Get current theme to preserve color
    const currentTheme = await this.getTheme();
    
    const theme: Theme = {
      primaryColor: currentTheme.primaryColor,
      currency: currency,
    };
    
    // Persist theme to storage (Requirement 7.4)
    await storageService.saveTheme(theme);
  }

  /**
   * Get the current theme, loading from storage or returning default
   * Requirements: 7.4, 7.5
   * 
   * @returns The current theme (from storage) or default green theme
   */
  async getTheme(): Promise<Theme> {
    // Load theme from storage (Requirement 7.5)
    const storedTheme = await storageService.getTheme();
    
    // Return stored theme if available, otherwise return default (Requirement 7.1)
    return storedTheme || DEFAULT_THEME;
  }

  /**
   * Get the default green theme
   * Requirement: 7.1
   * 
   * @returns The default green theme
   */
  getDefaultTheme(): Theme {
    return { ...DEFAULT_THEME };
  }
}

/**
 * Singleton instance of the theme manager
 */
export const themeManager = new ThemeManagerImpl();
