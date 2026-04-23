/**
 * Category Manager Screen
 * 
 * Screen for viewing and creating expense categories.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useData, useTheme } from '../contexts';
import { validateNonEmptyString } from '../services';
import { Category } from '../models';
import { useToast } from '../utils/Toast';
import { ErrorHandler } from '../utils/ErrorHandler';

type CategoryManagerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CategoryManager'>;

interface CategoryManagerScreenProps {
  navigation: CategoryManagerScreenNavigationProp;
}

/**
 * Category Manager Screen Component
 * 
 * Allows users to view all categories (default + custom) and create new custom categories.
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5
 */
export const CategoryManagerScreen: React.FC<CategoryManagerScreenProps> = ({ navigation }) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { categories, addCategory } = useData();
  const { theme } = useTheme();
  const toast = useToast();

  /**
   * Handle category name input change
   * Requirements: 4.1
   */
  const handleNameChange = (text: string) => {
    setCategoryName(text);
    
    // Clear error when user starts typing
    if (error) {
      setError(undefined);
    }
  };

  /**
   * Validate and create new category
   * Requirements: 4.1, 4.2, 4.5
   */
  const handleAddCategory = async () => {
    // Validate category name (Requirement 4.1)
    const validation = validateNonEmptyString(categoryName);
    
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Create category (Requirement 4.2)
      await addCategory(categoryName);
      
      // Show success toast
      toast.showSuccess(`Category "${categoryName}" created successfully!`);
      
      // Clear form
      setCategoryName('');
      setError(undefined);
    } catch (err) {
      // Handle storage or other errors
      ErrorHandler.handle(err, 'creating category');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render a single category item
   * Requirements: 4.3, 4.4
   */
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <View style={styles.categoryItem}>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{item.name}</Text>
        {item.isDefault && (
          <View style={[styles.badge, { backgroundColor: theme.primaryColor }]}>
            <Text style={styles.badgeText}>Default</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Add Category Section */}
        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add New Category</Text>
          <Text style={styles.instructions}>
            Create custom categories to organize your expenses.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                error ? styles.inputError : null,
                { borderColor: error ? '#e74c3c' : theme.primaryColor },
              ]}
              value={categoryName}
              onChangeText={handleNameChange}
              placeholder="Enter category name"
              editable={!isSubmitting}
              autoCapitalize="words"
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <TouchableOpacity
            style={[
              styles.addButton,
              { backgroundColor: theme.primaryColor },
              isSubmitting && styles.addButtonDisabled,
            ]}
            onPress={handleAddCategory}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text style={styles.addButtonText}>
              {isSubmitting ? 'Adding...' : 'Add Category'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categories List */}
        <View style={styles.listSection}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No categories available</Text>
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 8,
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
  addButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listSection: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
  },
  categoryItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginTop: 24,
  },
});
