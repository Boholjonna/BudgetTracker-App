/**
 * Analytics Screen
 * 
 * Screen for viewing spending analytics by category.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts';
import { analyticsEngine } from '../managers';
import { CategorySpending } from '../models';
import { ErrorHandler } from '../utils/ErrorHandler';

type AnalyticsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analytics'>;

interface AnalyticsScreenProps {
  navigation: AnalyticsScreenNavigationProp;
}

/**
 * Analytics Screen Component
 * 
 * Displays spending analytics with categories ranked by spending amount.
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
 */
export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ navigation }) => {
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const { theme } = useTheme();

  /**
   * Load analytics data on mount
   * Requirements: 5.1, 5.2, 5.5
   */
  useEffect(() => {
    loadAnalytics();
  }, []);

  /**
   * Load spending analytics from analytics engine
   * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5
   */
  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      
      const [spending, total] = await Promise.all([
        analyticsEngine.getCategorySpending(),
        analyticsEngine.getTotalSpending(),
      ]);
      
      setCategorySpending(spending);
      setTotalSpending(total);
    } catch (error) {
      ErrorHandler.handle(error, 'loading analytics');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Render a single category spending item
   * Requirements: 5.2, 5.3, 5.4
   */
  const renderSpendingItem = ({ item }: { item: CategorySpending }) => {
    return (
      <View style={styles.spendingItem}>
        <View style={styles.spendingHeader}>
          <View style={styles.rankContainer}>
            <Text style={[styles.rank, { color: theme.primaryColor }]}>#{item.rank}</Text>
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.category.name}</Text>
            {item.category.isDefault && (
              <Text style={styles.defaultBadge}>Default</Text>
            )}
          </View>
        </View>
        
        <View style={styles.spendingDetails}>
          <Text style={styles.amount}>{theme.currency}{item.totalAmount.toFixed(2)}</Text>
          <Text style={styles.percentage}>{item.percentage.toFixed(1)}%</Text>
        </View>
        
        {/* Visual bar representation */}
        <View style={styles.barContainer}>
          <View
            style={[
              styles.bar,
              { width: `${item.percentage}%` as any, backgroundColor: theme.primaryColor },
            ]}
          />
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.primaryColor} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Total Spending Summary */}
      <View style={[styles.summaryCard, { borderColor: theme.primaryColor }]}>
        <Text style={styles.summaryLabel}>Total Spending</Text>
        <Text style={[styles.summaryAmount, { color: theme.primaryColor }]}>
          {theme.currency}{totalSpending.toFixed(2)}
        </Text>
      </View>

      {/* Category Spending List */}
      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Spending by Category</Text>
        <FlatList
          data={categorySpending}
          renderItem={renderSpendingItem}
          keyExtractor={(item) => item.category.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No expenses recorded yet</Text>
              <Text style={styles.emptySubtext}>
                Add expenses to see your spending analytics
              </Text>
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  spendingItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  spendingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rank: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  defaultBadge: {
    marginLeft: 8,
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  spendingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  percentage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  barContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
});
