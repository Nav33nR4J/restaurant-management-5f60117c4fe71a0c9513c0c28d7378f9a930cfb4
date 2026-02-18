import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
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

// Bill Modal Component - Physical white bill design
const BillModal = ({
  visible,
  onClose,
  items,
  subtotal,
  tax,
  total,
  theme,
  onCheckout,
}: {
  visible: boolean;
  onClose: () => void;
  items: { id: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  tax: number;
  total: number;
  theme: any;
  onCheckout: () => void;
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={appStyles.bill.modalOverlay}>
      <View style={[appStyles.bill.modalContent, { backgroundColor: '#FFFFFF' }]}>
        {/* Bill Header */}
        <View style={appStyles.bill.header}>
          <Text style={appStyles.bill.restaurantName}>Restaurant</Text>
          <Text style={appStyles.bill.billTitle}>BILL</Text>
          <View style={appStyles.bill.divider} />
        </View>

        {/* Cart Items */}
        <ScrollView style={appStyles.bill.itemsContainer}>
          {items.map((item) => (
            <View key={item.id} style={appStyles.bill.itemRow}>
              <View style={appStyles.bill.itemInfo}>
                <Text style={appStyles.bill.itemName}>{item.name}</Text>
                <Text style={appStyles.bill.itemQuantity}>
                  {item.quantity} × ₹{item.price}
                </Text>
              </View>
              <Text style={appStyles.bill.itemTotal}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Bill Summary */}
        <View style={appStyles.bill.summaryContainer}>
          <View style={appStyles.bill.divider} />
          
          <View style={appStyles.bill.summaryRow}>
            <Text style={appStyles.bill.summaryLabel}>Subtotal</Text>
            <Text style={appStyles.bill.summaryValue}>₹{subtotal.toFixed(2)}</Text>
          </View>
          
          <View style={appStyles.bill.summaryRow}>
            <Text style={appStyles.bill.summaryLabel}>Tax (5%)</Text>
            <Text style={appStyles.bill.summaryValue}>₹{tax.toFixed(2)}</Text>
          </View>
          
          <View style={appStyles.bill.divider} />
          
          <View style={appStyles.bill.totalRow}>
            <Text style={appStyles.bill.totalLabel}>TOTAL</Text>
            <Text style={appStyles.bill.totalValue}>₹{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={appStyles.bill.buttonContainer}>
          <Pressable
            onPress={onClose}
            style={[appStyles.bill.secondaryButton, { borderColor: theme.primary }]}
          >
            <Text style={[appStyles.bill.secondaryButtonText, { color: theme.primary }]}>
              Close
            </Text>
          </Pressable>
          
          <Pressable
            onPress={onCheckout}
            style={[appStyles.bill.primaryButton, { backgroundColor: theme.primary }]}
          >
            <Text style={appStyles.bill.primaryButtonText}>Checkout</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

export default function CartPage() {
  const { safePush } = useSafeNavigation(300);
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;
  const [showBill, setShowBill] = useState(false);

  const theme = useMemo(() => getTheme(flavor, resolvedMode), [flavor, resolvedMode]);

  const total = useMemo(() =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  // Calculate tax (5%) and grand total
  const tax = useMemo(() => total * 0.05, [total]);
  const grandTotal = useMemo(() => total + tax, [total, tax]);

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

  const handleProceedToPayment = useCallback(() => {
    setShowBill(true);
  }, []);

  const handleCloseBill = useCallback(() => {
    setShowBill(false);
  }, []);

  const handleCheckout = useCallback(() => {
    setShowBill(false);
    // Navigate to checkout page
    router.push("/checkout");
  }, []);

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
            onPress={handleProceedToPayment}
          >
            <Text style={appStyles.cart.checkoutText}>Proceed to Payment →</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Bill Modal */}
      <BillModal
        visible={showBill}
        onClose={handleCloseBill}
        items={items}
        subtotal={total}
        tax={tax}
        total={grandTotal}
        theme={theme}
        onCheckout={handleCheckout}
      />
    </View>
  );
}

