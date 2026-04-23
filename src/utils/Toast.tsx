/**
 * Toast Notification Component
 * 
 * Provides non-blocking success/error notifications.
 * Requirements: 10.2, 10.3
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

/**
 * Toast types
 */
export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

/**
 * Toast configuration
 */
interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * Toast context interface
 */
interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Toast Provider Props
 */
interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast Provider Component
 * 
 * Provides toast notification functionality throughout the app.
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>(ToastType.INFO);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(-100));

  /**
   * Show toast notification
   */
  const showToast = useCallback((config: ToastConfig) => {
    const { message, type, duration = 3000 } = config;
    
    setMessage(message);
    setType(type);
    setVisible(true);

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
      });
    }, duration);
  }, [fadeAnim, translateY]);

  /**
   * Convenience methods for different toast types
   */
  const showSuccess = useCallback((message: string) => {
    showToast({ message, type: ToastType.SUCCESS });
  }, [showToast]);

  const showError = useCallback((message: string) => {
    showToast({ message, type: ToastType.ERROR });
  }, [showToast]);

  const showInfo = useCallback((message: string) => {
    showToast({ message, type: ToastType.INFO });
  }, [showToast]);

  const showWarning = useCallback((message: string) => {
    showToast({ message, type: ToastType.WARNING });
  }, [showToast]);

  /**
   * Get background color based on toast type
   */
  const getBackgroundColor = (): string => {
    switch (type) {
      case ToastType.SUCCESS:
        return '#4CAF50';
      case ToastType.ERROR:
        return '#F44336';
      case ToastType.WARNING:
        return '#FF9800';
      case ToastType.INFO:
      default:
        return '#2196F3';
    }
  };

  /**
   * Get icon based on toast type
   */
  const getIcon = (): string => {
    switch (type) {
      case ToastType.SUCCESS:
        return '✓';
      case ToastType.ERROR:
        return '✕';
      case ToastType.WARNING:
        return '⚠';
      case ToastType.INFO:
      default:
        return 'ℹ';
    }
  };

  const value: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY }],
              backgroundColor: getBackgroundColor(),
            },
          ]}
        >
          <Text style={styles.toastIcon}>{getIcon()}</Text>
          <Text style={styles.toastMessage}>{message}</Text>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

/**
 * Hook to access toast functionality
 */
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    maxWidth: width - 40,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  toastIcon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 12,
    fontWeight: 'bold',
  },
  toastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
});
