# Budget Tracker App

An offline-first mobile application built with Expo/React Native for managing personal finances.

## Project Structure

```
budget-tracker/
├── src/
│   ├── screens/        # UI screens/components
│   ├── services/       # Data access layer (Storage, Validation)
│   ├── managers/       # Business logic layer
│   ├── models/         # TypeScript interfaces and types
│   ├── utils/          # Utility functions
│   ├── contexts/       # React Context providers
│   └── navigation/     # Navigation configuration
├── assets/             # Images and static assets
└── App.tsx            # Application entry point
```

## Technology Stack

- **Framework**: Expo SDK (React Native)
- **Language**: TypeScript
- **Storage**: AsyncStorage
- **State Management**: React Context API
- **Navigation**: React Navigation
- **Date Handling**: date-fns

## Dependencies

- `@react-native-async-storage/async-storage` - Local data persistence
- `@react-navigation/native` - Navigation framework
- `@react-navigation/stack` - Stack navigator
- `react-native-screens` - Native screen components
- `react-native-safe-area-context` - Safe area handling
- `date-fns` - Date manipulation and formatting
- `uuid` - Unique ID generation

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on specific platform:
   ```bash
   npm run android  # Android
   npm run ios      # iOS (macOS only)
   npm run web      # Web browser
   ```

## Features

- Track earnings and expenses
- Categorize spending
- View spending analytics
- Estimate daily budgets
- Manage custom categories
- Delete data by date range
- Customize app theme
- Fully offline functionality

## Requirements

- Node.js 18+
- Expo CLI
- iOS Simulator (macOS) or Android Emulator
