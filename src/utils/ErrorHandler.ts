/**
 * Global Error Handler
 * 
 * Centralized error handling and user feedback system.
 * Requirements: 10.2, 10.3
 */

import { Alert } from 'react-native';

/**
 * Error types for categorization
 */
export enum ErrorType {
  VALIDATION = 'validation',
  STORAGE = 'storage',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

/**
 * Application error interface
 */
export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  userMessage: string;
  recoverable: boolean;
}

/**
 * Error Handler Class
 * 
 * Provides centralized error handling with user-friendly messages.
 */
export class ErrorHandler {
  /**
   * Handle an error and display appropriate user feedback
   * Requirements: 10.2, 10.3
   */
  static handle(error: unknown, context?: string): void {
    const appError = this.parseError(error, context);
    
    // Log error for debugging
    console.error(`[${appError.type}] ${context || 'Error'}:`, appError.message, appError.originalError);
    
    // Display user-friendly message
    Alert.alert(
      this.getErrorTitle(appError.type),
      appError.userMessage,
      [{ text: 'OK' }]
    );
  }

  /**
   * Parse unknown error into AppError
   */
  private static parseError(error: unknown, context?: string): AppError {
    if (error instanceof Error) {
      // Check error message for specific types
      if (error.message.includes('validation') || error.message.includes('invalid')) {
        return {
          type: ErrorType.VALIDATION,
          message: error.message,
          originalError: error,
          userMessage: error.message,
          recoverable: true,
        };
      }
      
      if (error.message.includes('storage') || error.message.includes('AsyncStorage')) {
        return {
          type: ErrorType.STORAGE,
          message: error.message,
          originalError: error,
          userMessage: 'Failed to save or load data. Please check your device storage and try again.',
          recoverable: true,
        };
      }
      
      return {
        type: ErrorType.UNKNOWN,
        message: error.message,
        originalError: error,
        userMessage: context 
          ? `An error occurred while ${context}. Please try again.`
          : 'An unexpected error occurred. Please try again.',
        recoverable: true,
      };
    }
    
    // Handle non-Error objects
    return {
      type: ErrorType.UNKNOWN,
      message: String(error),
      userMessage: context 
        ? `An error occurred while ${context}. Please try again.`
        : 'An unexpected error occurred. Please try again.',
      recoverable: true,
    };
  }

  /**
   * Get error title based on type
   */
  private static getErrorTitle(type: ErrorType): string {
    switch (type) {
      case ErrorType.VALIDATION:
        return 'Invalid Input';
      case ErrorType.STORAGE:
        return 'Storage Error';
      case ErrorType.NETWORK:
        return 'Connection Error';
      default:
        return 'Error';
    }
  }

  /**
   * Handle validation errors specifically
   * Requirements: 10.2
   */
  static handleValidation(message: string): void {
    Alert.alert('Invalid Input', message, [{ text: 'OK' }]);
  }

  /**
   * Handle storage errors specifically
   * Requirements: 10.3
   */
  static handleStorage(error: unknown): void {
    console.error('Storage error:', error);
    Alert.alert(
      'Storage Error',
      'Failed to save or load data. Please check your device storage and try again.',
      [{ text: 'OK' }]
    );
  }
}
