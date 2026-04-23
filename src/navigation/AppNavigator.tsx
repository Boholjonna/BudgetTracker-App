/**
 * App Navigator
 * 
 * Defines the main navigation structure for the Budget Tracker App.
 * Uses React Navigation stack navigator with all screens.
 * Requirements: 9.3, 9.4
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts';
import {
  HomeScreen,
  AddEarningScreen,
  AddExpenseScreen,
  BudgetEstimatorScreen,
  CategoryManagerScreen,
  AnalyticsScreen,
  DataManagementScreen,
  SettingsScreen,
} from '../screens';

/**
 * Navigation Stack Parameter List
 * Defines the screens and their parameters
 */
export type RootStackParamList = {
  Home: undefined;
  AddEarning: undefined;
  AddExpense: undefined;
  BudgetEstimator: undefined;
  Analytics: undefined;
  CategoryManager: undefined;
  DataManagement: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

/**
 * App Navigator Component
 * 
 * Provides the navigation container and stack navigator for the app.
 * Applies theme colors to navigation components.
 * Requirements: 9.3, 9.4
 */
export const AppNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.primaryColor,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AddEarning"
          component={AddEarningScreen}
          options={{
            title: 'Add Earning',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="AddExpense"
          component={AddExpenseScreen}
          options={{
            title: 'Add Expense',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="BudgetEstimator"
          component={BudgetEstimatorScreen}
          options={{
            title: 'Budget Estimator',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Analytics"
          component={AnalyticsScreen}
          options={{
            title: 'Analytics',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="CategoryManager"
          component={CategoryManagerScreen}
          options={{
            title: 'Manage Categories',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="DataManagement"
          component={DataManagementScreen}
          options={{
            title: 'Data Management',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Settings',
            headerShown: true,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
