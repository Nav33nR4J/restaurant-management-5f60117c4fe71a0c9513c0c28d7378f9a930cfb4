import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useColorScheme
} from "react-native";

import { ActionButton } from "../components/ui";
import { useSafeNavigation } from "../hooks/useSafeNavigation";
import { clearCart } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { CustomItemDiscount, Promotion } from "../store/promotions/promotionsSlice";
import { appStyles } from "../styles";
import { getTheme } from "../theme";
import { Loggers } from "../utils/logger";
import { api } from "../utils/promotions/api";

// Bill Modal Component - Physical white bill design with theme background
const BillModal = ({
  visible,
  onClose,
  items,
  subtotal,
  tax,
  total,
  discount,
  grandTotal,
  theme,
  appliedPromotion,
  onCheckout,
}: {
  visible: boolean;
  onClose: () => void;
  items: { id: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  grandTotal: number;
  theme: any;
  appliedPromotion: Promotion | null;
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
          
          {discount > 0 && (
            <View style={appStyles.bill.summaryRow}>
              <Text style={[appStyles.bill.summaryLabel, { color: '#22C55E' }]}>
                Discount {appliedPromotion && `(${appliedPromotion.promo_code})`}
              </Text>
              <Text style={[appStyles.bill.summaryValue, { color: '#22C55E' }]}>
                -₹{discount.toFixed(2)}
              </Text>
            </View>
          )}
          
          <View style={appStyles.bill.summaryRow}>
            <Text style={appStyles.bill.summaryLabel}>Tax (5%)</Text>
            <Text style={appStyles.bill.summaryValue}>₹{tax.toFixed(2)}</Text>
          </View>
          
          <View style={appStyles.bill.divider} />
          
          <View style={appStyles.bill.totalRow}>
            <Text style={appStyles.bill.totalLabel}>TOTAL</Text>
            <Text style={appStyles.bill.totalValue}>₹{grandTotal.toFixed(2)}</Text>
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
            <Text style={appStyles.bill.primaryButtonText}>Proceed to Payment</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);

// Coupons Modal Component
const CouponsModal = ({
  visible,
  onClose,
  promotions,
  cartItems,
  onApplyCoupon,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  promotions: Promotion[];
  cartItems: { id: string; name: string; price: number; quantity: number }[];
  onApplyCoupon: (promotion: Promotion) => void;
  theme: any;
}) => {
  // Check if a promotion can be used with cart items
  const isPromotionUsable = (promotion: Promotion): boolean => {
    // If promotion is inactive, can't use
    if (promotion.status !== 'ACTIVE') return false;
    
    // If it's a CUSTOM_ITEMS promotion, check if any cart item is in custom_items
    if (promotion.discount_type === 'CUSTOM_ITEMS' && promotion.custom_items) {
      const cartItemIds = cartItems.map(item => item.id);
      return promotion.custom_items.some((item: CustomItemDiscount) => cartItemIds.includes(item.item_id));
    }
    
    // For PERCENTAGE and FIXED promotions, they can be used on entire order
    return true;
  };

  const renderCoupon = ({ item }: { item: Promotion }) => {
    const isUsable = isPromotionUsable(item);
    
    return (
      <Pressable
        onPress={() => isUsable && onApplyCoupon(item)}
        style={[
          appStyles.coupons.couponCard,
          { borderColor: isUsable ? theme.primary : '#E0E0E0' }
        ]}
        disabled={!isUsable}
      >
        <View style={appStyles.coupons.couponContent}>
          <View style={appStyles.coupons.couponInfo}>
            <Text style={[
              appStyles.coupons.couponCode,
              { color: isUsable ? theme.primary : '#999' }
            ]}>
              {isUsable ? item.promo_code : '••••••'}
            </Text>
            <Text style={appStyles.coupons.couponTitle}>
              {item.title}
            </Text>
            <Text style={appStyles.coupons.couponDescription}>
              {item.discount_type === 'PERCENTAGE' 
                ? `${item.discount_value}% OFF` 
                : item.discount_type === 'FIXED' 
                  ? `₹${item.discount_value} OFF` 
                  : 'Special Item Discount'}
            </Text>
            {item.min_order_amount > 0 && (
              <Text style={appStyles.coupons.couponMinOrder}>
                Min. order: ₹{item.min_order_amount}
              </Text>
            )}
          </View>
          <View style={[
            appStyles.coupons.couponBadge,
            { backgroundColor: isUsable ? theme.primary : '#E0E0E0' }
          ]}>
            <Text style={[
              appStyles.coupons.couponBadgeText,
              { color: isUsable ? '#FFF' : '#999' }
            ]}>
              {isUsable ? 'Apply' : 'N/A'}
            </Text>
          </View>
        </View>
        {!isUsable && (
          <Text style={appStyles.coupons.unavailableText}>
            Not applicable to items in cart
          </Text>
        )}
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={appStyles.coupons.modalOverlay}>
        <View style={[appStyles.coupons.modalContent, { backgroundColor: theme.background }]}>
          <View style={appStyles.coupons.modalHeader}>
            <Text style={[appStyles.coupons.modalTitle, { color: theme.text }]}>
              Available Coupons
            </Text>
            <Pressable onPress={onClose}>
              <Text style={[appStyles.coupons.closeButton, { color: theme.primary }]}>
                ✕
              </Text>
            </Pressable>
          </View>
          
          <FlatList
            data={promotions}
            keyExtractor={(item) => item.id}
            renderItem={renderCoupon}
            contentContainerStyle={appStyles.coupons.listContainer}
            ListEmptyComponent={
              <View style={appStyles.coupons.emptyContainer}>
                <Text style={[appStyles.coupons.emptyText, { color: theme.text }]}>
                  No coupons available
                </Text>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

export default function CheckoutPage() {
  const { safePush } = useSafeNavigation(300);
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;
  const [showBill, setShowBill] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
  const [couponError, setCouponError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);

  const theme = useMemo(() => getTheme(flavor, resolvedMode), [flavor, resolvedMode]);

  // Fetch promotions on mount
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await api.get("/promotions") as any;
        if (response.data && Array.isArray(response.data)) {
          setPromotions(response.data);
        } else if (response.data && response.data.promotions) {
          setPromotions(response.data.promotions);
        }
      } catch (error) {
        console.log("Error fetching promotions:", error);
      } finally {
        setLoadingPromotions(false);
      }
    };
    fetchPromotions();
  }, []);

  const subtotal = useMemo(() =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  // Calculate discount based on applied promotion
  const discount = useMemo(() => {
    if (!appliedPromotion) return 0;
    
    if (appliedPromotion.discount_type === 'PERCENTAGE') {
      let discountAmount = subtotal * (appliedPromotion.discount_value / 100);
      // Apply max discount cap if set
      if (appliedPromotion.max_discount_amount) {
        discountAmount = Math.min(discountAmount, appliedPromotion.max_discount_amount);
      }
      return discountAmount;
    } else if (appliedPromotion.discount_type === 'FIXED') {
      return Math.min(appliedPromotion.discount_value, subtotal);
    } else if (appliedPromotion.discount_type === 'CUSTOM_ITEMS' && appliedPromotion.custom_items) {
      // Calculate discount only for applicable items
      let discountAmount = 0;
      items.forEach(cartItem => {
        const customItem = appliedPromotion.custom_items?.find(
          (item: CustomItemDiscount) => item.item_id === cartItem.id
        );
        if (customItem) {
          if (customItem.discount_type === 'PERCENTAGE') {
            discountAmount += (cartItem.price * cartItem.quantity) * (customItem.discount_value / 100);
          } else {
            discountAmount += customItem.discount_value * cartItem.quantity;
          }
        }
      });
      return discountAmount;
    }
    return 0;
  }, [appliedPromotion, subtotal, items]);

  // Calculate tax (5%) on discounted total
  const discountedTotal = subtotal - discount;
  const tax = useMemo(() => Math.max(0, discountedTotal * 0.05), [discountedTotal]);
  const grandTotal = useMemo(() => Math.max(0, discountedTotal + tax), [discountedTotal, tax]);

  const handleCloseBill = useCallback(() => {
    setShowBill(false);
  }, []);

  const handleShowBill = useCallback(() => {
    setShowBill(true);
  }, []);

  // Validate and apply coupon code
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsApplying(true);
    setCouponError("");

    try {
      const code = couponCode.trim().toUpperCase();
      const promotion = promotions.find((p: Promotion) => p.promo_code === code);

      if (!promotion) {
        setCouponError("Invalid coupon code");
        return;
      }

      if (promotion.status !== 'ACTIVE') {
        setCouponError("This coupon is not active");
        return;
      }

      // Check if promotion is applicable to cart items
      if (promotion.discount_type === 'CUSTOM_ITEMS' && promotion.custom_items) {
        const cartItemIds = items.map(item => item.id);
        const hasApplicableItem = promotion.custom_items.some(
          (item: CustomItemDiscount) => cartItemIds.includes(item.item_id)
        );
        if (!hasApplicableItem) {
          setCouponError("This coupon is not applicable to items in your cart");
          return;
        }
      }

      // Check minimum order amount
      if (promotion.min_order_amount > 0 && subtotal < promotion.min_order_amount) {
        setCouponError(`Minimum order amount is ₹${promotion.min_order_amount}`);
        return;
      }

      // Apply the promotion
      setAppliedPromotion(promotion);
      setCouponCode("");
      setShowBill(true);
    } catch (error) {
      setCouponError("Failed to apply coupon");
    } finally {
      setIsApplying(false);
    }
  }, [couponCode, promotions, items, subtotal]);

  // Handle applying coupon from the coupons modal
  const handleSelectCouponFromModal = useCallback((promotion: Promotion) => {
    setAppliedPromotion(promotion);
    setShowCouponsModal(false);
    setShowBill(true);
  }, []);

  // Remove applied coupon
  const handleRemoveCoupon = useCallback(() => {
    setAppliedPromotion(null);
    setCouponError("");
  }, []);

  const handleProceedToPayment = useCallback(() => {
    // Handle payment processing here
    Loggers.cart.info("Proceeding to payment", { total: grandTotal });
    // For now, navigate to order success after clearing cart
    dispatch(clearCart());
    router.replace('/order-success');
  }, [dispatch, grandTotal]);

  const handleBackToCart = useCallback(() => {
    router.back();
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
          onPress={() => router.push('/menu')}
          variant="primary"
          theme={theme}
        />
      </View>
    );
  }

  return (
    <View style={[appStyles.cart.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.primary, theme.accent]}
        style={appStyles.cart.checkoutBar}
      >
        <Pressable onPress={handleBackToCart} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: "#FFF", fontSize: 18, marginRight: 8 }}>←</Text>
          <Text style={appStyles.cart.totalLabel}>Checkout</Text>
        </Pressable>
        <Text style={appStyles.cart.totalAmount}>₹{grandTotal.toFixed(2)}</Text>
      </LinearGradient>

      {/* Order Summary */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingTop: 180, paddingBottom: 160 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 16 }}>
            <Text style={[appStyles.cart.name, { color: theme.text, fontSize: 20 }]}>
              Order Summary
            </Text>
          </View>
        }
        renderItem={({ item }) => (
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
            <Text style={[appStyles.cart.totalAmount, { color: theme.text }]}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </Text>
          </LinearGradient>
        )}
      />

      {/* Bill Summary Bar */}
      <LinearGradient
        colors={[theme.primary, theme.accent]}
        style={[appStyles.cart.checkoutBar, { bottom: 16 }]}
      >
        <View>
          <Text style={appStyles.cart.totalLabel}>
            Grand Total 
            {appliedPromotion && <Text style={{ color: '#90EE90' }}> (Code: {appliedPromotion.promo_code})</Text>}
          </Text>
          <Text style={appStyles.cart.totalAmount}>₹{grandTotal.toFixed(2)}</Text>
        </View>

        <Pressable
          onPress={handleProceedToPayment}
        >
          <Text style={appStyles.cart.checkoutText}>Proceed to Payment →</Text>
        </Pressable>
      </LinearGradient>

      {/* Bill Modal */}
      <BillModal
        visible={showBill}
        onClose={handleCloseBill}
        items={items}
        subtotal={subtotal}
        tax={tax}
        total={subtotal}
        discount={discount}
        grandTotal={grandTotal}
        theme={theme}
        appliedPromotion={appliedPromotion}
        onCheckout={handleProceedToPayment}
      />

      {/* Coupons Modal */}
      {!loadingPromotions && (
        <CouponsModal
          visible={showCouponsModal}
          onClose={() => setShowCouponsModal(false)}
          promotions={promotions}
          cartItems={items}
          onApplyCoupon={handleSelectCouponFromModal}
          theme={theme}
        />
      )}
    </View>
  );
}
