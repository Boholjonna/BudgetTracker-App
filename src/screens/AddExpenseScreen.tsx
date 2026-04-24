/**
 * Add Expense Screen
 * 
 * Screen for adding new expense entries with category selection and validation.
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 4.4, 10.2, 10.3
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Modal, Alert, FlatList } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useData, useTheme } from '../contexts';
import { validatePositiveNumber } from '../services';
import { useToast } from '../utils/Toast';
import { ErrorHandler } from '../utils/ErrorHandler';

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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryError, setNewCategoryError] = useState<string | undefined>();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  
  const { addExpense, categories, addCategory } = useData();
  const { theme } = useTheme();
  const toast = useToast();

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
    if (value === 'ADD_NEW_CATEGORY') {
      setShowCategoryModal(false);
      setShowNewCategoryModal(true);
      return;
    }
    
    setCategoryId(value);
    setShowCategoryModal(false);
    
    // Clear error when user selects a category
    if (categoryError) {
      setCategoryError(undefined);
    }
  };

  /**
   * Get selected category name for display
   */
  const getSelectedCategoryName = () => {
    if (!categoryId) return 'Select a category...';
    const selectedCategory = categories.find(cat => cat.id === categoryId);
    return selectedCategory?.name || 'Select a category...';
  };

  /**
   * Handle new category creation
   */
  const handleAddNewCategory = async () => {
    // Validate category name
    if (!newCategoryName.trim()) {
      setNewCategoryError('Category name is required');
      return;
    }

    // Check if category already exists
    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );
    
    if (existingCategory) {
      setNewCategoryError('Category already exists');
      return;
    }

    try {
      setIsAddingCategory(true);
      
      // Add new category
      const newCategory = await addCategory(newCategoryName.trim());
      
      // Select the new category
      setCategoryId(newCategory.id);
      
      // Close modal and reset form
      setShowNewCategoryModal(false);
      setNewCategoryName('');
      setNewCategoryError(undefined);
      
      toast.showSuccess(`Category "${newCategoryName.trim()}" added successfully!`);
    } catch (err) {
      ErrorHandler.handle(err, 'adding category');
    } finally {
      setIsAddingCategory(false);
    }
  };

  /**
   * Handle new category modal close
   */
  const handleCloseNewCategoryModal = () => {
    setShowNewCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryError(undefined);
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
      
      // Show success toast
      toast.showSuccess(`Expense of $${numericAmount.toFixed(2)} in "${categoryName}" added successfully!`);
      
      // Clear form and navigate back
      setAmount('');
      setCategoryId('');
      setAmountError(undefined);
      setCategoryError(undefined);
      navigation.goBack();
    } catch (err) {
      // Handle storage or other errors (Requirement 10.3)
      ErrorHandler.handle(err, 'adding expense');
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
            <Text style={styles.label}>Amount ({theme.currency})</Text>
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
            <TouchableOpacity
              style={[
                styles.dropdownButton,
                categoryError ? styles.inputError : null,
                { borderColor: categoryError ? '#e74c3c' : theme.primaryColor },
              ]}
              onPress={() => setShowCategoryModal(true)}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dropdownButtonText,
                !categoryId && styles.dropdownPlaceholder
              ]}>
                {getSelectedCategoryName()}
              </Text>
              <Text style={[styles.dropdownArrow, { color: theme.primaryColor }]}>▼</Text>
            </TouchableOpacity>
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

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <TouchableOpacity
          style={styles.categoryModalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryModal(false)}
        >
          <View style={styles.categoryModalContent}>
            <Text style={styles.categoryModalTitle}>Select Category</Text>
            <ScrollView style={styles.categoryScrollView}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    categoryId === category.id && styles.categoryOptionSelected,
                  ]}
                  onPress={() => handleCategoryChange(category.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      categoryId === category.id && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {category.name}
                  </Text>
                  {categoryId === category.id && (
                    <Text style={[styles.checkmark, { color: theme.primaryColor }]}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
              
              {/* Add New Category Option */}
              <TouchableOpacity
                style={[styles.categoryOption, styles.addNewCategoryOption]}
                onPress={() => handleCategoryChange('ADD_NEW_CATEGORY')}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryOptionText, { color: theme.primaryColor, fontWeight: '600' }]}>
                  ➕ Add New Category
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add New Category Modal */}
      <Modal
        visible={showNewCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseNewCategoryModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Category</Text>
            <TouchableOpacity
              onPress={handleCloseNewCategoryModal}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalInstructions}>
              Enter a name for the new expense category. This will be available for future expenses.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category Name</Text>
              <TextInput
                style={[
                  styles.input,
                  newCategoryError ? styles.inputError : null,
                  { borderColor: newCategoryError ? '#e74c3c' : theme.primaryColor },
                ]}
                value={newCategoryName}
                onChangeText={(text) => {
                  setNewCategoryName(text);
                  if (newCategoryError) {
                    setNewCategoryError(undefined);
                  }
                }}
                placeholder="e.g., Groceries, Transportation, Entertainment"
                editable={!isAddingCategory}
                autoFocus
                maxLength={50}
              />
              {newCategoryError && <Text style={styles.errorText}>{newCategoryError}</Text>}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={handleCloseNewCategoryModal}
                disabled={isAddingCategory}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalAddButton,
                  { backgroundColor: theme.primaryColor },
                  isAddingCategory && styles.modalButtonDisabled,
                ]}
                onPress={handleAddNewCategory}
                disabled={isAddingCategory}
              >
                <Text style={styles.modalAddButtonText}>
                  {isAddingCategory ? 'Adding...' : 'Add Category'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  dropdownButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
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
  modalInstructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalAddButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  categoryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  categoryModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  categoryModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  categoryScrollView: {
    maxHeight: 400,
  },
  categoryOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryOptionSelected: {
    backgroundColor: '#E8F5E9',
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
  },
  categoryOptionTextSelected: {
    fontWeight: '600',
  },
  addNewCategoryOption: {
    backgroundColor: '#FFF9E5',
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
