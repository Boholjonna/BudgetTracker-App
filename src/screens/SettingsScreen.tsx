/**
 * Settings Screen
 * 
 * Screen for customizing application theme.
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
 * Predefined theme color options with gradients
 * Requirements: 7.2
 */
const THEME_COLORS = [
  { name: 'Green', color: '#4CAF50', gradient: ['#4CAF50', '#45a049'], isDefault: true },
  { name: 'Blue', color: '#2196F3', gradient: ['#2196F3', '#1976D2'], isDefault: false },
  { name: 'Purple', color: '#9C27B0', gradient: ['#9C27B0', '#7B1FA2'], isDefault: false },
  { name: 'Orange', color: '#FF9800', gradient: ['#FF9800', '#F57C00'], isDefault: false },
  { name: 'Red', color: '#F44336', gradient: ['#F44336', '#D32F2F'], isDefault: false },
  { name: 'Teal', color: '#009688', gradient: ['#009688', '#00695C'], isDefault: false },
  { name: 'Pink', color: '#E91E63', gradient: ['#E91E63', '#C2185B'], isDefault: false },
  { name: 'Indigo', color: '#3F51B5', gradient: ['#3F51B5', '#303F9F'], isDefault: false },
];

/**
 * Predefined gradient combinations
 */
const GRADIENT_PRESETS = [
  { name: 'Ocean', colors: ['#667eea', '#764ba2'] },
  { name: 'Sunset', colors: ['#f093fb', '#f5576c'] },
  { name: 'Forest', colors: ['#11998e', '#38ef7d'] },
  { name: 'Fire', colors: ['#ff9a9e', '#fecfef'] },
  { name: 'Sky', colors: ['#a8edea', '#fed6e3'] },
  { name: 'Royal', colors: ['#667eea', '#764ba2'] },
  { name: 'Mint', colors: ['#d299c2', '#fef9d7'] },
  { name: 'Cosmic', colors: ['#fa709a', '#fee140'] },
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
  const [showCustomGradient, setShowCustomGradient] = useState(false);
  const [customColor1, setCustomColor1] = useState('#4CAF50');
  const [customColor2, setCustomColor2] = useState('#45a049');
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
   * Handle gradient preset selection
   */
  const handleGradientPresetSelect = async (gradientColors: string[], gradientName: string) => {
    try {
      setIsUpdating(true);
      
      // Use the first color as the primary color for compatibility
      await setTheme(gradientColors[0]);
      
      toast.showSuccess(`Gradient theme "${gradientName}" applied`);
    } catch (error) {
      ErrorHandler.handle(error, 'updating gradient theme');
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle custom gradient creation
   */
  const handleCustomGradientApply = async () => {
    try {
      setIsUpdating(true);
      
      // Validate hex colors
      const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexRegex.test(customColor1) || !hexRegex.test(customColor2)) {
        Alert.alert('Invalid Color', 'Please enter valid hex colors (e.g., #FF5733)');
        return;
      }
      
      // Apply the custom gradient (use first color as primary)
      await setTheme(customColor1);
      
      setShowCustomGradient(false);
      toast.showSuccess('Custom gradient applied successfully!');
    } catch (error) {
      ErrorHandler.handle(error, 'applying custom gradient');
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

        {/* Gradient Presets */}
        <View style={styles.colorsSection}>
          <Text style={styles.sectionTitle}>🎨 Gradient Themes</Text>
          <Text style={styles.sectionSubtitle}>
            Choose from beautiful gradient combinations
          </Text>

          <View style={styles.gradientGrid}>
            {GRADIENT_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset.name}
                style={styles.gradientOption}
                onPress={() => handleGradientPresetSelect(preset.colors, preset.name)}
                disabled={isUpdating}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={preset.colors as [string, string]}
                  style={styles.gradientPreview}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.gradientName}>{preset.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Gradient Creator */}
        <View style={styles.colorsSection}>
          <Text style={styles.sectionTitle}>✨ Create Custom Gradient</Text>
          <Text style={styles.sectionSubtitle}>
            Design your own unique gradient theme
          </Text>

          <TouchableOpacity
            style={styles.customGradientButton}
            onPress={() => setShowCustomGradient(true)}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[customColor1, customColor2] as [string, string]}
              style={styles.customGradientPreview}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.customGradientText}>Create Custom Gradient</Text>
          </TouchableOpacity>
        </View>
        {/* Theme Color Options */}
        <View style={styles.colorsSection}>
          <Text style={styles.sectionTitle}>🎯 Solid Colors</Text>
          <Text style={styles.sectionSubtitle}>
            Select a solid color theme
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
                  <LinearGradient
                    colors={themeColor.gradient as [string, string]}
                    style={[
                      styles.colorCircle,
                      isSelected && styles.colorCircleSelected,
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </LinearGradient>
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

      {/* Custom Gradient Modal */}
      <Modal
        visible={showCustomGradient}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCustomGradient(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create Custom Gradient</Text>
            <TouchableOpacity
              onPress={() => setShowCustomGradient(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {/* Gradient Preview */}
            <View style={styles.gradientPreviewContainer}>
              <Text style={styles.previewLabel}>Preview</Text>
              <LinearGradient
                colors={[customColor1, customColor2] as [string, string]}
                style={styles.largeGradientPreview}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </View>

            {/* Color Inputs */}
            <View style={styles.colorInputsContainer}>
              <View style={styles.colorInputGroup}>
                <Text style={styles.colorInputLabel}>Start Color</Text>
                <View style={styles.colorInputRow}>
                  <View style={[styles.colorPreview, { backgroundColor: customColor1 }]} />
                  <TextInput
                    style={styles.colorInput}
                    value={customColor1}
                    onChangeText={setCustomColor1}
                    placeholder="#4CAF50"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.colorInputGroup}>
                <Text style={styles.colorInputLabel}>End Color</Text>
                <View style={styles.colorInputRow}>
                  <View style={[styles.colorPreview, { backgroundColor: customColor2 }]} />
                  <TextInput
                    style={styles.colorInput}
                    value={customColor2}
                    onChangeText={setCustomColor2}
                    placeholder="#45a049"
                    placeholderTextColor="#999"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </View>

            {/* Apply Button */}
            <TouchableOpacity
              style={styles.applyGradientButton}
              onPress={handleCustomGradientApply}
              disabled={isUpdating}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={[customColor1, customColor2] as [string, string]}
                style={styles.applyGradientButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.applyGradientButtonText}>
                  {isUpdating ? 'Applying...' : 'Apply Gradient'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  gradientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gradientOption: {
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
  gradientPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  customGradientButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  customGradientPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  customGradientText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#666',
  },
  modalContent: {
    padding: 20,
  },
  gradientPreviewContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  largeGradientPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  colorInputsContainer: {
    marginBottom: 32,
  },
  colorInputGroup: {
    marginBottom: 20,
  },
  colorInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  colorInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  colorInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  applyGradientButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  applyGradientButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  applyGradientButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
