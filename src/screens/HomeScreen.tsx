/**
 * Home Screen
 * 
 * Main screen displaying available funds and navigation to other features.
 * Requirements: 1.3, 2.4
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useData, useTheme } from '../contexts';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

/**
 * Home Screen Component
 * 
 * Displays current available funds and provides navigation buttons to all features.
 * Requirements: 1.3, 2.4
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { availableFunds, isLoading } = useData();
  const { theme } = useTheme();

  const navigationButtons = [
    { title: 'Add Earning', screen: 'AddEarning' as const, icon: '💰' },
    { title: 'Add Expense', screen: 'AddExpense' as const, icon: '💸' },
    { title: 'Budget Estimator', screen: 'BudgetEstimator' as const, icon: '📊' },
    { title: 'Analytics', screen: 'Analytics' as const, icon: '📈' },
    { title: 'Manage Categories', screen: 'CategoryManager' as const, icon: '🏷️' },
    { title: 'Data Management', screen: 'DataManagement' as const, icon: '🗂️' },
    { title: 'Settings', screen: 'Settings' as const, icon: '⚙️' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Available Funds Display */}
        <View style={[styles.fundsCard, { borderColor: theme.primaryColor }]}>
          <Text style={styles.fundsLabel}>Available Funds</Text>
          {isLoading ? (
            <Text style={styles.fundsAmount}>Loading...</Text>
          ) : (
            <Text style={[styles.fundsAmount, { color: theme.primaryColor }]}>
              ${availableFunds.toFixed(2)}
            </Text>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonsContainer}>
          {navigationButtons.map((button) => (
            <TouchableOpacity
              key={button.screen}
              style={[styles.navButton, { backgroundColor: theme.primaryColor }]}
              onPress={() => navigation.navigate(button.screen)}
              activeOpacity={0.7}
            >
              <Text style={styles.navButtonIcon}>{button.icon}</Text>
              <Text style={styles.navButtonText}>{button.title}</Text>
            </TouchableOpacity>
          ))}
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
  fundsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
  },
  fundsLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  fundsAmount: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  buttonsContainer: {
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  navButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
