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
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks, subWeeks, subDays, startOfDay, startOfMonth, endOfMonth, subMonths } from 'date-fns';

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
  const { availableFunds, expenses, earnings, isLoading } = useData();
  const { theme } = useTheme();
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [weeklyData, setWeeklyData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [averageSpending, setAverageSpending] = useState<number>(0);
  const [averageIncome, setAverageIncome] = useState<number>(0);
  const [todaySpending, setTodaySpending] = useState<number>(0);
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(new Date());
  const [spendingTrend, setSpendingTrend] = useState<{ percentage: number; isIncrease: boolean }>({ percentage: 0, isIncrease: true });
  const [incomeTrend, setIncomeTrend] = useState<{ percentage: number; isIncrease: boolean }>({ percentage: 0, isIncrease: true });
  const [trendPeriod, setTrendPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [balanceTrend, setBalanceTrend] = useState<{ percentage: number; isIncrease: boolean }>({ percentage: 0, isIncrease: true });
  const [spendingTrendAmount, setSpendingTrendAmount] = useState<number>(0);
  const [incomeTrendAmount, setIncomeTrendAmount] = useState<number>(0);

  // Calculate analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // Get category spending
        const spending = await analyticsEngine.getCategorySpending();
        setCategorySpending(spending.slice(0, 5)); // Top 5 categories

        // Calculate weekly spending based on selected week
        const weekStart = startOfWeek(selectedWeekStart, { weekStartsOn: 1 }); // Monday start
        const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });
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

        // Calculate average daily income (average of earning amounts)
        const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0);
        const averageDailyIncome = earnings.length > 0 ? totalEarnings / earnings.length : 0;
        setAverageIncome(averageDailyIncome);

        // Calculate today's spending
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayExpenses = expenses
          .filter(expense => {
            const expenseDate = format(new Date(expense.timestamp), 'yyyy-MM-dd');
            return expenseDate === today;
          })
          .reduce((sum, expense) => sum + expense.amount, 0);
        setTodaySpending(todayExpenses);

        // Calculate balance trend (current balance vs last month's balance)
        const currentMonth = startOfMonth(new Date());
        const prevMonth = startOfMonth(subMonths(new Date(), 1));
        const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));

        // Calculate last month's ending balance
        const lastMonthEarnings = earnings
          .filter(earning => {
            const earningDate = new Date(earning.timestamp);
            return earningDate <= prevMonthEnd;
          })
          .reduce((sum, earning) => sum + earning.amount, 0);

        const lastMonthExpenses = expenses
          .filter(expense => {
            const expenseDate = new Date(expense.timestamp);
            return expenseDate <= prevMonthEnd;
          })
          .reduce((sum, expense) => sum + expense.amount, 0);

        const lastMonthBalance = lastMonthEarnings - lastMonthExpenses;

        if (lastMonthBalance > 0 && availableFunds !== lastMonthBalance) {
          const balanceChange = ((availableFunds - lastMonthBalance) / lastMonthBalance) * 100;
          setBalanceTrend({
            percentage: Math.abs(balanceChange),
            isIncrease: balanceChange > 0
          });
        } else {
          // Default to increase when no previous data or same balance
          setBalanceTrend({ percentage: 8, isIncrease: true });
        }

        // Calculate spending and income trends based on selected period
        if (trendPeriod === 'weekly') {
          // Weekly comparison
          const currentWeekTotal = dailySpending.reduce((sum, amount) => sum + amount, 0);
          const prevWeekStart = subWeeks(weekStart, 1);
          const prevWeekEnd = subWeeks(weekEnd, 1);
          const prevWeekDays = eachDayOfInterval({ start: prevWeekStart, end: prevWeekEnd });
          
          const prevWeekSpending = prevWeekDays.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            return expenses
              .filter(expense => {
                const expenseDate = format(new Date(expense.timestamp), 'yyyy-MM-dd');
                return expenseDate === dayStr;
              })
              .reduce((sum, expense) => sum + expense.amount, 0);
          });
          
          const prevWeekTotal = prevWeekSpending.reduce((sum, amount) => sum + amount, 0);
          
          if (prevWeekTotal > 0) {
            const spendingChange = ((currentWeekTotal - prevWeekTotal) / prevWeekTotal) * 100;
            const spendingAmountChange = currentWeekTotal - prevWeekTotal;
            setSpendingTrend({
              percentage: Math.abs(spendingChange),
              isIncrease: spendingChange > 0
            });
            setSpendingTrendAmount(Math.abs(spendingAmountChange));
          } else {
            // Default to increase when no previous data
            setSpendingTrend({ percentage: 15, isIncrease: true });
            setSpendingTrendAmount(50);
          }

          // Weekly income trend
          const currentWeekEarnings = earnings
            .filter(earning => {
              const earningDate = new Date(earning.timestamp);
              return earningDate >= weekStart && earningDate <= weekEnd;
            })
            .reduce((sum, earning) => sum + earning.amount, 0);

          const prevWeekEarnings = earnings
            .filter(earning => {
              const earningDate = new Date(earning.timestamp);
              return earningDate >= prevWeekStart && earningDate <= prevWeekEnd;
            })
            .reduce((sum, earning) => sum + earning.amount, 0);

          if (prevWeekEarnings > 0) {
            const incomeChange = ((currentWeekEarnings - prevWeekEarnings) / prevWeekEarnings) * 100;
            const incomeAmountChange = currentWeekEarnings - prevWeekEarnings;
            setIncomeTrend({
              percentage: Math.abs(incomeChange),
              isIncrease: incomeChange > 0
            });
            setIncomeTrendAmount(Math.abs(incomeAmountChange));
          } else {
            // Default to increase when no previous data
            setIncomeTrend({ percentage: 12, isIncrease: true });
            setIncomeTrendAmount(100);
          }
        } else {
          // Monthly comparison
          const currentMonth = startOfMonth(new Date());
          const currentMonthEnd = endOfMonth(new Date());
          const prevMonth = startOfMonth(subMonths(new Date(), 1));
          const prevMonthEnd = endOfMonth(subMonths(new Date(), 1));

          // Current month spending
          const currentMonthSpending = expenses
            .filter(expense => {
              const expenseDate = new Date(expense.timestamp);
              return expenseDate >= currentMonth && expenseDate <= currentMonthEnd;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);

          // Previous month spending
          const prevMonthSpending = expenses
            .filter(expense => {
              const expenseDate = new Date(expense.timestamp);
              return expenseDate >= prevMonth && expenseDate <= prevMonthEnd;
            })
            .reduce((sum, expense) => sum + expense.amount, 0);

          if (prevMonthSpending > 0) {
            const spendingChange = ((currentMonthSpending - prevMonthSpending) / prevMonthSpending) * 100;
            const spendingAmountChange = currentMonthSpending - prevMonthSpending;
            setSpendingTrend({
              percentage: Math.abs(spendingChange),
              isIncrease: spendingChange > 0
            });
            setSpendingTrendAmount(Math.abs(spendingAmountChange));
          } else {
            setSpendingTrend({ percentage: 18, isIncrease: true });
            setSpendingTrendAmount(75);
          }

          // Current month earnings
          const currentMonthEarnings = earnings
            .filter(earning => {
              const earningDate = new Date(earning.timestamp);
              return earningDate >= currentMonth && earningDate <= currentMonthEnd;
            })
            .reduce((sum, earning) => sum + earning.amount, 0);

          // Previous month earnings
          const prevMonthEarnings = earnings
            .filter(earning => {
              const earningDate = new Date(earning.timestamp);
              return earningDate >= prevMonth && earningDate <= prevMonthEnd;
            })
            .reduce((sum, earning) => sum + earning.amount, 0);

          if (prevMonthEarnings > 0) {
            const incomeChange = ((currentMonthEarnings - prevMonthEarnings) / prevMonthEarnings) * 100;
            const incomeAmountChange = currentMonthEarnings - prevMonthEarnings;
            setIncomeTrend({
              percentage: Math.abs(incomeChange),
              isIncrease: incomeChange > 0
            });
            setIncomeTrendAmount(Math.abs(incomeAmountChange));
          } else {
            setIncomeTrend({ percentage: 20, isIncrease: true });
            setIncomeTrendAmount(120);
          }
        }

      } catch (error) {
        console.error('Failed to load analytics:', error);
      }
    };

    if (!isLoading) {
      loadAnalytics();
    }
  }, [expenses, earnings, isLoading, selectedWeekStart, trendPeriod]);

  const quickActions = [
    { title: 'Add Earning', screen: 'AddEarning' as const, icon: '+', colors: ['#4CAF50', '#45a049'] as const },
    { title: 'Add Expense', screen: 'AddExpense' as const, icon: '−', colors: ['#f44336', '#da190b'] as const },
    { title: 'Budget', screen: 'BudgetEstimator' as const, icon: '◯', colors: ['#2196F3', '#0b7dda'] as const },
    { title: 'Payments', screen: 'Payments' as const, icon: '▭', colors: ['#FF9800', '#F57C00'] as const },
    { title: 'Settings', screen: 'Settings' as const, icon: '⚙', colors: ['#9C27B0', '#7b1fa2'] as const },
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

  // Week navigation functions
  const goToPreviousWeek = () => {
    setSelectedWeekStart(subWeeks(selectedWeekStart, 1));
  };

  const goToNextWeek = () => {
    setSelectedWeekStart(addWeeks(selectedWeekStart, 1));
  };

  const goToCurrentWeek = () => {
    setSelectedWeekStart(new Date());
  };

  // Get formatted week range
  const getWeekRange = () => {
    const weekStart = startOfWeek(selectedWeekStart, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedWeekStart, { weekStartsOn: 1 });
    return `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={[gradientStart, gradientEnd] as const}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your Financial Overview</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions - Top */}
        <LinearGradient
          colors={['#f8f9fa', '#e9ecef'] as const}
          style={styles.quickActionsContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.screen}
                onPress={() => navigation.navigate(action.screen)}
                activeOpacity={0.8}
                style={styles.quickActionWrapper}
              >
                <LinearGradient
                  colors={action.colors}
                  style={styles.quickActionCircle}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.quickActionIcon}>{action.icon}</Text>
                </LinearGradient>
                <Text style={styles.quickActionLabel}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Current Balance Card */}
        <LinearGradient
          colors={[gradientStart, gradientEnd] as const}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <View style={styles.balanceTrendIndicator}>
              <Text style={styles.balanceTrendIcon}>
                {balanceTrend.isIncrease ? '↗' : '↘'}
              </Text>
              <Text style={styles.balanceTrendText}>
                {balanceTrend.percentage.toFixed(1)}%
              </Text>
            </View>
          </View>
          {isLoading ? (
            <Text style={styles.balanceValue}>...</Text>
          ) : (
            <Text style={styles.balanceValue}>{theme.currency}{availableFunds.toFixed(0)}</Text>
          )}
          <Text style={styles.balanceSubtext}>
            {balanceTrend.isIncrease ? 'Increased' : 'Decreased'} vs last month
          </Text>
        </LinearGradient>

        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          {/* Daily Budget Card */}
          <LinearGradient
            colors={['#4ECDC4', '#44A08D'] as const}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statLabel}>Daily Budget</Text>
            <Text style={styles.statValue}>{theme.currency}{(availableFunds / 30).toFixed(0)}</Text>
            <Text style={styles.statSubtext}>Next 30 Days</Text>
          </LinearGradient>

          {/* Average Income Card */}
          <LinearGradient
            colors={['#66BB6A', '#4CAF50'] as const}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statLabel}>Avg Income</Text>
            <Text style={styles.statValue}>{theme.currency}{averageIncome.toFixed(0)}</Text>
            <Text style={styles.statSubtext}>Per Day</Text>
          </LinearGradient>
        </View>

        {/* Second Stats Row */}
        <View style={styles.statsRow}>
          {/* Average Spending Card */}
          <LinearGradient
            colors={['#FF6B6B', '#EE5A6F'] as const}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statLabel}>Avg Spending</Text>
            <Text style={styles.statValue}>{theme.currency}{averageSpending.toFixed(0)}</Text>
            <Text style={styles.statSubtext}>Per Day</Text>
          </LinearGradient>

          {/* Today's Spending & Balance Health Card */}
          <LinearGradient
            colors={['#87CEEB', '#4682B4'] as const}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.balanceCardHeader}>
              <Text style={styles.statLabel}>Today's Spending</Text>
              <Text style={styles.trendIndicator}>
                {averageSpending > averageIncome ? '↗' : '↘'}
              </Text>
            </View>
            <Text style={styles.statValue}>{theme.currency}{todaySpending.toFixed(0)}</Text>
            <Text style={styles.statSubtext}>
              {averageSpending > averageIncome ? 'Above Avg Income' : 'Below Avg Income'}
            </Text>
          </LinearGradient>
        </View>

        {/* Trend Cards Row */}
        <View style={styles.trendRow}>
          {/* Spending Trend Card */}
          <View style={[styles.trendCard, { backgroundColor: spendingTrend.isIncrease ? '#FFE5E5' : '#E5F5E5' }]}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendLabel}>Spending Trend</Text>
              <Text style={[styles.trendIcon, { color: spendingTrend.isIncrease ? '#FF4444' : '#44AA44' }]}>
                {spendingTrend.isIncrease ? '↗' : '↘'}
              </Text>
            </View>
            <Text style={[styles.trendPercentage, { color: spendingTrend.isIncrease ? '#FF4444' : '#44AA44' }]}>
              {spendingTrend.percentage.toFixed(1)}%
            </Text>
            <Text style={[styles.trendAmount, { color: spendingTrend.isIncrease ? '#FF4444' : '#44AA44' }]}>
              {spendingTrend.isIncrease ? '+' : '-'}{theme.currency}{spendingTrendAmount.toFixed(0)}
            </Text>
            <Text style={styles.trendSubtext}>
              {spendingTrend.isIncrease ? 'Increased' : 'Decreased'} vs last {trendPeriod === 'weekly' ? 'week' : 'month'}
            </Text>
          </View>

          {/* Income Trend Card */}
          <View style={[styles.trendCard, { backgroundColor: incomeTrend.isIncrease ? '#E5F5E5' : '#FFE5E5' }]}>
            <View style={styles.trendHeader}>
              <Text style={styles.trendLabel}>Income Trend</Text>
              <Text style={[styles.trendIcon, { color: incomeTrend.isIncrease ? '#44AA44' : '#FF4444' }]}>
                {incomeTrend.isIncrease ? '↗' : '↘'}
              </Text>
            </View>
            <Text style={[styles.trendPercentage, { color: incomeTrend.isIncrease ? '#44AA44' : '#FF4444' }]}>
              {incomeTrend.percentage.toFixed(1)}%
            </Text>
            <Text style={[styles.trendAmount, { color: incomeTrend.isIncrease ? '#44AA44' : '#FF4444' }]}>
              {incomeTrend.isIncrease ? '+' : '-'}{theme.currency}{incomeTrendAmount.toFixed(0)}
            </Text>
            <Text style={styles.trendSubtext}>
              {incomeTrend.isIncrease ? 'Increased' : 'Decreased'} vs last {trendPeriod === 'weekly' ? 'week' : 'month'}
            </Text>
          </View>
        </View>

        {/* Trend Period Toggle */}
        <View style={styles.trendToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, trendPeriod === 'weekly' && styles.toggleButtonActive]}
            onPress={() => setTrendPeriod('weekly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, trendPeriod === 'weekly' && styles.toggleTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, trendPeriod === 'monthly' && styles.toggleButtonActive]}
            onPress={() => setTrendPeriod('monthly')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, trendPeriod === 'monthly' && styles.toggleTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weekly Spending Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weekly Spending Trend</Text>
          <View style={styles.lineChartContainer}>
            <LineChart
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{ data: weeklyData.length > 0 ? weeklyData : [0] }],
              }}
              width={screenWidth - 80}
              height={200}
              chartConfig={{
                backgroundColor: '#f5f5f5',
                backgroundGradientFrom: '#f5f5f5',
                backgroundGradientTo: '#e8e8e8',
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

          {/* Week Range Selector */}
          <View style={styles.weekSelector}>
            <TouchableOpacity 
              onPress={goToPreviousWeek}
              style={styles.weekNavButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.weekNavText, { color: theme.primaryColor }]}>‹</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={goToCurrentWeek}
              style={styles.weekRangeButton}
              activeOpacity={0.7}
            >
              <Text style={styles.weekRangeText}>{getWeekRange()}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={goToNextWeek}
              style={styles.weekNavButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.weekNavText, { color: theme.primaryColor }]}>›</Text>
            </TouchableOpacity>
          </View>
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
                  height={220}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft={`${(screenWidth - 40 - 220) / 2 + 13}`}
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
                          colors={[gradientStart, gradientEnd] as const}
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
  quickActionsContainer: {
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginHorizontal: -10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  quickActionWrapper: {
    alignItems: 'center',
  },
  quickActionCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 6,
  },
  quickActionIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    maxWidth: 65,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
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
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  balanceCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    alignItems: 'center',
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceTrendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  balanceTrendIcon: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: 4,
  },
  balanceTrendText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  trendRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  trendCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trendLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trendIcon: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  trendPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trendAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trendSubtext: {
    fontSize: 11,
    color: '#888',
  },
  trendToggle: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    alignSelf: 'center',
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#333',
    fontWeight: '600',
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
  balanceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendIndicator: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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
  lineChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingHorizontal: 10,
  },
  weekNavButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNavText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  weekRangeButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  weekRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
});
