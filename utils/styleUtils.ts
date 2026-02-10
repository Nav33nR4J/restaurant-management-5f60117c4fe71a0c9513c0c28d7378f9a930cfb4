/**
 * Style Utilities
 * Provides StyleSheet.flatten and other style-related utilities
 */

import { ImageStyle, StyleProp, TextStyle, ViewStyle } from "react-native";

/**
 * Type for flattened style objects
 */
export type FlattenedStyle = ViewStyle & TextStyle & ImageStyle;

/**
 * Result of flattening styles
 */
export interface FlattenResult {
  style: FlattenedStyle;
  originalStyles: StyleProp<ViewStyle>[];
  isEmpty: boolean;
}

/**
 * Flatten an array of style objects into a single style object
 * Similar to StyleSheet.flatten but works with arrays of styles
 */
export function flattenStyles(
  styles: (StyleProp<ViewStyle> | undefined | null | false)[]
): FlattenResult {
  const originalStyles: StyleProp<ViewStyle>[] = [];
  
  for (const style of styles) {
    if (style) {
      originalStyles.push(style);
    }
  }

  if (originalStyles.length === 0) {
    return {
      style: {},
      originalStyles: [],
      isEmpty: true,
    };
  }

  // Use StyleSheet.flatten to properly flatten array styles
  const flattened = StyleSheet.flatten(originalStyles) as FlattenedStyle;

  return {
    style: flattened,
    originalStyles,
    isEmpty: false,
  };
}

/**
 * Flatten styles and return just the style object
 */
export function flatten<T extends FlattenedStyle = FlattenedStyle>(
  styles: (StyleProp<ViewStyle> | undefined | null | false)[]
): T {
  return StyleSheet.flatten(styles) as T;
}

/**
 * Compose multiple style arrays into one
 */
export function composeStyles(
  ...styleArrays: (StyleProp<ViewStyle> | undefined | null | false)[]
): StyleProp<ViewStyle>[] {
  const result: StyleProp<ViewStyle>[] = [];
  
  for (const styles of styleArrays) {
    if (styles) {
      result.push(styles);
    }
  }
  
  return result;
}

/**
 * Merge two style objects (later styles override earlier ones)
 */
export function mergeStyles(
  base: StyleProp<ViewStyle>,
  override: StyleProp<ViewStyle>
): FlattenedStyle {
  return flatten([base, override]);
}

/**
 * Create a style object with conditional properties
 */
export function conditionalStyle<T extends FlattenedStyle>(
  condition: boolean,
  trueStyle: T,
  falseStyle?: T
): T | undefined {
  if (!condition) {
    return falseStyle;
  }
  return trueStyle;
}

/**
 * Create a style object with optional properties based on theme
 */
export function createThemeStyle<T extends FlattenedStyle>(
  theme: Record<string, string | number>,
  mapping: Record<keyof T, string>
): T {
  const style = {} as T;
  
  for (const [key, themeKey] of Object.entries(mapping)) {
    const value = theme[themeKey];
    if (value !== undefined) {
      (style as Record<string, unknown>)[key] = value;
    }
  }
  
  return style;
}

/**
 * Memoized style hook for dynamic styles
 */
import { useMemo } from "react";

/**
 * Create a memoized style object
 * Prevents unnecessary style recreation when theme/object doesn't change
 */
export function useFlattenedStyle<T extends FlattenedStyle>(
  factory: () => T,
  deps: readonly unknown[]
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

/**
 * Create a memoized array of styles
 */
export function useStyles<T extends StyleProp<ViewStyle>>(
  factory: () => T,
  deps: readonly unknown[]
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}

/**
 * Get style property with fallback
 */
export function getStyleValue(
  style: FlattenedStyle | undefined,
  property: keyof FlattenedStyle,
  fallback?: unknown
): unknown {
  if (!style) return fallback;
  return style[property] ?? fallback;
}

/**
 * Check if a style object has a specific property
 */
export function hasStyleProperty(
  style: FlattenedStyle | undefined,
  property: keyof FlattenedStyle
): boolean {
  if (!style) return false;
  return property in style;
}

/**
 * Create a shadow style object
 */
export function createShadowStyle(
  elevation: number,
  color: string = "#000"
): ViewStyle {
  const shadowOpacity = Math.min(elevation * 0.1, 0.5);
  
  return {
    elevation,
    shadowColor: color,
    shadowOffset: { width: 0, height: elevation / 2 },
    shadowOpacity,
    shadowRadius: elevation,
  };
}

/**
 * Platform-specific style helper
 */
export function platformSpecific<T>(
  iosStyle: T,
  androidStyle: T,
  defaultStyle: T
): T {
  // This would be expanded with actual platform detection
  return defaultStyle;
}

/**
 * Combine multiple spacing values
 */
export function combineSpacing(
  margin?: number,
  padding?: number
): { margin?: number; padding?: number } {
  const result: { margin?: number; padding?: number } = {};
  
  if (margin !== undefined) result.margin = margin;
  if (padding !== undefined) result.padding = padding;
  
  return result;
}

/**
 * Create a responsive dimension based on screen width
 */
export function responsiveSize(
  baseSize: number,
  scaleFactor: number = 0.5
): number {
  // This would be expanded with actual screen width detection
  return baseSize;
}

// Re-export StyleSheet for convenience
import { StyleSheet } from "react-native";

export { StyleSheet };

export default {
  flattenStyles,
  flatten,
  composeStyles,
  mergeStyles,
  conditionalStyle,
  createThemeStyle,
  useFlattenedStyle,
  useStyles,
  getStyleValue,
  hasStyleProperty,
  createShadowStyle,
  platformSpecific,
  combineSpacing,
  responsiveSize,
  StyleSheet,
};

