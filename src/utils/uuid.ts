/**
 * UUID Generator Utility
 * 
 * Provides UUID generation compatible with React Native using expo-crypto.
 */

import * as Crypto from 'expo-crypto';

/**
 * Generate a UUID v4 string
 * 
 * @returns A UUID v4 string
 */
export const generateUUID = (): string => {
  // Generate random UUID using expo-crypto
  return Crypto.randomUUID();
};
