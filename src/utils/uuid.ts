/**
 * UUID Generator Utility
 * 
 * Provides UUID generation compatible with React Native without native dependencies.
 */

/**
 * Generate a UUID v4 string
 * 
 * @returns A UUID v4 string
 */
export const generateUUID = (): string => {
  // Generate UUID v4 using Math.random (no native dependencies required)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
