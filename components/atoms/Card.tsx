/**
 * Atom Component: Card
 * Card container component
 */
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../utils/styles';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = memo(({
  children,
  style,
  onPress,
  elevation = 'md',
}) => {
  const getShadow = () => {
    switch (elevation) {
      case 'sm': return shadows.sm;
      case 'lg': return shadows.lg;
      default: return shadows.md;
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.card, getShadow(), style]}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, getShadow(), style]}>
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
});

export default Card;
