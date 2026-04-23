/**
 * Theme Manager Tests
 * 
 * Unit tests for the Theme Manager component
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { themeManager } from './theme.manager';
import { storageService } from '../services/storage.service';
import { Theme } from '../models';

// Mock the storage service
jest.mock('../services/storage.service', () => ({
  storageService: {
    saveTheme: jest.fn(),
    getTheme: jest.fn(),
  },
}));

describe('Theme Manager', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getDefaultTheme', () => {
    it('should return the default green theme', () => {
      // Requirement 7.1: Default green theme
      const defaultTheme = themeManager.getDefaultTheme();
      
      expect(defaultTheme).toBeDefined();
      expect(defaultTheme.primaryColor).toBe('#4CAF50');
    });

    it('should return a new object each time (not a reference)', () => {
      const theme1 = themeManager.getDefaultTheme();
      const theme2 = themeManager.getDefaultTheme();
      
      // Should be equal in value
      expect(theme1).toEqual(theme2);
      
      // But not the same object reference
      expect(theme1).not.toBe(theme2);
    });
  });

  describe('setTheme', () => {
    it('should save the theme to storage', async () => {
      // Requirement 7.3, 7.4: Set and persist theme
      const customColor = '#FF5722';
      
      await themeManager.setTheme(customColor);
      
      expect(storageService.saveTheme).toHaveBeenCalledTimes(1);
      expect(storageService.saveTheme).toHaveBeenCalledWith({
        primaryColor: customColor,
      });
    });

    it('should handle different color formats', async () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000'];
      
      for (const color of colors) {
        await themeManager.setTheme(color);
      }
      
      expect(storageService.saveTheme).toHaveBeenCalledTimes(colors.length);
    });
  });

  describe('getTheme', () => {
    it('should return the stored theme when available', async () => {
      // Requirement 7.4, 7.5: Load theme from storage
      const storedTheme: Theme = { primaryColor: '#2196F3' };
      (storageService.getTheme as jest.Mock).mockResolvedValue(storedTheme);
      
      const theme = await themeManager.getTheme();
      
      expect(storageService.getTheme).toHaveBeenCalledTimes(1);
      expect(theme).toEqual(storedTheme);
    });

    it('should return the default theme when no theme is stored', async () => {
      // Requirement 7.1, 7.5: Return default when no stored theme
      (storageService.getTheme as jest.Mock).mockResolvedValue(null);
      
      const theme = await themeManager.getTheme();
      
      expect(storageService.getTheme).toHaveBeenCalledTimes(1);
      expect(theme.primaryColor).toBe('#4CAF50');
    });

    it('should return the default theme when storage returns undefined', async () => {
      (storageService.getTheme as jest.Mock).mockResolvedValue(undefined);
      
      const theme = await themeManager.getTheme();
      
      expect(theme.primaryColor).toBe('#4CAF50');
    });
  });

  describe('theme persistence workflow', () => {
    it('should persist and retrieve a custom theme', async () => {
      // Requirement 7.4: Theme persistence
      const customColor = '#9C27B0';
      const customTheme: Theme = { primaryColor: customColor };
      
      // Set the theme
      await themeManager.setTheme(customColor);
      
      // Mock storage to return the saved theme
      (storageService.getTheme as jest.Mock).mockResolvedValue(customTheme);
      
      // Get the theme
      const retrievedTheme = await themeManager.getTheme();
      
      expect(retrievedTheme.primaryColor).toBe(customColor);
    });

    it('should simulate app launch with stored theme', async () => {
      // Requirement 7.5: Load theme on app launch
      const storedTheme: Theme = { primaryColor: '#FF9800' };
      (storageService.getTheme as jest.Mock).mockResolvedValue(storedTheme);
      
      // Simulate app launch - get theme
      const theme = await themeManager.getTheme();
      
      expect(theme).toEqual(storedTheme);
      expect(storageService.getTheme).toHaveBeenCalled();
    });

    it('should simulate app launch without stored theme', async () => {
      // Requirement 7.1, 7.5: Load default theme on first launch
      (storageService.getTheme as jest.Mock).mockResolvedValue(null);
      
      // Simulate first app launch - get theme
      const theme = await themeManager.getTheme();
      
      expect(theme.primaryColor).toBe('#4CAF50');
    });
  });
});
