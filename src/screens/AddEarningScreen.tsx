/**
 * Add Earning Screen
 * 
 * Screen for adding new earning entries with validation.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 10.2, 10.3
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useData, useTheme } from '../contexts';
import { validatePositiveNumber } from '../services';

type AddEarningScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddEarning'>;

interface AddEarningScreenProps {
  navigation: AddEarningScreenNavigationProp;
}

/**
 * Add Earning Screen Component
 * 
 * Allows users to add earning entries with amount validation.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 10.2, 10.3
 */
export const AddEarningScreen: React.FC<AddEarningScreenProps> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addEarning } = useData();
  const { theme } = useTheme();

  /**
   * Handle amount input change with validation
   * Requirements: 1.1, 10.2
   */
  const handleAmountChange = (text: string) => {
    setAmount(text);
    
    // Clear error when user starts typing
    if (error) {
      setError(undefined);
    }
  };

  /**
   * Validate and submit earning entry
   * Requirements: 1.1, 1.2, 1.3, 10.2, 10.3
   */
  const handleSubmit = async () => {
    // Validate amount (Requirement 1.1, 10.2)
    const validation = validatePositiveNumber(amount);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Add earning entry (Requirement 1.2, 1.3)
      const numericAmount = parseFloat(amount);
      await addEarning(numericAmount);
      
      // Show success feedback
      Alert.alert(
        'Success',
        `Earning of $${numericAmount.toFixed(2)} added successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and navigate back
              setAmount('');
              setError(undefined);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      // Handle storage or other errors (Requirement 10.3)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add earning';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Instructions */}
          <Text style={styles.instructions}>
            Enter the amount you earned. This will be added to your available funds.
          </Text>

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={[
                styles.input,
                error ? styles.inputError : null,
                { borderColor: error ? '#e74c3c' : theme.primaryColor },
              ]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              keyboardType="decimal-pad"
              editable={!isSubmitting}
              autoFocus
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { backgroundColor: theme.primaryColor },
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Earning'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
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
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 8,
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
