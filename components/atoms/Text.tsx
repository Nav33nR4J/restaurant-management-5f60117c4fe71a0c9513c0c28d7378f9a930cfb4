/**
 * Atom Component: Text
 * Text component with variants
 */
import React, { memo } from 'react';
import { Text as RNText, TextStyle } from 'react-native';
import { typography } from '../../utils/styles';

interface TextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
  color?: string;
  weight?: 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

const Text: React.FC<TextProps> = memo(({
  children,
  variant = 'body',
  color,
  weight,
  align,
  style,
  numberOfLines,
}) => {
  const getVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: typography.fontSize.xxxl,
          fontWeight: typography.fontWeight.bold,
          lineHeight: typography.fontSize.xxxl * typography.lineHeight.tight,
        };
      case 'h2':
        return {
          fontSize: typography.fontSize.xxl,
          fontWeight: typography.fontWeight.bold,
          lineHeight: typography.fontSize.xxl * typography.lineHeight.tight,
        };
      case 'h3':
        return {
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          lineHeight: typography.fontSize.xl * typography.lineHeight.normal,
        };
      case 'caption':
        return {
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.regular,
          lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
        };
      case 'label':
        return {
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
        };
      default:
        return {
          fontSize: typography.fontSize.md,
          fontWeight: typography.fontWeight.regular,
          lineHeight: typography.fontSize.md * typography.lineHeight.normal,
        };
    }
  };

  return (
    <RNText
      style={[
        getVariantStyles(),
        color && { color },
        weight && { fontWeight: typography.fontWeight[weight] },
        align && { textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
});

export default Text;
