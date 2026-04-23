/**
 * Data Management Screen
 * 
 * Screen for deleting data by month or custom date range.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useData, useTheme } from '../contexts';
import { dataManager } from '../managers';

type DataManagementScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DataManagement'>;

interface DataManagementScreenProps {
  navigation: DataManagementScreenNavigationProp;
}

type DeletionMode = 'month' | 'dateRange';

/**
 * Data Management Screen Component
 * 
 * Allows users to delete data by month or custom date range with confirmation.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */
export const DataManagementScreen: React.FC<DataManagementScreenProps> = ({ navigation }) => {
  const { refreshData } = useData();
  const { theme } = useTheme();

  // Deletion mode
  const [mode, setMode] = useState<DeletionMode>('month');

  // Month selection
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-based

  // Date range selection
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Loading state
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Generate year options (current year and 5 years back)
   */
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  /**
   * Month names
   */
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
  ];

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

  /**
   * Handle start date change
   * Requirements: 6.7
   */
  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  /**
   * Handle end date change
   * Requirements: 6.7
   */
  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  /**
   * Handle deletion with confirmation
   * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
   */
  const handleDelete = async () => {
    try {
      // Get entry count for confirmation (Requirement 6.5)
      let entryCount;
      let dateRangeText;

      if (mode === 'month') {
        // Calculate date range for the month
        const monthStart = new Date(selectedYear, selectedMonth - 1, 1);
        const monthEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
        
        entryCount = await dataManager.getEntriesInRange(monthStart, monthEnd);
        dateRangeText = `${months[selectedMonth - 1].label} ${selectedYear}`;
      } else {
        entryCount = await dataManager.getEntriesInRange(startDate, endDate);
        dateRangeText = `${formatDate(startDate)} - ${formatDate(endDate)}`;
      }

      const totalEntries = entryCount.earnings + entryCount.expenses;

      // Show confirmation dialog (Requirement 6.5)
      Alert.alert(
        'Confirm Deletion',
        `Are you sure you want to delete all data from ${dateRangeText}?\n\n` +
        `This will delete:\n` +
        `• ${entryCount.earnings} earning(s)\n` +
        `• ${entryCount.expenses} expense(s)\n\n` +
        `Total: ${totalEntries} entries\n\n` +
        `This action cannot be undone.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await performDeletion();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Failed to get entry count:', error);
      Alert.alert('Error', 'Failed to retrieve entry information');
    }
  };

  /**
   * Perform the actual deletion
   * Requirements: 6.1, 6.2, 6.3, 6.4
   */
  const performDeletion = async () => {
    try {
      setIsDeleting(true);

      let result;
      if (mode === 'month') {
        // Delete by month (Requirement 6.1, 6.6)
        result = await dataManager.deleteByMonth(selectedYear, selectedMonth);
      } else {
        // Delete by date range (Requirement 6.2, 6.7)
        result = await dataManager.deleteByDateRange(startDate, endDate);
      }

      // Refresh data context (Requirement 6.4)
      await refreshData();

      // Show success message
      Alert.alert(
        'Deletion Complete',
        `Successfully deleted:\n` +
        `• ${result.deletedEarnings} earning(s)\n` +
        `• ${result.deletedExpenses} expense(s)\n\n` +
        `New available funds: $${result.newAvailableFunds.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to delete data:', error);
      Alert.alert('Error', 'Failed to delete data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Instructions */}
        <Text style={styles.instructions}>
          Delete earnings and expenses from a specific time period. This action cannot be undone.
        </Text>

        {/* Mode Selection */}
        <View style={styles.modeSection}>
          <Text style={styles.sectionTitle}>Deletion Mode</Text>
          <View style={styles.modeButtons}>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'month' && { backgroundColor: theme.primaryColor },
              ]}
              onPress={() => setMode('month')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'month' && styles.modeButtonTextActive,
                ]}
              >
                By Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modeButton,
                mode === 'dateRange' && { backgroundColor: theme.primaryColor },
              ]}
              onPress={() => setMode('dateRange')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  mode === 'dateRange' && styles.modeButtonTextActive,
                ]}
              >
                By Date Range
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Month Selection */}
        {mode === 'month' && (
          <View style={styles.selectionSection}>
            <Text style={styles.sectionTitle}>Select Month</Text>
            
            <View style={styles.pickerRow}>
              <View style={[styles.pickerContainer, { borderColor: theme.primaryColor }]}>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={setSelectedMonth}
                  style={styles.picker}
                >
                  {months.map((month) => (
                    <Picker.Item key={month.value} label={month.label} value={month.value} />
                  ))}
                </Picker>
              </View>
              
              <View style={[styles.pickerContainer, { borderColor: theme.primaryColor }]}>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={setSelectedYear}
                  style={styles.picker}
                >
                  {years.map((year) => (
                    <Picker.Item key={year} label={year.toString()} value={year} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
        )}

        {/* Date Range Selection */}
        {mode === 'dateRange' && (
          <View style={styles.selectionSection}>
            <Text style={styles.sectionTitle}>Select Date Range</Text>
            
            <View style={styles.dateInputContainer}>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity
                style={[styles.dateButton, { borderColor: theme.primaryColor }]}
                onPress={() => setShowStartPicker(true)}
              >
                <Text style={styles.dateButtonText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
            </View>

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
        )}

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

        {/* Delete Button */}
        <TouchableOpacity
          style={[
            styles.deleteButton,
            isDeleting && styles.deleteButtonDisabled,
          ]}
          onPress={handleDelete}
          disabled={isDeleting}
          activeOpacity={0.7}
        >
          <Text style={styles.deleteButtonText}>
            {isDeleting ? 'Deleting...' : 'Delete Data'}
          </Text>
        </TouchableOpacity>

        {/* Warning */}
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ Warning: Deleted data cannot be recovered. You will be asked to confirm before deletion.
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
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 22,
  },
  modeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  selectionSection: {
    marginBottom: 24,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
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
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 16,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    lineHeight: 20,
  },
});
