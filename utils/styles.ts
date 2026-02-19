/**
 * Styles Utility - Centralized Styles using StyleSheet.flatten
 * All CSS/styling should be in this file and called via function
 */
import { StyleSheet, TextStyle } from 'react-native';

// Color Palette
export const colors = {
  // Primary Colors
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FF8A5C',
  
  // Secondary Colors
  secondary: '#2E4057',
  secondaryDark: '#1A2634',
  secondaryLight: '#4A5D7A',
  
  // Accent Colors
  accent: '#048A81',
  accentDark: '#036B64',
  accentLight: '#06A094',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  gray100: '#F7F7F7',
  gray200: '#E5E5E5',
  gray300: '#CCCCCC',
  gray400: '#999999',
  gray500: '#666666',
  gray600: '#333333',
  gray700: '#1A1A1A',
  
  // Status Colors
  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',
  
  // Background Colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  cardBackground: '#FFFFFF',
  
  // Text Colors
  textPrimary: '#212529',
  textSecondary: '#6C757D',
  textMuted: '#ADB5BD',
  textLight: '#FFFFFF',
};

// Typography
export const typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    light: '300' as TextStyle['fontWeight'],
    regular: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// Common Styles using StyleSheet.flatten for merging
export const getCommonStyles = () => {
  const containerBase = StyleSheet.flatten([
    {
      flex: 1,
      backgroundColor: colors.background,
    },
  ]);

  const cardBase = StyleSheet.flatten([
    {
      backgroundColor: colors.cardBackground,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      ...shadows.md,
    },
  ]);

  const buttonBase = StyleSheet.flatten([
    {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
    },
  ]);

  const buttonSecondary = StyleSheet.flatten([
    buttonBase,
    {
      backgroundColor: colors.secondary,
    },
  ]);

  const buttonOutline = StyleSheet.flatten([
    buttonBase,
    {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
  ]);

  const inputBase = StyleSheet.flatten([
    {
      backgroundColor: colors.gray100,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.gray200,
    },
  ]);

  const inputFocused = StyleSheet.flatten([
    inputBase,
    {
      borderColor: colors.primary,
    },
  ]);

  const textBase = StyleSheet.flatten([
    {
      fontSize: typography.fontSize.md,
      color: colors.textPrimary,
    },
  ]);

  const textHeading = StyleSheet.flatten([
    textBase,
    {
      fontSize: typography.fontSize.xxl,
      fontWeight: typography.fontWeight.bold,
    },
  ]);

  const textSubheading = StyleSheet.flatten([
    textBase,
    {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
    },
  ]);

  const textCaption = StyleSheet.flatten([
    textBase,
    {
      fontSize: typography.fontSize.sm,
      color: colors.textSecondary,
    },
  ]);

  const row = StyleSheet.flatten([
    {
      flexDirection: 'row',
      alignItems: 'center',
    },
  ]);

  const center = StyleSheet.flatten([
    {
      justifyContent: 'center',
      alignItems: 'center',
    },
  ]);

  const spaceBetween = StyleSheet.flatten([
    row,
    {
      justifyContent: 'space-between',
    },
  ]);

  return {
    containerBase,
    cardBase,
    buttonBase,
    buttonSecondary,
    buttonOutline,
    inputBase,
    inputFocused,
    textBase,
    textHeading,
    textSubheading,
    textCaption,
    row,
    center,
    spaceBetween,
  };
};

// Get style by key for reuse
export const getStyle = (styleKey: string): any => {
  const styles = getCommonStyles();
  return styles[styleKey] || {};
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  getCommonStyles,
  getStyle,
};
