import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useMemo } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  useColorScheme,
} from "react-native";

import { ActionButton, QuantityControl } from "../components/ui";
import { useSafeNavigation } from "../hooks/useSafeNavigation";
import { addItem, clearCart, removeItem } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";
import { appStyles } from "../styles";
import { getTheme } from "../theme";
import { Loggers } from "../utils/logger";

// Memoized cart item component for better performance
const CartItemComponent = memo(({ item, theme, onAdd, onRemove }: {
  item: { id: string; name: string; price: number; quantity: number };
  theme: any;
  onAdd: () => void;
  onRemove: () => void;
}) => (
  <LinearGradient
    colors={theme.card}
    style={appStyles.cart.card}
  >
    <View>
      <Text style={[appStyles.cart.name, { color: theme.text }]}>
        {item.name}
      </Text>
      <Text style={[appStyles.cart.price, { color: theme.accent }]}>
        ₹{item.price} × {item.quantity}
      </Text>
    </View>

    <QuantityControl
      quantity={item.quantity}
      onIncrease={onAdd}
      onDecrease={onRemove}
      theme={theme}
    />
  </LinearGradient>
));
CartItemComponent.displayName = "CartItemComponent";

export default function CartPage() {
  const { safePush } = useSafeNavigation(300);
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = useMemo(() => getTheme(flavor, resolvedMode), [flavor, resolvedMode]);

  const total = useMemo(() =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  // Memoized handlers
  const handleAddItem = useCallback((item: typeof items[0]) => {
    dispatch(addItem(item));
  }, [dispatch]);

  const handleRemoveItem = useCallback((itemId: string) => {
    dispatch(removeItem(itemId));
  }, [dispatch]);

  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
    Loggers.cart.info("Cart cleared");
    // Navigate after a small delay to allow state to update
    const timer = setTimeout(() => {
      router.replace('/order-success');
    }, 100);
  }, [dispatch]);

  const handleBrowseMenu = useCallback(() => {
    safePush("menu");
  }, [safePush]);

  const handleToggleTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  if (items.length === 0) {
    return (
      <View
        style={[
          appStyles.cart.emptyContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <Text style={[appStyles.cart.emptyText, { color: theme.text }]}>
          Your cart is empty
        </Text>

        <ActionButton
          title="Browse Menu"
          onPress={handleBrowseMenu}
          variant="primary"
          theme={theme}
        />

        <Pressable
          onPress={handleToggleTheme}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: theme.text, opacity: 0.7 }}>
            Toggle {resolvedMode === "dark" ? "Light" : "Dark"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[appStyles.cart.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 200 }}
        renderItem={({ item }) => (
          <CartItemComponent
            item={item}
            theme={theme}
            onAdd={() => handleAddItem(item)}
            onRemove={() => handleRemoveItem(item.id)}
          />
        )}
      />

      {/* CHECKOUT BAR */}
      <LinearGradient
        colors={[theme.primary, theme.accent]}
        style={appStyles.cart.checkoutBar}
      >
        <View>
          <Text style={appStyles.cart.totalLabel}>Total</Text>
          <Text style={appStyles.cart.totalAmount}>₹{total}</Text>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Pressable
            onPress={handleToggleTheme}
            style={{ marginBottom: 8 }}
          >
            <Text style={{ color: "#FFF", opacity: 0.7, fontSize: 12 }}>
              Toggle {resolvedMode === "dark" ? "Light" : "Dark"}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleClearCart}
          >
            <Text style={appStyles.cart.checkoutText}>Checkout →</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
}

