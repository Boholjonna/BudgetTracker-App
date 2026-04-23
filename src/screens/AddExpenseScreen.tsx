/**
 * Add Expense Screen
 * 
 * Screen for adding new expense entries with category selection and validation.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.4, 10.2, 10.3
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useData, useTheme } from '../contexts';
import { validatePositiveNumber } from '../services';

type AddExpenseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddExpense'>;

interface AddExpenseScreenProps {
  navigation: AddExpenseScreenNavigationProp;
}

/**
 * Add Expense Screen Component
 * 
 * Allows users to add expense entries with amount validation and category selection.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.4, 10.2, 10.3
 */
export const AddExpenseScreen: React.FC<AddExpenseScreenProps> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amountError, setAmountError] = useState<string | undefined>();
  const [categoryError, setCategoryError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addExpense, categories } = useData();
  const { theme } = useTheme();

  /**
   * Handle amount input change with validation
   * Requirements: 2.1, 10.2
   */
  const handleAmountChange = (text: string) => {
    setAmount(text);
    
    // Clear error when user starts typing
    if (amountError) {
      setAmountError(undefined);
    }
  };

  /**
   * Handle category selection
   * Requirements: 2.2, 4.4
   */
  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    
    // Clear error when user selects a category
    if (categoryError) {
      setCategoryError(undefined);
    }
  };

  /**
   * Validate and submit expense entry
   * Requirements: 2.1, 2.2, 2.3, 2.4, 10.2, 10.3
   */
  const handleSubmit = async () => {
    let hasError = false;

    // Validate amount (Requirement 2.1, 10.2)
    const amountValidation = validatePositiveNumber(amount);
    if (!amountValidation.isValid) {
      setAmountError(amountValidation.error);
      hasError = true;
    }

    // Validate category selection (Requirement 2.2)
    if (!categoryId) {
      setCategoryError('Please select a category');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Add expense entry (Requirement 2.3, 2.4)
      const numericAmount = parseFloat(amount);
      await addExpense(numericAmount, categoryId);
      
      // Get category name for display
      const selectedCategory = categories.find(cat => cat.id === categoryId);
      const categoryName = selectedCategory?.name || 'Unknown';
      
      // Show success feedback
      Alert.alert(
        'Success',
        `Expense of $${numericAmount.toFixed(2)} in category "${categoryName}" added successfully!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and navigate back
              setAmount('');
              setCategoryId('');
              setAmountError(undefined);
              setCategoryError(undefined);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      // Handle storage or other errors (Requirement 10.3)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add expense';
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
            Enter the expense amount and select a category. This will be deducted from your available funds.
          </Text>

          {/* Amount Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount ($)</Text>
            <TextInput
              style={[
                styles.input,
                amountError ? styles.inputError : null,
                { borderColor: amountError ? '#e74c3c' : theme.primaryColor },
              ]}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              keyboardType="decimal-pad"
              editable={!isSubmitting}
              autoFocus
            />
            {amountError && <Text style={styles.errorText}>{amountError}</Text>}
          </View>

          {/* Category Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Category</Text>
            <View
              style={[
                styles.pickerContainer,
                categoryError ? styles.inputError : null,
                { borderColor: categoryError ? '#e74c3c' : theme.primaryColor },
              ]}
            >
              <Picker
                selectedValue={categoryId}
                onValueChange={handleCategoryChange}
                enabled={!isSubmitting}
                style={styles.picker}
              >
                <Picker.Item label="Select a category..." value="" />
                {categories.map((category) => (
                  <Picker.Item
                    key={category.id}
                    label={category.name}
                    value={category.id}
                  />
                ))}
              </Picker>
            </View>
            {categoryError && <Text style={styles.errorText}>{categoryError}</Text>}
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
              {isSubmitting ? 'Adding...' : 'Add Expense'}
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
  pickerContainer: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
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
