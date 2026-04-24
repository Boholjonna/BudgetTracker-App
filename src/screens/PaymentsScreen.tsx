/**
 * Payments Screen
 * 
 * Screen for managing recurring payments that automatically affect daily spending calculations.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme, useData } from '../contexts';
import { RecurringPayment } from '../models';

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
  const { recurringPayments, addRecurringPayment, deleteRecurringPayment } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentFrequency, setNewPaymentFrequency] = useState<'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [newPaymentCategory, setNewPaymentCategory] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [amountError, setAmountError] = useState<string | undefined>();
  const [categoryError, setCategoryError] = useState<string | undefined>();

  const frequencyOptions = [
    { value: 'weekly' as const, label: 'Weekly', days: 7 },
    { value: 'bi-weekly' as const, label: 'Bi-Weekly', days: 14 },
    { value: 'monthly' as const, label: 'Monthly', days: 30 },
    { value: 'quarterly' as const, label: 'Quarterly', days: 90 },
    { value: 'yearly' as const, label: 'Yearly', days: 365 },
  ];

  const getFrequencyLabel = (frequency: string) => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    return option?.label || frequency;
  };

  const getDailyImpact = (amount: number, frequency: string) => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    if (!option) return 0;
    return amount / option.days;
  };

  const getTotalDailyImpact = () => {
    return recurringPayments.reduce((total, payment) => {
      return total + getDailyImpact(payment.amount, payment.frequency);
    }, 0);
  };

  const handleAddPayment = async () => {
    let hasError = false;

    // Validate name
    if (!newPaymentName.trim()) {
      setNameError('Payment name is required');
      hasError = true;
    }

    // Validate amount
    const amount = parseFloat(newPaymentAmount);
    if (!newPaymentAmount || isNaN(amount) || amount <= 0) {
      setAmountError('Please enter a valid amount');
      hasError = true;
    }

    // Validate category
    if (!newPaymentCategory.trim()) {
      setCategoryError('Category is required');
      hasError = true;
    }

    if (hasError) return;

    try {
      // Add payment via DataContext
      await addRecurringPayment(
        newPaymentName.trim(),
        parseFloat(newPaymentAmount),
        newPaymentFrequency,
        newPaymentCategory.trim()
      );
      
      // Reset form
      setNewPaymentName('');
      setNewPaymentAmount('');
      setNewPaymentFrequency('monthly');
      setNewPaymentCategory('');
      setNameError(undefined);
      setAmountError(undefined);
      setCategoryError(undefined);
      setShowAddModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to add recurring payment. Please try again.');
    }
  };

  const handleDeletePayment = (id: string) => {
    Alert.alert(
      'Delete Payment',
      'Are you sure you want to delete this recurring payment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecurringPayment(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete payment. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getGradientColors = (baseColor: string): [string, string] => {
    const colors: { [key: string]: [string, string] } = {
      '#4CAF50': ['#66BB6A', '#43A047'],
      '#2196F3': ['#42A5F5', '#1E88E5'],
      '#FF9800': ['#FFA726', '#FB8C00'],
      '#9C27B0': ['#AB47BC', '#8E24AA'],
      '#F44336': ['#EF5350', '#E53935'],
      '#00BCD4': ['#26C6DA', '#00ACC1'],
      '#FFEB3B': ['#FFEE58', '#FDD835'],
      '#795548': ['#8D6E63', '#6D4C41'],
    };
    return colors[baseColor] || [baseColor, baseColor];
  };

  const [gradientStart, gradientEnd] = getGradientColors(theme.primaryColor);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header Card */}
        <LinearGradient
          colors={[gradientStart, gradientEnd] as const}
          style={styles.headerCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.headerTitle}>Recurring Payments</Text>
          <Text style={styles.headerSubtitle}>
            Track bills and subscriptions that affect your daily budget
          </Text>
        </LinearGradient>

        {/* Daily Impact Card */}
        {recurringPayments.length > 0 && (
          <View style={styles.impactCard}>
            <Text style={styles.impactLabel}>Daily Budget Impact</Text>
            <Text style={styles.impactValue}>
              {theme.currency}{getTotalDailyImpact().toFixed(2)}/day
            </Text>
            <Text style={styles.impactSubtext}>
              From {recurringPayments.length} recurring payment{recurringPayments.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Add Payment Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primaryColor }]}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add Recurring Payment</Text>
        </TouchableOpacity>

        {/* Payments List */}
        {recurringPayments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>▭</Text>
            <Text style={styles.emptyStateTitle}>No Recurring Payments</Text>
            <Text style={styles.emptyStateText}>
              Add your recurring bills, rent, subscriptions, and other regular payments to track their impact on your daily budget.
            </Text>
          </View>
        ) : (
          <View style={styles.paymentsList}>
            {recurringPayments.map((payment) => (
              <View key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentHeader}>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>{payment.name}</Text>
                    <Text style={styles.paymentCategory}>{payment.category}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeletePayment(payment.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.paymentDetails}>
                  <View style={styles.paymentDetailItem}>
                    <Text style={styles.paymentDetailLabel}>Amount</Text>
                    <Text style={styles.paymentDetailValue}>
                      {theme.currency}{payment.amount.toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={styles.paymentDetailItem}>
                    <Text style={styles.paymentDetailLabel}>Frequency</Text>
                    <Text style={styles.paymentDetailValue}>
                      {getFrequencyLabel(payment.frequency)}
                    </Text>
                  </View>
                  
                  <View style={styles.paymentDetailItem}>
                    <Text style={styles.paymentDetailLabel}>Daily Impact</Text>
                    <Text style={[styles.paymentDetailValue, { color: '#FF6B6B' }]}>
                      {theme.currency}{getDailyImpact(payment.amount, payment.frequency).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Add Payment Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Recurring Payment</Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Payment Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Payment Name</Text>
              <TextInput
                style={[
                  styles.input,
                  nameError ? styles.inputError : null,
                  { borderColor: nameError ? '#e74c3c' : theme.primaryColor },
                ]}
                value={newPaymentName}
                onChangeText={(text) => {
                  setNewPaymentName(text);
                  if (nameError) setNameError(undefined);
                }}
                placeholder="e.g., Rent, Netflix, Electricity"
                maxLength={50}
              />
              {nameError && <Text style={styles.errorText}>{nameError}</Text>}
            </View>

            {/* Amount */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Amount ({theme.currency})</Text>
              <TextInput
                style={[
                  styles.input,
                  amountError ? styles.inputError : null,
                  { borderColor: amountError ? '#e74c3c' : theme.primaryColor },
                ]}
                value={newPaymentAmount}
                onChangeText={(text) => {
                  setNewPaymentAmount(text);
                  if (amountError) setAmountError(undefined);
                }}
                placeholder="0.00"
                keyboardType="decimal-pad"
              />
              {amountError && <Text style={styles.errorText}>{amountError}</Text>}
            </View>

            {/* Frequency */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Frequency</Text>
              <TouchableOpacity
                style={[styles.dropdownButton, { borderColor: theme.primaryColor }]}
                onPress={() => setShowFrequencyModal(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownButtonText}>
                  {getFrequencyLabel(newPaymentFrequency)}
                </Text>
                <Text style={[styles.dropdownArrow, { color: theme.primaryColor }]}>▼</Text>
              </TouchableOpacity>
            </View>

            {/* Category */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={[
                  styles.input,
                  categoryError ? styles.inputError : null,
                  { borderColor: categoryError ? '#e74c3c' : theme.primaryColor },
                ]}
                value={newPaymentCategory}
                onChangeText={(text) => {
                  setNewPaymentCategory(text);
                  if (categoryError) setCategoryError(undefined);
                }}
                placeholder="e.g., Housing, Utilities, Entertainment"
                maxLength={30}
              />
              {categoryError && <Text style={styles.errorText}>{categoryError}</Text>}
            </View>

            {/* Daily Impact Preview */}
            {newPaymentAmount && !isNaN(parseFloat(newPaymentAmount)) && (
              <View style={styles.previewCard}>
                <Text style={styles.previewLabel}>Daily Budget Impact</Text>
                <Text style={styles.previewValue}>
                  {theme.currency}
                  {getDailyImpact(parseFloat(newPaymentAmount), newPaymentFrequency).toFixed(2)}
                  /day
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalAddButton,
                  { backgroundColor: theme.primaryColor },
                ]}
                onPress={handleAddPayment}
              >
                <Text style={styles.modalAddButtonText}>Add Payment</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Frequency Selection Modal */}
      <Modal
        visible={showFrequencyModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowFrequencyModal(false)}
      >
        <TouchableOpacity
          style={styles.frequencyModalOverlay}
          activeOpacity={1}
          onPress={() => setShowFrequencyModal(false)}
        >
          <View style={styles.frequencyModalContent}>
            <Text style={styles.frequencyModalTitle}>Select Frequency</Text>
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.frequencyOption,
                  newPaymentFrequency === option.value && styles.frequencyOptionSelected,
                ]}
                onPress={() => {
                  setNewPaymentFrequency(option.value);
                  setShowFrequencyModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.frequencyOptionText,
                    newPaymentFrequency === option.value && styles.frequencyOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {newPaymentFrequency === option.value && (
                  <Text style={[styles.checkmark, { color: theme.primaryColor }]}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
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
  headerCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  impactCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  impactLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  impactValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  impactSubtext: {
    fontSize: 12,
    color: '#999',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    color: '#ddd',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  paymentsList: {
    gap: 16,
  },
  paymentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  paymentCategory: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: '#FF4444',
    fontWeight: 'bold',
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paymentDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  paymentDetailLabel: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  paymentDetailValue: {
    fontSize: 14,
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
  inputContainer: {
    marginBottom: 20,
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
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
  dropdownArrow: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  previewCard: {
    backgroundColor: '#FFF9E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  previewLabel: {
    fontSize: 12,
    color: '#F57C00',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  previewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F57C00',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
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
  frequencyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  frequencyModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  frequencyModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  frequencyOption: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  frequencyOptionSelected: {
    backgroundColor: '#E8F5E9',
  },
  frequencyOptionText: {
    fontSize: 16,
    color: '#333',
  },
  frequencyOptionTextSelected: {
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});