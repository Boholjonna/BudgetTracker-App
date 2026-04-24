/**
 * Home Screen - Analytics Dashboard
 * 
 * Main screen displaying analytics dashboard with available funds, spending insights,
 * category breakdown, and weekly spending trends.
 * Requirements: 1.3, 2.4, 5.1, 5.2, 5.3, 5.4
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useData, useTheme } from '../contexts';
import { analyticsEngine } from '../managers/analytics.manager';
import { CategorySpending } from '../models';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { startOfWeek, endOfWeek, eachDayOfInterval, format } from 'date-fns';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const screenWidth = Dimensions.get('window').width;

/**
 * Home Screen Component - Analytics Dashboard
 * 
 * Displays comprehensive analytics dashboard with:
 * - Available funds
 * - Average daily spending
 * - Top spending categories
 * - Weekly spending trend
 * Requirements: 1.3, 2.4, 5.1, 5.2, 5.3, 5.4
 */
export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { availableFunds, expenses, isLoading } = useData();
  const { theme } = useTheme();
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [averageSpending, setAverageSpending] = useState<number>(0);

  // Calculate analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Get category spending
        const spending = await analyticsEngine.getCategorySpending();
        setCategorySpending(spending.slice(0, 5)); // Top 5 categories

        // Calculate weekly spending
        const now = new Date();
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

        const dailySpending = daysInWeek.map(day => {
          const dayStr = format(day, 'yyyy-MM-dd');
          return expenses
            .filter(expense => {
              // Convert Unix timestamp to Date object
              const expenseDate = format(new Date(expense.timestamp), 'yyyy-MM-dd');
              return expenseDate === dayStr;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);
        });

        setWeeklyData(dailySpending);

        // Calculate average daily spending
        const totalSpending = await analyticsEngine.getTotalSpending();
        const daysWithExpenses = expenses.length > 0 ? 7 : 1; // Avoid division by zero
        setAverageSpending(totalSpending / daysWithExpenses);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };

    if (!isLoading) {
      loadAnalytics();
    }
  }, [expenses, isLoading]);

  const quickActions = [
    { title: 'Add Earning', screen: 'AddEarning' as const, icon: '💰', colors: ['#4CAF50', '#45a049'] },
    { title: 'Add Expense', screen: 'AddExpense' as const, icon: '💸', colors: ['#f44336', '#da190b'] },
    { title: 'Budget', screen: 'BudgetEstimator' as const, icon: '📊', colors: ['#2196F3', '#0b7dda'] },
    { title: 'Settings', screen: 'Settings' as const, icon: '⚙️', colors: ['#9C27B0', '#7b1fa2'] },
  ];

  const getGradientColors = (baseColor: string): [string, string] => {
    // Create gradient from theme color
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
      {/* Header with Gradient */}
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your Financial Overview</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          {/* Available Funds Card */}
          <LinearGradient
            colors={[gradientStart, gradientEnd]}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statLabel}>Available</Text>
            {isLoading ? (
              <Text style={styles.statValue}>...</Text>
            ) : (
              <Text style={styles.statValue}>{theme.currency}{availableFunds.toFixed(0)}</Text>
            )}
            <Text style={styles.statSubtext}>Current Balance</Text>
          </LinearGradient>

          {/* Average Spending Card */}
          <LinearGradient
            colors={['#FF6B6B', '#EE5A6F']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statLabel}>Avg/Day</Text>
            <Text style={styles.statValue}>{theme.currency}{averageSpending.toFixed(0)}</Text>
            <Text style={styles.statSubtext}>Daily Spending</Text>
          </LinearGradient>
        </View>

        {/* Weekly Spending Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Spending Trend</Text>
          <LineChart
            data={{
              labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
              datasets: [{ data: weeklyData.length > 0 ? weeklyData : [0] }],
            }}
            width={screenWidth - 60}
            height={200}
            withLegend={false}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#f8f9fa',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(${parseInt(gradientStart.slice(1, 3), 16)}, ${parseInt(gradientStart.slice(3, 5), 16)}, ${parseInt(gradientStart.slice(5, 7), 16)}, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: gradientStart,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Top Categories with Pie Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Top Spending Categories</Text>
          {categorySpending.length > 0 ? (
            <>
              {/* Pie Chart */}
              <View style={styles.pieChartContainer}>
                <PieChart
                  data={categorySpending.map((item, index) => ({
                    name: '',
                    population: item.totalAmount,
                    color: [
                      gradientStart,
                      '#FF6B6B',
                      '#4ECDC4',
                      '#FFD93D',
                      '#A8E6CF',
                    ][index % 5],
                    legendFontColor: 'transparent',
                    legendFontSize: 0,
                  }))}
                  width={screenWidth - 40}
                  height={240}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="0"
                  absolute
                  hasLegend={false}
                />
              </View>
              
              {/* Category List */}
              <View style={styles.categoriesList}>
                {categorySpending.map((item, index) => (
                  <View key={item.category.id} style={styles.categoryItem}>
                    <View style={[styles.categoryRank, {
                      backgroundColor: [
                        gradientStart,
                        '#FF6B6B',
                        '#4ECDC4',
                        '#FFD93D',
                        '#A8E6CF',
                      ][index % 5]
                    }]}>
                      <Text style={styles.rankTextWhite}>#{index + 1}</Text>
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{item.category.name}</Text>
                      <View style={styles.progressBar}>
                        <LinearGradient
                          colors={[gradientStart, gradientEnd]}
                          style={[styles.progressFill, { width: `${item.percentage}%` }]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                        />
                      </View>
                    </View>
                    <View style={styles.categoryAmount}>
                      <Text style={styles.amountText}>{theme.currency}{item.totalAmount.toFixed(0)}</Text>
                      <Text style={styles.percentText}>{item.percentage.toFixed(1)}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={styles.noDataText}>No expenses yet. Start tracking!</Text>
          )}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.screen}
              onPress={() => navigation.navigate(action.screen)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={action.colors}
                style={styles.quickActionButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionText}>{action.title}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* More Options */}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => navigation.navigate('Analytics')}
          activeOpacity={0.7}
        >
          <Text style={[styles.moreButtonText, { color: theme.primaryColor }]}>
            View Detailed Analytics →
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 30,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    padding: 20,
    marginTop: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.8,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  categoriesList: {
    gap: 16,
    marginTop: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryRank: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  rankTextWhite: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  percentText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noDataText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  quickActionButton: {
    width: (screenWidth - 52) / 2,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  moreButton: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  moreButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
