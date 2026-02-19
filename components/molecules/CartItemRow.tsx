/**
 * Molecule Component: CartItemRow
 * Row displaying cart item with quantity controls
 */
import React, { memo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { CartItem } from '../../types';
import { borderRadius, colors, spacing } from '../../utils/styles';
import Text from '../atoms/Text';
import QuantitySelector from './QuantitySelector';

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

const CartItemRow: React.FC<CartItemRowProps> = memo(({ item, onQuantityChange, onRemove }) => {
  const price = item.final_price || item.unit_price;
  const subtotal = price * item.quantity;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text variant="caption" color={colors.gray400}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="body" weight="semibold" numberOfLines={1} style={styles.name}>
            {item.name}
          </Text>
          <TouchableOpacity onPress={onRemove} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text variant="caption" color={colors.error}>Remove</Text>
          </TouchableOpacity>
        </View>
        <Text variant="caption" color={colors.textSecondary}>
          ${price.toFixed(2)} each
        </Text>
        <View style={styles.footer}>
          <QuantitySelector
            quantity={item.quantity}
            onIncrement={() => onQuantityChange(item.quantity + 1)}
            onDecrement={() => onQuantityChange(item.quantity - 1)}
          />
          <Text variant="body" weight="bold" color={colors.primary}>
            ${subtotal.toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  imageContainer: {
    width: 70,
    height: 70,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  name: {
    flex: 1,
    marginRight: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});

export default CartItemRow;
