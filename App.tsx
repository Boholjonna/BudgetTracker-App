/**
 * Budget Tracker App
 * 
 * Main application component that sets up providers and navigation.
 * Requirements: 9.3, 9.4
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { DataProvider } from './src/contexts/DataContext';
import { ToastProvider } from './src/utils/Toast';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <ToastProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </ToastProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
