/**
 * Molecule Component: QuantitySelector
 * Quantity selector with increment/decrement
 */
import React, { memo, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { borderRadius, colors, spacing } from '../../utils/styles';
import Text from '../atoms/Text';

interface QuantitySelectorProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
}

const QuantitySelector: React.FC<QuantitySelectorProps> = memo(({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
}) => {
  const handleIncrement = useCallback(() => {
    if (quantity < max) {
      onIncrement();
    }
  }, [quantity, max, onIncrement]);

  const handleDecrement = useCallback(() => {
    if (quantity > min) {
      onDecrement();
    }
  }, [quantity, min, onDecrement]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handleDecrement}
        disabled={quantity <= min}
        style={[styles.button, quantity <= min && styles.buttonDisabled]}
      >
        <Text
          variant="h3"
          color={quantity <= min ? colors.gray400 : colors.primary}
        >
          −
        </Text>
      </TouchableOpacity>
      <View style={styles.quantityContainer}>
        <Text variant="body" weight="semibold" align="center">
          {quantity}
        </Text>
      </View>
      <TouchableOpacity
        onPress={handleIncrement}
        disabled={quantity >= max}
        style={[styles.button, quantity >= max && styles.buttonDisabled]}
      >
        <Text
          variant="h3"
          color={quantity >= max ? colors.gray400 : colors.primary}
        >
          +
        </Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray100,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  button: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: colors.gray100,
  },
  quantityContainer: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuantitySelector;
