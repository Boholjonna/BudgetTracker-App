/**
 * Payments Screen
 * 
 * Screen for managing recurring payments that automatically affect daily spending calculations.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts';

type PaymentsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Payments'>;

interface PaymentsScreenProps {
  navigation: PaymentsScreenNavigationProp;
}

/**
 * Payments Screen Component
 * 
 * Allows users to manage recurring payments (rent, utilities, etc.)
 * that automatically calculate daily spending impact.
 */
export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recurring Payments</Text>
        <Text style={styles.description}>
          Manage your recurring payments like rent, utilities, and subscriptions. 
          These payments will automatically be calculated into your daily spending budget.
        </Text>
        
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
          <Text style={styles.comingSoonText}>
            This feature is under development. You'll be able to:
          </Text>
          <Text style={styles.featureList}>
            • Add weekly, bi-weekly, monthly, or quarterly payments{'\n'}
            • Set custom payment intervals{'\n'}
            • Automatically calculate daily spending impact{'\n'}
            • Track payment due dates{'\n'}
            • Categorize recurring expenses
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 32,
  },
  comingSoon: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 12,
  },
  comingSoonText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  featureList: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
});