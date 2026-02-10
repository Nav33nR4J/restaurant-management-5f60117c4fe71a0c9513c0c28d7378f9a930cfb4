import { LinearGradient } from "expo-linear-gradient";
import React, { memo, useCallback, useMemo } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View
} from "react-native";
import { ActionButton, QuantityControl } from "../components/ui";
import { hasPermission, isBranch, isHQ, isUser } from "../config/accessControl";
import { MenuItem as ConfigMenuItem, SeasonalMenu } from "../config/config";
import { addItem, removeItem } from "../store/cartSlice";
import { useAppDispatch } from "../store/hooks";
import { selectAllStockItems, toggleStockStatus } from "../store/stockSlice";
import { withOpacity } from "../utils/colorUtils";

// Stock toggle helper - defined outside component to prevent recreation
const handleStockToggle = (
  dispatch: ReturnType<typeof useAppDispatch>,
  itemId: string,
  itemName: string,
  currentStatus: boolean
) => {
  void dispatch(
    toggleStockStatus({
      menuItemId: itemId,
      menuItemName: itemName,
      currentStatus,
    })
  );
};

interface MenuItemCardProps {
  item: ConfigMenuItem;
  items: { id: string; quantity: number }[];
  stockItems: ReturnType<typeof selectAllStockItems>;
  seasonalMenus: SeasonalMenu[];
  theme: any;
  onDelete?: (id: string) => void;
  onEditPrice?: (item: ConfigMenuItem) => void;
}

// Memoized MenuItemCard to prevent unnecessary re-renders
export const MenuItemCard = memo(function MenuItemCard({
  item,
  items,
  stockItems,
  seasonalMenus,
  theme,
  onDelete,
  onEditPrice,
}: MenuItemCardProps) {
  const dispatch = useAppDispatch();
  
  // Memoize cart item lookup
  const cartItem = useMemo(() => items.find((i) => i.id === item.id), [items, item.id]);
  const qty = cartItem?.quantity ?? 0;
  
  // Memoize stock status lookup
  const stockStatus = useMemo(() => {
    if (isUser()) return { inStock: true };
    const stock = stockItems.find((s) => s.menuItemId === item.id);
    return stock || { inStock: true };
  }, [stockItems, item.id]);
  
  const isInStock = stockStatus.inStock;
  
  // Memoize permission checks
  const { canManageStock, canManageMenu, canManagePricing } = useMemo(() => ({
    canManageStock: isBranch() && hasPermission("stock:manage"),
    canManageMenu: isHQ() && hasPermission("menu:delete"),
    canManagePricing: isBranch() && hasPermission("pricing:manage"),
  }), []);
  
  // Memoize seasonal menu name lookup
  const seasonalMenuName = useMemo(() => {
    if (!item.seasonalMenuId) return null;
    return seasonalMenus.find((m) => m.id === item.seasonalMenuId)?.name || "Seasonal";
  }, [item.seasonalMenuId, seasonalMenus]);
  
  // Memoize handlers to prevent re-creation on each render
  const handleAddItem = useCallback(() => {
    dispatch(addItem({ id: item.id, name: item.name, price: item.price }));
  }, [dispatch, item.id, item.name, item.price]);
  
  const handleRemoveItem = useCallback(() => {
    dispatch(removeItem(item.id));
  }, [dispatch, item.id]);
  
  const handleDelete = useCallback(() => {
    onDelete?.(item.id);
  }, [onDelete, item.id]);
  
  const handleStockToggleCallback = useCallback(() => {
    handleStockToggle(dispatch, item.id, item.name, isInStock);
  }, [dispatch, item.id, item.name, isInStock]);
  
  // Determine text color with opacity safely
  const textSecondaryColor = useMemo(() => {
    return withOpacity(theme.text, 0.5);
  }, [theme.text]);
  
  const textMutedColor = useMemo(() => {
    return withOpacity(theme.text, 0.35);
  }, [theme.text]);

  // Handle price click - opens the pricing modal
  const handlePriceClick = useCallback(() => {
    if (canManagePricing && onEditPrice) {
      onEditPrice(item);
    }
  }, [canManagePricing, onEditPrice, item]);

  // Price text styling with click feedback
  const priceTextStyle = useMemo(() => [
    styles.itemPrice,
    { color: theme.accent },
    canManagePricing && onEditPrice && styles.editablePrice
  ], [theme.accent, canManagePricing, onEditPrice]);

  return (
    <LinearGradient colors={theme.card as [string, string, ...string[]]} style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />

      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
          {seasonalMenuName && (
            <View style={[styles.seasonalBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.seasonalBadgeText}>{seasonalMenuName}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.itemDesc, { color: textSecondaryColor }]}>
          {item.description}
        </Text>

        <View style={styles.row}>
          <View style={styles.priceContainer}>
            {/* Clickable price for branch pricing management */}
            {canManagePricing && onEditPrice ? (
              <Pressable onPress={handlePriceClick} style={styles.pricePressable}>
                <Text style={priceTextStyle}>
                  ₹{item.price.toFixed(2)}
                </Text>
              </Pressable>
            ) : (
              <Text style={[styles.itemPrice, { color: theme.accent }]}>
                ₹{item.price.toFixed(2)}
              </Text>
            )}
            {item.basePrice !== item.price && isHQ() && (
              <Text style={[styles.basePrice, { color: textMutedColor }]}>
                Base: ₹{item.basePrice.toFixed(2)}
              </Text>
            )}
            {item.basePrice !== item.price && canManagePricing && (
              <Text style={[styles.branchPriceNote, { color: textSecondaryColor }]}>
                (Branch Price)
              </Text>
            )}
          </View>

          {/* Add/Remove controls */}
          {isUser() && isInStock && (
            <>
              {qty === 0 ? (
                <ActionButton
                  title="+ Add"
                  onPress={handleAddItem}
                  variant="primary"
                  theme={theme}
                />
              ) : (
                <QuantityControl
                  quantity={qty}
                  onIncrease={handleAddItem}
                  onDecrease={handleRemoveItem}
                  theme={theme}
                />
              )}
            </>
          )}

          {/* Delete button for HQ */}
          {canManageMenu && onDelete && (
            <ActionButton
              title="Delete"
              onPress={handleDelete}
              variant="danger"
              theme={theme}
            />
          )}
        </View>

        {/* Stock indicator and toggle - inline with other controls */}
        {canManageStock && (
          <View style={styles.stockControlsContainer}>
            <View
              style={[
                styles.stockIndicator,
                { backgroundColor: isInStock ? "#10B981" : "#EF4444" },
              ]}
            >
              <Text style={styles.stockText}>
                {isInStock ? "In Stock" : "Out of Stock"}
              </Text>
            </View>
            <Switch
              value={isInStock}
              onValueChange={handleStockToggleCallback}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        )}
      </View>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 2,
  },
  stockControlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  stockIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  stockText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  itemContent: {
    flex: 1,
    paddingLeft: 14,
    justifyContent: "center",
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
    flex: 1,
  },
  itemDesc: {
    fontSize: 13,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  priceContainer: {
    flex: 1,
    minWidth: 100,
  },
  pricePressable: {
    padding: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  editablePrice: {
    textDecorationLine: "underline",
  },
  branchPriceNote: {
    fontSize: 10,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: "700",
  },
  basePrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  seasonalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  seasonalBadgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },
});
