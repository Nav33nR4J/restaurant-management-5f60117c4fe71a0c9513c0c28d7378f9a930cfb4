/**
 * Molecule Component: MenuItemCard
 * Card displaying menu item with image, name, price
 */
import React, { memo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { MenuItem } from '../../types';
import { borderRadius, colors, spacing } from '../../utils/styles';
import Card from '../atoms/Card';
import Text from '../atoms/Text';

interface MenuItemCardProps {
  item: MenuItem;
  onPress: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = memo(({ item, onPress }) => {
  const price = item.final_price || item.price;

  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text variant="caption" color={colors.gray400}>No Image</Text>
          </View>
        )}
        {item.is_special && (
          <View style={styles.badge}>
            <Text variant="caption" color={colors.white} weight="bold">SPECIAL</Text>
          </View>
        )}
        {item.is_seasonal && (
          <View style={[styles.badge, styles.seasonalBadge]}>
            <Text variant="caption" color={colors.white} weight="bold">SEASONAL</Text>
          </View>
        )}
        {item.is_vegetarian && (
          <View style={styles.vegBadge}>
            <Text variant="caption" color={colors.success} weight="bold">V</Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text variant="body" weight="semibold" numberOfLines={1}>
          {item.name}
        </Text>
        {item.description && (
          <Text variant="caption" color={colors.textSecondary} numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
        )}
        <Text variant="h3" color={colors.primary} style={styles.price}>
          ${price.toFixed(2)}
        </Text>
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: {
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  imageContainer: {
    height: 120,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    position: 'relative',
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
  badge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  seasonalBadge: {
    backgroundColor: colors.accent,
  },
  vegBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.white,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.success,
  },
  content: {
    padding: spacing.xs,
  },
  description: {
    marginTop: spacing.xs,
  },
  price: {
    marginTop: spacing.sm,
  },
});

export default MenuItemCard;
