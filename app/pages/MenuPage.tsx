/**
 * Page: MenuPage
 * Main menu screen with categories and items
 */
import { useNavigation } from '@react-navigation/native';
import React, { memo, useCallback } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Text from '../../components/atoms/Text';
import { MenuListCell } from '../../components/cells';
import type { MenuItem } from '../../types';
import { colors, spacing } from '../../utils/styles';

const MenuPage: React.FC = memo(() => {
  const navigation = useNavigation<any>();

  const handleItemPress = useCallback((item: MenuItem) => {
    // Navigate to item detail or add to cart modal
    navigation.navigate('Cart');
  }, [navigation]);

  const handleCartPress = useCallback(() => {
    navigation.navigate('Cart');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text variant="h2">Menu</Text>
        <TouchableOpacity onPress={handleCartPress} style={styles.cartButton}>
          <Text variant="body" color={colors.primary} weight="semibold">
            Cart
          </Text>
        </TouchableOpacity>
      </View>
      <MenuListCell onItemPress={handleItemPress} />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  cartButton: {
    padding: spacing.sm,
  },
});

export default MenuPage;
