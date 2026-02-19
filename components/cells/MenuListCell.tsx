/**
 * Cell Component: MenuListCell
 * Complete menu list with categories and items
 */
import React, { memo, useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import type { Category, MenuItem } from '../../types';
import { menuService } from '../../utils/api/services';
import { colors, spacing } from '../../utils/styles';
import { WARNINGS } from '../../utils/warnings';
import Text from '../atoms/Text';
import { CategoryChip, MenuItemCard } from '../molecules';

interface MenuListCellProps {
  onItemPress: (item: MenuItem) => void;
}

const MenuListCell: React.FC<MenuListCellProps> = memo(({ onItemPress }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const [cats, menuData] = await Promise.all([
        menuService.getCategories(),
        menuService.getMenuItems(selectedCategory ? { category_id: selectedCategory } : undefined),
      ]);
      setCategories(cats);
      setItems(menuData.data);
    } catch (err: any) {
      setError(err.message || WARNINGS.MENU.LOADING_ERROR);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleCategoryPress = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <CategoryChip
      name={item.name}
      isSelected={selectedCategory === item.id}
      onPress={() => handleCategoryPress(item.id)}
    />
  );

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <MenuItemCard item={item} onPress={() => onItemPress(item)} />
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="body" color={colors.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={[{ id: null, name: 'All' }, ...categories]}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id || 'all'}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      />
      <FlatList
        data={items}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="body" color={colors.textSecondary}>
              No menu items available
            </Text>
          </View>
        }
      />
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
  },
  categoryList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuList: {
    paddingHorizontal: spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
});

export default MenuListCell;
