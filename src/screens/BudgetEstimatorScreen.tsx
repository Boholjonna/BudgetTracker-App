/**
 * Budget Estimator Screen
 * 
 * Screen for calculating daily budget based on available amount and time period.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useData, useTheme } from '../contexts';
import { budgetCalculator } from '../managers';
import { BudgetEstimate } from '../models';

type BudgetEstimatorScreenNavigationProp = StackNavigationProp<RootStackParamList, 'BudgetEstimator'>;

interface BudgetEstimatorScreenProps {
  navigation: BudgetEstimatorScreenNavigationProp;
}

/**
 * Budget Estimator Screen Component
 * 
 * Allows users to calculate daily budget based on available amount and custom date range.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */
export const BudgetEstimatorScreen: React.FC<BudgetEstimatorScreenProps> = ({ navigation }) => {
  const { availableFunds } = useData();
  const { theme } = useTheme();

  // State for inputs
  const [customAmount, setCustomAmount] = useState(availableFunds.toString());
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // 7 days from now
  
  // State for date pickers
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  // State for calculation result
  const [estimate, setEstimate] = useState<BudgetEstimate | null>(null);

  /**
   * Calculate daily budget whenever inputs change
   * Requirements: 3.1, 3.6
   */
  useEffect(() => {
    const amount = parseFloat(customAmount) || 0;
    
    try {
      const result = budgetCalculator.calculateDailyBudget(amount, startDate, endDate);
      setEstimate(result);
    } catch (error) {
      // Invalid date range or negative amount
      setEstimate(null);
    }
  }, [customAmount, startDate, endDate]);

  /**
   * Update available funds when context changes
   */
  useEffect(() => {
    setCustomAmount(availableFunds.toString());
  }, [availableFunds]);

  /**
   * Handle start date change
   * Requirements: 3.5
   */
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  /**
   * Handle end date change
   * Requirements: 3.5
   */
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Instructions */}
        <Text style={styles.instructions}>
          Calculate your daily budget by entering an amount and selecting a time period.
        </Text>

        {/* Available Amount Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Available Amount ($)</Text>
          <TextInput
            style={[styles.input, { borderColor: theme.primaryColor }]}
            value={customAmount}
            onChangeText={setCustomAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Date Range Selection */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          
          {/* Start Date */}
          <View style={styles.dateInputContainer}>
            <Text style={styles.label}>Start Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.primaryColor }]}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
            </TouchableOpacity>
          </View>

          {/* End Date */}
          <View style={styles.dateInputContainer}>
            <Text style={styles.label}>End Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.primaryColor }]}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateButtonText}>{formatDate(endDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Pickers */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartDateChange}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndDateChange}
          />
        )}

        {/* Budget Estimate Display */}
        {estimate && (
          <View style={[styles.resultCard, { borderColor: theme.primaryColor }]}>
            <Text style={styles.resultTitle}>Daily Budget</Text>
            <Text style={[styles.resultAmount, { color: theme.primaryColor }]}>
              ${estimate.dailyBudget.toFixed(2)}
            </Text>
            
            <View style={styles.resultDetails}>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Total Amount:</Text>
                <Text style={styles.resultValue}>${estimate.availableAmount.toFixed(2)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Number of Days:</Text>
                <Text style={styles.resultValue}>{estimate.numberOfDays}</Text>
              </View>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Period:</Text>
                <Text style={styles.resultValue}>
                  {formatDate(estimate.startDate)} - {formatDate(estimate.endDate)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {!estimate && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              Please enter a valid amount and date range (end date must be on or after start date).
            </Text>
          </View>
        )}
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
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
    fontSize: 18,
    color: '#333',
  },
  dateSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
    padding: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginTop: 8,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  resultAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  resultDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  errorCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
  },
});
