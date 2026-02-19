/**
 * Molecule Component: CategoryChip
 * Category filter chip
 */
import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { borderRadius, colors, spacing } from '../../utils/styles';
import Text from '../atoms/Text';

interface CategoryChipProps {
  name: string;
  isSelected: boolean;
  onPress: () => void;
}

const CategoryChip: React.FC<CategoryChipProps> = memo(({ name, isSelected, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, isSelected && styles.chipSelected]}
      activeOpacity={0.7}
    >
      <Text
        variant="label"
        color={isSelected ? colors.white : colors.textPrimary}
        weight={isSelected ? 'semibold' : 'regular'}
      >
        {name}
      </Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray100,
    marginRight: spacing.sm,
  },
  chipSelected: {
    backgroundColor: colors.primary,
  },
});

export default CategoryChip;
