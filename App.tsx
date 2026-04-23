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
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppNavigator />
        <StatusBar style="light" />
      </DataProvider>
    </ThemeProvider>
  );
}
