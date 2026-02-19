/**
 * Cell Component: CartCell
 * Complete cart view with items and summary
 */
import React, { memo, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import type { Cart, CartItem } from '../../types';
import { cartService } from '../../utils/api/services';
import { colors, spacing } from '../../utils/styles';
import { WARNINGS } from '../../utils/warnings';
import Button from '../atoms/Button';
import Text from '../atoms/Text';
import { CartItemRow } from '../molecules';

interface CartCellProps {
  onCheckout: () => void;
}

const CartCell: React.FC<CartCellProps> = memo(({ onCheckout }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || WARNINGS.CART.ADD_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = useCallback(async (itemId: string, quantity: number) => {
    setUpdating(true);
    try {
      if (quantity <= 0) {
        await cartService.removeFromCart(itemId);
      } else {
        await cartService.updateCartItem(itemId, quantity);
      }
      await fetchCart();
    } catch (err: any) {
      Alert.alert('Error', err.message || WARNINGS.CART.ADD_ERROR);
    } finally {
      setUpdating(false);
    }
  }, [fetchCart]);

  const handleRemove = useCallback(async (itemId: string) => {
    setUpdating(true);
    try {
      await cartService.removeFromCart(itemId);
      await fetchCart();
    } catch (err: any) {
      Alert.alert('Error', err.message || WARNINGS.CART.ADD_ERROR);
    } finally {
      setUpdating(false);
    }
  }, [fetchCart]);

  const renderItem = ({ item }: { item: CartItem }) => (
    <CartItemRow
      item={item}
      onQuantityChange={(quantity) => handleQuantityChange(item.id, quantity)}
      onRemove={() => handleRemove(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="h3" color={colors.textSecondary}>{WARNINGS.CART.EMPTY_CART}</Text>
        <Text variant="caption" color={colors.textMuted} style={styles.emptyText}>
          Add items from the menu to get started
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text variant="body" color={colors.textSecondary}>Subtotal</Text>
          <Text variant="body">${cart.subtotal.toFixed(2)}</Text>
        </View>
        {cart.discount !== undefined && cart.discount > 0 && (
          <View style={styles.summaryRow}>
            <Text variant="body" color={colors.success}>Discount</Text>
            <Text variant="body" color={colors.success}>-${cart.discount.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text variant="h3">Total</Text>
          <Text variant="h3" color={colors.primary}>
            ${(cart.total || cart.subtotal).toFixed(2)}
          </Text>
        </View>
        <Button
          title="Proceed to Checkout"
          onPress={onCheckout}
          loading={updating}
          style={styles.checkoutButton}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  list: {
    padding: spacing.lg,
  },
  footer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  checkoutButton: {
    marginTop: spacing.lg,
  },
});

export default CartCell;
