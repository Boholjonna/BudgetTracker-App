/**
 * Settings Screen
 * 
 * Screen for customizing application theme.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts';
import { useToast } from '../utils/Toast';
import { ErrorHandler } from '../utils/ErrorHandler';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

/**
 * Predefined currency options
 */
const CURRENCIES = [
  { symbol: '$', name: 'US Dollar (USD)', code: 'USD' },
  { symbol: '€', name: 'Euro (EUR)', code: 'EUR' },
  { symbol: '£', name: 'British Pound (GBP)', code: 'GBP' },
  { symbol: '¥', name: 'Japanese Yen (JPY)', code: 'JPY' },
  { symbol: '₹', name: 'Indian Rupee (INR)', code: 'INR' },
  { symbol: '₱', name: 'Philippine Peso (PHP)', code: 'PHP' },
  { symbol: 'R$', name: 'Brazilian Real (BRL)', code: 'BRL' },
  { symbol: 'C$', name: 'Canadian Dollar (CAD)', code: 'CAD' },
  { symbol: 'A$', name: 'Australian Dollar (AUD)', code: 'AUD' },
  { symbol: 'Fr', name: 'Swiss Franc (CHF)', code: 'CHF' },
];

/**
 * Predefined theme color options
 * Requirements: 7.2
 */
const THEME_COLORS = [
  { name: 'Green', color: '#4CAF50', isDefault: true },
  { name: 'Blue', color: '#2196F3', isDefault: false },
  { name: 'Purple', color: '#9C27B0', isDefault: false },
  { name: 'Orange', color: '#FF9800', isDefault: false },
  { name: 'Red', color: '#F44336', isDefault: false },
  { name: 'Teal', color: '#009688', isDefault: false },
  { name: 'Pink', color: '#E91E63', isDefault: false },
  { name: 'Indigo', color: '#3F51B5', isDefault: false },
];

/**
 * Settings Screen Component
 * 
 * Allows users to customize the app's theme color with real-time preview.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */
export const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, setTheme, setCurrency, resetToDefault } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  /**
   * Handle currency selection
   */
  const handleCurrencySelect = async (currency: string, currencyName: string) => {
    try {
      setIsUpdating(true);
      
      // Update currency
      await setCurrency(currency);
      
      // Show success toast
      toast.showSuccess(`Currency changed to ${currencyName}`);
    } catch (error) {
      ErrorHandler.handle(error, 'updating currency');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle theme color selection
   * Requirements: 7.3, 7.4
   */
  const handleColorSelect = async (color: string, colorName: string) => {
    try {
      setIsUpdating(true);
      
      // Apply theme (Requirement 7.3, 7.4)
      await setTheme(color);
      
      // Show success toast
      toast.showSuccess(`Theme changed to ${colorName}`);
    } catch (error) {
      ErrorHandler.handle(error, 'updating theme');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle reset to default theme
   * Requirements: 7.1
   */
  const handleResetToDefault = () => {
    Alert.alert(
      'Reset Theme',
      'Reset to default green theme?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            resetToDefault();
            toast.showSuccess('Theme reset to default green');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Current Theme Display */}
        <View style={[styles.currentThemeCard, { borderColor: theme.primaryColor }]}>
          <Text style={styles.currentThemeLabel}>Current Theme</Text>
          <View style={styles.currentThemePreview}>
            <View
              style={[
                styles.currentThemeColor,
                { backgroundColor: theme.primaryColor },
              ]}
            />
            <Text style={styles.currentThemeColorCode}>{theme.primaryColor}</Text>
          </View>
          <Text style={styles.currencyDisplay}>Currency: {theme.currency}</Text>
        </View>

        {/* Currency Selection */}
        <View style={styles.colorsSection}>
          <Text style={styles.sectionTitle}>💱 Currency</Text>
          <Text style={styles.sectionSubtitle}>
            Select your preferred currency symbol
          </Text>

          <View style={styles.currencyGrid}>
            {CURRENCIES.map((curr) => {
              const isSelected = theme.currency === curr.symbol;
              
              return (
                <TouchableOpacity
                  key={curr.code}
                  style={[
                    styles.currencyOption,
                    isSelected && styles.currencyOptionSelected,
                  ]}
                  onPress={() => handleCurrencySelect(curr.symbol, curr.name)}
                  disabled={isUpdating}
                  activeOpacity={0.7}
                >
                  <Text style={styles.currencySymbol}>{curr.symbol}</Text>
                  <Text style={styles.currencyName}>{curr.code}</Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Theme Color Options */}
        <View style={styles.colorsSection}>
          <Text style={styles.sectionTitle}>Choose Theme Color</Text>
          <Text style={styles.sectionSubtitle}>
            Select a color to customize your app's appearance
          </Text>

          <View style={styles.colorGrid}>
            {THEME_COLORS.map((themeColor) => {
              const isSelected = theme.primaryColor === themeColor.color;
              
              return (
                <TouchableOpacity
                  key={themeColor.color}
                  style={[
                    styles.colorOption,
                    isSelected && styles.colorOptionSelected,
                  ]}
                  onPress={() => handleColorSelect(themeColor.color, themeColor.name)}
                  disabled={isUpdating}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: themeColor.color },
                      isSelected && styles.colorCircleSelected,
                    ]}
                  >
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                  <Text style={styles.colorName}>{themeColor.name}</Text>
                  {themeColor.isDefault && (
                    <Text style={styles.defaultLabel}>Default</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetToDefault}
          disabled={isUpdating}
          activeOpacity={0.7}
        >
          <Text style={styles.resetButtonText}>Reset to Default Theme</Text>
        </TouchableOpacity>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Your theme preference is saved automatically and will be applied every time you open the app.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  currentThemeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentThemeLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  currentThemePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currentThemeColor: {
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  currentThemeColorCode: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  currencyDisplay: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontWeight: '500',
  },
  currencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  currencyOption: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    position: 'relative',
  },
  currencyOptionSelected: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#f1f8f4',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  currencyName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  colorsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: '#333',
  },
  colorCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  colorCircleSelected: {
    borderWidth: 3,
    borderColor: '#fff',
  },
  checkmark: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  colorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  defaultLabel: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
  },
  infoText: {
    color: '#1565C0',
    fontSize: 14,
    lineHeight: 20,
  },
});
