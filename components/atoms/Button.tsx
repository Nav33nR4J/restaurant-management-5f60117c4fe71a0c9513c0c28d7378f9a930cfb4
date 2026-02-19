/**
 * Atom Component: Button
 * Basic button component with variants
 */
import React, { memo, useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { borderRadius, colors, shadows, spacing, typography } from '../../utils/styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const handlePress = useCallback(() => {
    if (!disabled && !loading) {
      onPress();
    }
  }, [disabled, loading, onPress]);

  const getBackgroundColor = () => {
    if (disabled) return colors.gray300;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.gray500;
    switch (variant) {
      case 'primary': return colors.white;
      case 'secondary': return colors.white;
      case 'outline': return colors.primary;
      case 'ghost': return colors.primary;
      default: return colors.white;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small': return { paddingVertical: spacing.sm, paddingHorizontal: spacing.md };
      case 'large': return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xxl };
      default: return { paddingVertical: spacing.md, paddingHorizontal: spacing.xl };
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small': return typography.fontSize.sm;
      case 'large': return typography.fontSize.lg;
      default: return typography.fontSize.md;
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getSizeStyles(),
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && styles.outline,
        style,
      ]}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: getTextColor(), fontSize: getTextSize() },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...shadows.sm,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.primary,
    ...shadows.sm,
    shadowOpacity: 0,
    elevation: 0,
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
});

export default Button;
