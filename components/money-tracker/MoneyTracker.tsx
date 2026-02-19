import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppSelector } from "../../store/hooks";

// Unlockable discount tiers - can be customized
interface DiscountTier {
  id: string;
  threshold: number; // Amount needed to spend to unlock
  discount: number; // Discount value
  discountType: "PERCENTAGE" | "FIXED";
  title: string;
  icon: string;
}

const DEFAULT_DISCOUNT_TIERS: DiscountTier[] = [
  { id: "tier1", threshold: 100, discount: 10, discountType: "PERCENTAGE", title: "10% OFF", icon: "🎫" },
  { id: "tier2", threshold: 200, discount: 50, discountType: "FIXED", title: "₹50 OFF", icon: "💵" },
  { id: "tier3", threshold: 500, discount: 15, discountType: "PERCENTAGE", title: "15% OFF", icon: "🏷️" },
  { id: "tier4", threshold: 1000, discount: 200, discountType: "FIXED", title: "₹200 OFF", icon: "🎁" },
];

interface MoneyTrackerProps {
  theme: {
    card: string | string[];
    text: string;
    accent: string;
    primary: string;
    background: string;
    border?: string;
  };
  initialBalance?: number;
  discountTiers?: DiscountTier[];
}

export function MoneyTracker({ 
  theme, 
  initialBalance = 0, 
  discountTiers = DEFAULT_DISCOUNT_TIERS 
}: MoneyTrackerProps) {
  // Calculate total spent from cart
  const cartItems = useAppSelector((state) => state.cart.items);
  const totalSpent = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Track user's total spending (in a real app, this would come from backend)
  const [lifetimeSpent, setLifetimeSpent] = useState(initialBalance);
  
  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertTier, setAlertTier] = useState<DiscountTier | null>(null);
  const [alertDismissed, setAlertDismissed] = useState(false);
  
  // Animations
  const [slideAnim] = useState(new Animated.Value(100));
  const [fadeAnim] = useState(new Animated.Value(0));

  // Get card background color
  const cardBgColor = Array.isArray(theme.card) ? theme.card[0] : theme.card;
  const borderColor = theme.border || "rgba(0,0,0,0.1)";

  // Calculate progress towards next unlock
  const getNextUnlockable = (): { tier: DiscountTier; amountNeeded: number } | null => {
    for (const tier of discountTiers) {
      if (totalSpent + lifetimeSpent < tier.threshold) {
        return {
          tier,
          amountNeeded: tier.threshold - (totalSpent + lifetimeSpent)
        };
      }
    }
    return null;
  };

  const nextUnlock = getNextUnlockable();

  // Show alert when close to unlocking
  useEffect(() => {
    if (nextUnlock && !alertDismissed && totalSpent > 0) {
      const progress = (totalSpent + lifetimeSpent) / nextUnlock.tier.threshold;
      // Show alert when user has spent 70% or more towards the next tier
      if (progress >= 0.7) {
        setAlertTier(nextUnlock.tier);
        setShowAlert(true);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [totalSpent, nextUnlock]);

  const dismissAlert = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowAlert(false);
      setAlertDismissed(true);
    });
  };

  const getUnlockedTiers = (): DiscountTier[] => {
    const currentTotal = totalSpent + lifetimeSpent;
    return discountTiers.filter(tier => currentTotal >= tier.threshold);
  };

  // Small Alert Component - "Buy for more X to unlock"
  if (showAlert && alertTier) {
    return (
      <Animated.View
        style={[
          styles.alertContainer,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.alertContent}>
          <View style={styles.alertIconContainer}>
            <Text style={styles.alertIcon}>🔓</Text>
          </View>
          <View style={styles.alertTextContainer}>
            <Text style={styles.alertTitle}>Almost There!</Text>
            <Text style={styles.alertMessage}>
              Buy for <Text style={styles.alertHighlight}>₹{nextUnlock?.amountNeeded}</Text> more to unlock {alertTier.title}
            </Text>
          </View>
          <Pressable onPress={dismissAlert} style={styles.alertCloseButton}>
            <Ionicons name="close-circle" size={24} color="#FFF" />
          </Pressable>
        </View>
        {/* Progress bar */}
        <View style={styles.alertProgressContainer}>
          <View 
            style={[
              styles.alertProgressBar, 
              { width: `${((totalSpent + lifetimeSpent) / alertTier.threshold) * 100}%` }
            ]} 
          />
        </View>
      </Animated.View>
    );
  }

  // Main Money Tracker UI
  return (
    <View style={[styles.container, { backgroundColor: cardBgColor }]}>
      {/* Balance/Wallet Section */}
      <View style={styles.balanceSection}>
        <View style={styles.balanceHeader}>
          <Ionicons name="wallet" size={20} color={theme.accent} />
          <Text style={[styles.balanceLabel, { color: theme.text }]}>Your Balance</Text>
        </View>
        <Text style={[styles.balanceAmount, { color: theme.primary }]}>
          ₹{lifetimeSpent.toFixed(2)}
        </Text>
        {totalSpent > 0 && (
          <Text style={[styles.currentSpent, { color: theme.accent }]}>
            + ₹{totalSpent} in cart
          </Text>
        )}
      </View>

      {/* Unlockable Discounts */}
      <View style={styles.discountsSection}>
        <Text style={[styles.discountsTitle, { color: theme.text }]}>
          🎉 Unlock Discounts
        </Text>
        
        <View style={styles.tiersContainer}>
          {discountTiers.map((tier) => {
            const currentTotal = totalSpent + lifetimeSpent;
            const isUnlocked = currentTotal >= tier.threshold;
            const progress = Math.min(currentTotal / tier.threshold, 1);
            
            return (
              <View 
                key={tier.id} 
                style={[
                  styles.tierCard,
                  { 
                    backgroundColor: isUnlocked ? theme.primary + "20" : theme.background,
                    borderColor: isUnlocked ? theme.primary : borderColor,
                  }
                ]}
              >
                <View style={styles.tierHeader}>
                  <Text style={styles.tierIcon}>{tier.icon}</Text>
                  <Text style={[
                    styles.tierTitle, 
                    { color: isUnlocked ? theme.primary : theme.text }
                  ]}>
                    {tier.title}
                  </Text>
                  {isUnlocked && (
                    <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                  )}
                </View>
                
                <Text style={[styles.tierThreshold, { color: theme.text }]}>
                  Spend ₹{tier.threshold}
                </Text>
                
                {/* Progress bar */}
                <View style={[styles.progressBar, { backgroundColor: borderColor }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: isUnlocked ? theme.primary : theme.accent,
                        width: `${progress * 100}%` 
                      }
                    ]} 
                  />
                </View>
                
                {!isUnlocked && (
                  <Text style={[styles.tierLocked, { color: theme.accent }]}>
                    🔒 Locked
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Show "Add more" hint if cart is empty */}
      {totalSpent === 0 && (
        <View style={styles.hintContainer}>
          <Ionicons name="arrow-up-circle" size={20} color={theme.accent} />
          <Text style={[styles.hintText, { color: theme.accent }]}>
            Add items to start unlocking discounts!
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  balanceSection: {
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(128,128,128,0.2)",
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  balanceLabel: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: "600",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "800",
  },
  currentSpent: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  discountsSection: {
    marginTop: 8,
  },
  discountsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  tiersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tierCard: {
    width: "48%",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  tierHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  tierIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  tierTitle: {
    fontSize: 14,
    fontWeight: "700",
    flex: 1,
  },
  tierThreshold: {
    fontSize: 11,
    marginBottom: 6,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  tierLocked: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "600",
  },
  hintContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
  },
  hintText: {
    fontSize: 13,
    marginLeft: 6,
    fontWeight: "500",
  },
  
  // Alert Styles
  alertContainer: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  alertContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertIcon: {
    fontSize: 20,
  },
  alertTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  alertTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
  alertMessage: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 2,
  },
  alertHighlight: {
    color: "#FFD700",
    fontWeight: "800",
  },
  alertCloseButton: {
    padding: 4,
  },
  alertProgressContainer: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  alertProgressBar: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 2,
  },
});

export default MoneyTracker;
