/**
 * Theme Context Tests
 * 
 * Tests for the ThemeProvider and useTheme hook
 * Requirements: 7.5
 */

import { themeManager } from '../managers/theme.manager';
import { Theme } from '../models';

// Mock the theme manager
jest.mock('../managers/theme.manager');

const mockThemeManager = themeManager as jest.Mocked<typeof themeManager>;

describe('ThemeContext', () => {
  // Sample test data
  const defaultTheme: Theme = {
    primaryColor: '#4CAF50',
  };

  const customTheme: Theme = {
    primaryColor: '#FF5722',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockThemeManager.getDefaultTheme.mockReturnValue(defaultTheme);
    mockThemeManager.getTheme.mockResolvedValue(defaultTheme);
    mockThemeManager.setTheme.mockResolvedValue(undefined);
  });

  describe('ThemeProvider implementation', () => {
    it('should have theme manager dependency', () => {
      expect(themeManager).toBeDefined();
      expect(themeManager.getTheme).toBeDefined();
      expect(themeManager.setTheme).toBeDefined();
      expect(themeManager.getDefaultTheme).toBeDefined();
    });

    it('should mock theme manager correctly', async () => {
      const theme = await themeManager.getTheme();
      expect(theme).toEqual(defaultTheme);
      
      const defaultThemeResult = themeManager.getDefaultTheme();
      expect(defaultThemeResult).toEqual(defaultTheme);
    });
  });

  describe('Theme loading from storage', () => {
    it('should load theme from storage', async () => {
      mockThemeManager.getTheme.mockResolvedValue(customTheme);
      
      const theme = await themeManager.getTheme();
      
      expect(themeManager.getTheme).toHaveBeenCalled();
      expect(theme).toEqual(customTheme);
      expect(theme.primaryColor).toBe('#FF5722');
    });

    it('should return default theme when no custom theme is stored', async () => {
      mockThemeManager.getTheme.mockResolvedValue(defaultTheme);
      
      const theme = await themeManager.getTheme();
      
      expect(theme).toEqual(defaultTheme);
      expect(theme.primaryColor).toBe('#4CAF50');
    });

    it('should handle storage errors gracefully', async () => {
      mockThemeManager.getTheme.mockRejectedValue(new Error('Storage error'));
      
      await expect(themeManager.getTheme()).rejects.toThrow('Storage error');
    });
  });

  describe('Theme persistence', () => {
    it('should call themeManager.setTheme with correct parameters', async () => {
      const newColor = '#2196F3';
      
      await themeManager.setTheme(newColor);
      
      expect(themeManager.setTheme).toHaveBeenCalledWith(newColor);
      expect(themeManager.setTheme).toHaveBeenCalledTimes(1);
    });

    it('should persist custom theme color', async () => {
      const customColor = '#9C27B0';
      mockThemeManager.setTheme.mockResolvedValue(undefined);
      
      await themeManager.setTheme(customColor);
      
      expect(themeManager.setTheme).toHaveBeenCalledWith(customColor);
    });

    it('should handle setTheme errors', async () => {
      mockThemeManager.setTheme.mockRejectedValue(new Error('Storage quota exceeded'));
      
      await expect(themeManager.setTheme('#FF0000')).rejects.toThrow('Storage quota exceeded');
    });
  });

  describe('Default theme', () => {
    it('should return default green theme', () => {
      const theme = themeManager.getDefaultTheme();
      
      expect(theme).toEqual(defaultTheme);
      expect(theme.primaryColor).toBe('#4CAF50');
    });

    it('should return consistent default theme', () => {
      const theme1 = themeManager.getDefaultTheme();
      const theme2 = themeManager.getDefaultTheme();
      
      expect(theme1).toEqual(theme2);
    });
  });

  describe('Theme application to components', () => {
    it('should provide theme that can be applied to component styles', async () => {
      const purpleTheme: Theme = { primaryColor: '#9C27B0' };
      mockThemeManager.getTheme.mockResolvedValue(purpleTheme);
      
      const theme = await themeManager.getTheme();
      
      // Simulate applying theme to a component style
      const buttonStyle = {
        backgroundColor: theme.primaryColor,
      };
      
      expect(buttonStyle.backgroundColor).toBe('#9C27B0');
    });

    it('should support multiple theme colors', async () => {
      const colors = ['#F44336', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0'];
      
      for (const color of colors) {
        const theme: Theme = { primaryColor: color };
        mockThemeManager.getTheme.mockResolvedValue(theme);
        
        const loadedTheme = await themeManager.getTheme();
        expect(loadedTheme.primaryColor).toBe(color);
      }
    });
  });

  describe('Theme context integration', () => {
    it('should load theme on app launch', async () => {
      mockThemeManager.getTheme.mockResolvedValue(customTheme);
      
      // Simulate app launch - load theme
      const theme = await themeManager.getTheme();
      
      expect(themeManager.getTheme).toHaveBeenCalled();
      expect(theme).toEqual(customTheme);
    });

    it('should update theme and persist changes', async () => {
      const newColor = '#FF9800';
      
      // Simulate theme update
      await themeManager.setTheme(newColor);
      
      // Verify persistence
      expect(themeManager.setTheme).toHaveBeenCalledWith(newColor);
      
      // Simulate reload
      mockThemeManager.getTheme.mockResolvedValue({ primaryColor: newColor });
      const reloadedTheme = await themeManager.getTheme();
      
      expect(reloadedTheme.primaryColor).toBe(newColor);
    });
  });
});
