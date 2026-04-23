/**
 * Theme Context Provider
 * 
 * Provides centralized state management for application theme.
 * Loads theme from storage on mount and provides hooks for accessing and updating theme.
 * Requirements: 7.5
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Theme } from '../models';
import { themeManager } from '../managers';

/**
 * Theme Context State Interface
 */
interface ThemeContextState {
  // Current theme
  theme: Theme;
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  setTheme: (color: string) => Promise<void>;
  resetToDefault: () => Theme;
}

/**
 * Create the context with undefined default value
 */
const ThemeContext = createContext<ThemeContextState | undefined>(undefined);

/**
 * Theme Provider Props
 */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Theme Context Provider Component
 * 
 * Manages application theme state and provides hooks for accessing and updating theme.
 * Loads theme from storage on mount and applies it to app components.
 * Requirements: 7.5
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(themeManager.getDefaultTheme());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Load theme from storage on mount
   * Requirements: 7.5
   */
  useEffect(() => {
    const loadTheme = async () => {
      try {
        setIsLoading(true);
        const loadedTheme = await themeManager.getTheme();
        setThemeState(loadedTheme);
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
        // Fall back to default theme on error
        setThemeState(themeManager.getDefaultTheme());
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  /**
   * Set and persist a new theme color
   * Requirements: 7.5
   * 
   * @param color - Hex color code for the primary theme color
   */
  const setTheme = useCallback(async (color: string): Promise<void> => {
    try {
      // Persist theme using theme manager
      await themeManager.setTheme(color);
      
      // Update local state
      setThemeState({ primaryColor: color });
    } catch (error) {
      console.error('Failed to set theme:', error);
      throw error;
    }
  }, []);

  /**
   * Reset theme to default green theme
   * Requirements: 7.5
   * 
   * @returns The default theme
   */
  const resetToDefault = useCallback((): Theme => {
    const defaultTheme = themeManager.getDefaultTheme();
    setThemeState(defaultTheme);
    
    // Persist default theme asynchronously
    themeManager.setTheme(defaultTheme.primaryColor).catch((error) => {
      console.error('Failed to persist default theme:', error);
    });
    
    return defaultTheme;
  }, []);

  const value: ThemeContextState = {
    theme,
    isLoading,
    setTheme,
    resetToDefault,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to access the theme context
 * Requirements: 7.5
 * 
 * @throws Error if used outside of ThemeProvider
 */
export const useTheme = (): ThemeContextState => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};
