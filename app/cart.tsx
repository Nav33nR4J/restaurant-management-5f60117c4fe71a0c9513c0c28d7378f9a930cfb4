import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { ActionButton, QuantityControl } from "../components/ui";
import { useSafeNavigation } from "../hooks/useSafeNavigation";
import { addItem, clearCart, removeItem } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";
import { appStyles } from "../styles";
import { getTheme } from "../theme";
import { Loggers } from "../utils/logger";
import { PromoStatus, promotionApi, PromoType } from "../utils/promotions/api";

// Types for promotions
interface Promotion {
  id: number;
  promo_code: string;
  title: string;
  type: PromoType;
  value: number;
  start_at: string;
  end_at: string;
  status: PromoStatus;
  usage_limit: number | null;
  usage_count: number;
  custom_items: any;
  min_order_amount?: number;
  max_discount_amount?: number;
}

interface ValidationResult {
  success: boolean;
  data?: {
    original_amount: number;
    discount: number;
    final_amount: number;
    discount_breakdown?: any;
  };
  message?: string;
}

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

// Coupon Input Component
const CouponInput = ({
  couponCode,
  setCouponCode,
  onApply,
  onViewCoupons,
  applying,
  theme,
}: {
  couponCode: string;
  setCouponCode: (code: string) => void;
  onApply: () => void;
  onViewCoupons: () => void;
  applying: boolean;
  theme: any;
}) => (
  <View style={[appStyles.coupon.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={appStyles.coupon.inputRow}>
      <TextInput
        style={[appStyles.coupon.input, { color: theme.text, borderColor: theme.border }]}
        placeholder="Enter coupon code"
        placeholderTextColor={theme.text + "80"}
        value={couponCode}
        onChangeText={setCouponCode}
        autoCapitalize="characters"
        autoCorrect={false}
      />
      <Pressable
        onPress={onApply}
        disabled={applying || !couponCode.trim()}
        style={[appStyles.coupon.applyButton, { backgroundColor: theme.primary }]}
      >
        {applying ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <Text style={appStyles.coupon.applyButtonText}>Apply</Text>
        )}
      </Pressable>
    </View>
    <Pressable onPress={onViewCoupons} style={appStyles.coupon.viewCouponsLink}>
      <Text style={[appStyles.coupon.viewCouponsText, { color: theme.accent }]}>
        View Available Coupons
      </Text>
    </Pressable>
  </View>
);

// Applied Coupon Display
const AppliedCoupon = ({
  couponCode,
  discount,
  onRemove,
  theme,
}: {
  couponCode: string;
  discount: number;
  onRemove: () => void;
  theme: any;
}) => (
  <View style={[appStyles.coupon.appliedContainer, { backgroundColor: theme.success + "20", borderColor: theme.success }]}>
    <View style={appStyles.coupon.appliedInfo}>
      <Text style={[appStyles.coupon.appliedCode, { color: theme.success }]}>
        ✓ {couponCode} applied
      </Text>
      <Text style={[appStyles.coupon.appliedDiscount, { color: theme.success }]}>
        -₹{discount.toFixed(2)}
      </Text>
    </View>
    <Pressable onPress={onRemove} style={appStyles.coupon.removeButton}>
      <Text style={[appStyles.coupon.removeText, { color: theme.error }]}>Remove</Text>
    </Pressable>
  </View>
);

// Coupon Card Component for the modal
const CouponCard = ({
  promotion,
  isApplicable,
  onApply,
  theme,
}: {
  promotion: Promotion;
  isApplicable: boolean;
  onApply: () => void;
  theme: any;
}) => {
  const [blur, setBlur] = useState(!isApplicable);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const getDiscountText = () => {
    if (promotion.type === "PERCENTAGE") {
      return `${promotion.value}% OFF`;
    } else if (promotion.type === "FIXED") {
      return `₹${promotion.value} OFF`;
    } else {
      return "Special Offer";
    }
  };

  return (
    <Pressable
      onPress={() => {
        if (isApplicable) {
          onApply();
        } else {
          setBlur(!blur);
        }
      }}
      style={[
        appStyles.coupon.card,
        { backgroundColor: theme.card, borderColor: isApplicable ? theme.success : theme.border },
        !isApplicable && blur && appStyles.coupon.cardBlurred,
      ]}
    >
      <View style={appStyles.coupon.cardContent}>
        <View style={appStyles.coupon.cardLeft}>
          <Text style={[appStyles.coupon.cardCode, { color: theme.text }]}>
            {blur ? "••••••" : promotion.promo_code}
          </Text>
          <Text style={[appStyles.coupon.cardTitle, { color: theme.text }]}>
            {blur ? "Locked" : promotion.title}
          </Text>
          {!blur && (
            <>
              <Text style={[appStyles.coupon.cardDiscount, { color: theme.success }]}>
                {getDiscountText()}
              </Text>
              <Text style={[appStyles.coupon.cardExpiry, { color: theme.text + "80" }]}>
                Valid until {formatDate(promotion.end_at)}
              </Text>
              {promotion.min_order_amount && (
                <Text style={[appStyles.coupon.cardMinOrder, { color: theme.text + "60" }]}>
                  Min. order: ₹{promotion.min_order_amount}
                </Text>
              )}
            </>
          )}
        </View>
        <View style={appStyles.coupon.cardRight}>
          {isApplicable ? (
            <View style={[appStyles.coupon.applicableBadge, { backgroundColor: theme.success }]}>
              <Text style={appStyles.coupon.applicableBadgeText}>Use</Text>
            </View>
          ) : (
            <View style={[appStyles.coupon.lockedBadge, { backgroundColor: theme.text + "30" }]}>
              <Text style={[appStyles.coupon.lockedBadgeText, { color: theme.text }]}>
                {blur ? "🔒" : "Can't use"}
              </Text>
            </View>
          )}
        </View>
      </View>
      {!isApplicable && (
        <Text style={[appStyles.coupon.unavailableReason, { color: theme.text + "60" }]}>
          {blur ? "Tap to reveal" : "Not applicable to items in your cart"}
        </Text>
      )}
    </Pressable>
  );
};

// Coupons Modal
const CouponsModal = ({
  visible,
  onClose,
  promotions,
  cartItems,
  total,
  onApplyCoupon,
  loading,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  promotions: Promotion[];
  cartItems: { id: string; name: string; price: number; quantity: number }[];
  total: number;
  onApplyCoupon: (code: string) => void;
  loading: boolean;
  theme: any;
}) => {
  // Check if a promotion is applicable to the cart
  const checkApplicability = (promotion: Promotion): boolean => {
    // For PERCENTAGE and FIXED types, they're generally applicable if they meet min order
    if (promotion.type === "PERCENTAGE" || promotion.type === "FIXED") {
      return (!promotion.min_order_amount || total >= promotion.min_order_amount);
    }
    
    // For CUSTOM_ITEMS, check if any cart item matches custom_items
    if (promotion.type === "CUSTOM_ITEMS" && promotion.custom_items) {
      const customItems = promotion.custom_items;
      const cartItemIds = cartItems.map(item => item.id);
      
      // Check if any custom item is in the cart
      return customItems.some((custom: any) => 
        cartItemIds.includes(String(custom.item_id))
      );
    }
    
    return false;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={appStyles.coupon.modalOverlay}>
        <View style={[appStyles.coupon.modalContent, { backgroundColor: theme.background }]}>
          <View style={appStyles.coupon.modalHeader}>
            <Text style={[appStyles.coupon.modalTitle, { color: theme.text }]}>
              Available Coupons
            </Text>
            <Pressable onPress={onClose} style={appStyles.coupon.closeButton}>
              <Text style={[appStyles.coupon.closeButtonText, { color: theme.text }]}>✕</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={appStyles.coupon.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : promotions.length === 0 ? (
            <View style={appStyles.coupon.emptyContainer}>
              <Text style={[appStyles.coupon.emptyText, { color: theme.text }]}>
                No coupons available
              </Text>
            </View>
          ) : (
            <ScrollView style={appStyles.coupon.couponsList}>
              {promotions.map((promotion) => (
                <CouponCard
                  key={promotion.id}
                  promotion={promotion}
                  isApplicable={checkApplicability(promotion)}
                  onApply={() => {
                    onApplyCoupon(promotion.promo_code);
                    onClose();
                  }}
                  theme={theme}
                />
              ))}
            </ScrollView>
          )}

          <View style={appStyles.coupon.modalFooter}>
            <Text style={[appStyles.coupon.footerNote, { color: theme.text + "80" }]}>
              Tap on a coupon to apply it. Blurred coupons can't be used with items in your cart.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Bill Modal Component - Full page bill design
const BillModal = ({
  visible,
  onClose,
  items,
  subtotal,
  tax,
  total,
  discount,
  appliedCoupon,
  theme,
  onCheckout,
  couponCode,
  setCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
  onViewCoupons,
  couponError,
  applyingCoupon,
}: {
  visible: boolean;
  onClose: () => void;
  items: { id: string; name: string; price: number; quantity: number }[];
  subtotal: number;
  tax: number;
  total: number;
  discount: number;
  appliedCoupon: string | null;
  theme: any;
  onCheckout: () => void;
  couponCode?: string;
  setCouponCode?: (code: string) => void;
  onApplyCoupon?: () => void;
  onRemoveCoupon?: () => void;
  onViewCoupons?: () => void;
  couponError?: string;
  applyingCoupon?: boolean;
}) => {
  if (!visible) return null;
  
  return (
    <View style={[appStyles.bill.fullPage, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={appStyles.bill.fullPageHeader}>
        <Pressable onPress={onClose} style={appStyles.bill.backButton}>
          <Text style={[appStyles.bill.backButtonText, { color: theme.primary }]}>← Back</Text>
        </Pressable>
        <View style={{ width: 60 }} />
      </View>

      {/* Cart Items */}
      <ScrollView style={appStyles.bill.fullPageItems}>
        {items.map((item) => (
          <View key={item.id} style={[appStyles.bill.fullPageItemRow, { borderBottomColor: theme.border }]}>
            <View style={appStyles.bill.itemInfo}>
              <Text style={[appStyles.bill.itemName, { color: theme.text }]}>{item.name}</Text>
              <Text style={[appStyles.bill.itemQuantity, { color: theme.muted }]}>
                {item.quantity} × ₹{item.price}
              </Text>
            </View>
            <Text style={[appStyles.bill.itemTotal, { color: theme.text }]}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Coupon Section */}
      {appliedCoupon ? (
        <View style={[appStyles.bill.couponAppliedContainer, { borderColor: theme.success, backgroundColor: theme.card[0] }]}>
          <View style={appStyles.bill.couponAppliedInfo}>
            <Text style={[appStyles.bill.couponAppliedCode, { color: theme.success }]}>
              ✓ {appliedCoupon} applied
            </Text>
            <Text style={[appStyles.bill.couponAppliedDiscount, { color: theme.success }]}>
              -₹{discount.toFixed(2)}
            </Text>
          </View>
          {onRemoveCoupon && (
            <Pressable onPress={onRemoveCoupon} style={appStyles.bill.couponRemoveButton}>
              <Text style={[appStyles.bill.couponRemoveText, { color: theme.error }]}>Remove</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={[appStyles.bill.couponSection, { backgroundColor: theme.card[0] }]}>
          <View style={appStyles.bill.couponInputRow}>
            <TextInput
              style={[appStyles.bill.couponInput, { borderColor: theme.primary, backgroundColor: theme.background, color: theme.text }]}
              placeholder="Enter coupon code"
              placeholderTextColor={theme.muted}
              value={couponCode}
              onChangeText={setCouponCode}
              autoCapitalize="characters"
            />
            <Pressable
              onPress={onApplyCoupon}
              disabled={applyingCoupon || !couponCode?.trim()}
              style={[appStyles.bill.couponApplyButton, { backgroundColor: theme.primary }]}
            >
              <Text style={appStyles.bill.couponApplyButtonText}>
                {applyingCoupon ? '...' : 'Apply'}
              </Text>
            </Pressable>
          </View>
          {couponError && (
            <Text style={[appStyles.bill.couponErrorText, { color: theme.error }]}>
              {couponError}
            </Text>
          )}
          {onViewCoupons && (
            <Pressable onPress={onViewCoupons} style={appStyles.bill.viewCouponsLink}>
              <Text style={[appStyles.bill.viewCouponsText, { color: theme.primary }]}>
                View Available Coupons
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Bill Summary */}
      <View style={[appStyles.bill.fullPageSummary, { backgroundColor: theme.card[0] }]}>
        <View style={appStyles.bill.summaryRow}>
          <Text style={[appStyles.bill.summaryLabel, { color: theme.text }]}>Subtotal</Text>
          <Text style={[appStyles.bill.summaryValue, { color: theme.text }]}>₹{subtotal.toFixed(2)}</Text>
        </View>
        
        {discount > 0 && (
          <View style={appStyles.bill.summaryRow}>
            <Text style={[appStyles.bill.summaryLabel, { color: '#22c55e' }]}>Discount ({appliedCoupon})</Text>
            <Text style={[appStyles.bill.summaryValue, { color: '#22c55e' }]}>-₹{discount.toFixed(2)}</Text>
          </View>
        )}
        
        <View style={appStyles.bill.summaryRow}>
          <Text style={[appStyles.bill.summaryLabel, { color: theme.text }]}>Tax (5%)</Text>
          <Text style={[appStyles.bill.summaryValue, { color: theme.text }]}>₹{tax.toFixed(2)}</Text>
        </View>
        
        <View style={[appStyles.bill.totalRow, { borderTopColor: theme.border }]}>
          <Text style={[appStyles.bill.totalLabel, { color: theme.text }]}>TOTAL</Text>
          <Text style={[appStyles.bill.totalValue, { color: theme.primary }]}>₹{total.toFixed(2)}</Text>
        </View>
      </View>

      {/* Checkout Button */}
      <View style={appStyles.bill.checkoutButtonContainer}>
        <Pressable
          onPress={onCheckout}
          style={[appStyles.bill.checkoutButton, { backgroundColor: theme.primary }]}
        >
          <Text style={appStyles.bill.checkoutButtonText}>Place Order</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default function CartPage() {
  const { safePush } = useSafeNavigation(300);
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;
  const [showBill, setShowBill] = useState(false);
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCouponsModal, setShowCouponsModal] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(false);

  const theme = useMemo(() => getTheme(flavor, resolvedMode), [flavor, resolvedMode]);

  const total = useMemo(() =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  // Calculate tax (5%) and grand total with discount
  const tax = useMemo(() => total * 0.05, [total]);
  const grandTotal = useMemo(() => Math.max(total + tax - discount, 0), [total, tax, discount]);

  // Fetch available promotions
  const fetchPromotions = useCallback(async () => {
    setLoadingPromotions(true);
    try {
      const response = await promotionApi.getAll();
      if (response.data.success) {
        // Filter active promotions only
        const activePromotions = response.data.data.filter(
          (p: Promotion) => p.status === "ACTIVE"
        );
        setPromotions(activePromotions);
      }
    } catch (error) {
      console.error("Error fetching promotions:", error);
    } finally {
      setLoadingPromotions(false);
    }
  }, []);

  // Load promotions when modal opens
  useEffect(() => {
    if (showCouponsModal) {
      fetchPromotions();
    }
  }, [showCouponsModal, fetchPromotions]);

  // Validate and apply coupon
  const handleApplyCoupon = useCallback(async (code?: string) => {
    const promoCode = code || couponCode.trim().toUpperCase();
    if (!promoCode) return;

    setApplyingCoupon(true);
    setCouponError(null);

    try {
      // Prepare ordered items for validation
      const orderedItems = items.map(item => ({
        item_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const response = await promotionApi.validate(promoCode, total, orderedItems);
      
      if (response.data.success) {
        const validationData = response.data.data;
        setAppliedCoupon(promoCode);
        setDiscount(validationData.discount);
        setCouponCode("");
        Loggers.cart.info(`Coupon ${promoCode} applied successfully. Discount: ₹${validationData.discount}`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Invalid coupon code";
      setCouponError(errorMessage);
      setAppliedCoupon(null);
      setDiscount(0);
      Loggers.cart.info(`Coupon ${promoCode} failed: ${errorMessage}`);
    } finally {
      setApplyingCoupon(false);
    }
  }, [couponCode, items, total]);

  // Remove applied coupon
  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError(null);
    Loggers.cart.info("Coupon removed");
  }, []);

  // Apply coupon from modal
  const handleApplyCouponFromModal = useCallback((code: string) => {
    setCouponCode(code);
    handleApplyCoupon(code);
  }, [handleApplyCoupon]);

  // Memoized handlers
  const handleAddItem = useCallback((item: typeof items[0]) => {
    dispatch(addItem(item));
  }, [dispatch]);

  const handleRemoveItem = useCallback((itemId: string) => {
    dispatch(removeItem(itemId));
  }, [dispatch]);

  const handleClearCart = useCallback(() => {
    dispatch(clearCart());
    // Reset coupon state when clearing cart
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode("");
    setCouponError(null);
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
    // Navigate to order success
    dispatch(clearCart());
    router.replace('/order-success');
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
      {showBill ? (
        <BillModal
          visible={true}
          onClose={handleCloseBill}
          items={items}
          subtotal={total}
          tax={tax}
          total={grandTotal}
          discount={discount}
          appliedCoupon={appliedCoupon}
          theme={theme}
          onCheckout={handleCheckout}
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          onApplyCoupon={() => handleApplyCoupon()}
          onRemoveCoupon={handleRemoveCoupon}
          onViewCoupons={() => setShowCouponsModal(true)}
          couponError={couponError || undefined}
          applyingCoupon={applyingCoupon}
        />
      ) : (
        <>
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
              <Text style={appStyles.cart.totalAmount}>
                ₹{total.toFixed(2)}
              </Text>
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
                <Text style={appStyles.cart.checkoutText}>Bill Now</Text>
              </Pressable>
            </View>
          </LinearGradient>
        </>
      )}

      {/* Coupons Modal */}
      <CouponsModal
        visible={showCouponsModal}
        onClose={() => setShowCouponsModal(false)}
        promotions={promotions}
        cartItems={items}
        total={total}
        onApplyCoupon={handleApplyCouponFromModal}
        loading={loadingPromotions}
        theme={theme}
      />

      {/* Small Alert - Buy for more X to unlock discount */}
      {total > 0 && total < 100 && (
        <SmallUnlockAlert total={total} />
      )}
    </View>
  );
}

// Small Unlock Alert Component
function SmallUnlockAlert({ total }: { total: number }) {
  const [visible, setVisible] = useState(true);

  const amountNeeded = 100 - total;

  if (!visible || total >= 100) return null;

  return (
    <View style={smallAlertStyles.container}>
      <View style={smallAlertStyles.content}>
        <Text style={smallAlertStyles.icon}>🎁</Text>
        <View style={smallAlertStyles.textContainer}>
          <Text style={smallAlertStyles.title}>Unlock Discount!</Text>
          <Text style={smallAlertStyles.message}>
            Buy for <Text style={smallAlertStyles.highlight}>₹{amountNeeded}</Text> more to get 10% OFF
          </Text>
        </View>
        <Pressable onPress={() => setVisible(false)} style={smallAlertStyles.closeBtn}>
          <Text style={smallAlertStyles.closeText}>✕</Text>
        </Pressable>
      </View>
      <View style={smallAlertStyles.progressContainer}>
        <View style={[smallAlertStyles.progressBar, { width: `${(total / 100) * 100}%` }]} />
      </View>
    </View>
  );
}

const smallAlertStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  message: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 11,
    marginTop: 1,
  },
  highlight: {
    color: '#FFD700',
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
});
