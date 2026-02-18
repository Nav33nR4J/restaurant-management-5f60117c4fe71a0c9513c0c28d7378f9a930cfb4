import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { isUser } from "../../config/accessControl";
import { PromoStatus, promotionApi, PromoType } from "../../utils/promotions/api";

// Promotion type from API
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

interface BestOfferAlertProps {
  theme: {
    card: string[];
    text: string;
    accent: string;
    primary: string;
  };
}

export function BestOfferAlert({ theme }: BestOfferAlertProps) {
  const [bestOffer, setBestOffer] = useState<Promotion | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Animations
  const [slideAnim] = useState(new Animated.Value(0));
  const [fadeAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [miniPulseAnim] = useState(new Animated.Value(1));

  // Check if user flavor
  const showForUser = isUser();

  // Pulse animation for the mini button
  useEffect(() => {
    if (isMinimized) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(miniPulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(miniPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isMinimized]);

  useEffect(() => {
    if (!showForUser) return;

    // Fetch promotions and find best offer
    const fetchBestOffer = async () => {
      try {
        const response = await promotionApi.getAll();
        if (response.data?.success && response.data.data) {
          const promotions: Promotion[] = response.data.data;
          
          // Filter active promotions and find the best one
          const activePromos = promotions.filter(
            (p) => p.status === "ACTIVE" && new Date(p.end_at) > new Date()
          );

          if (activePromos.length === 0) return;

          // Find best offer - prioritize percentage then fixed
          let best: Promotion = activePromos[0];
          for (const promo of activePromos) {
            if (promo.type === "PERCENTAGE" && best.type !== "PERCENTAGE") {
              best = promo;
            } else if (
              promo.type === "PERCENTAGE" &&
              best.type === "PERCENTAGE" &&
              promo.value > best.value
            ) {
              best = promo;
            } else if (
              promo.type === "FIXED" &&
              best.type === "FIXED" &&
              promo.value > best.value
            ) {
              best = promo;
            }
          }

          setBestOffer(best);
          setHasInitialized(true);
        }
      } catch (error) {
        // Silently fail - don't show alert if API fails
        console.log("Could not fetch promotions:", error);
      }
    };

    fetchBestOffer();
  }, [showForUser]);

  const handleMinimize = () => {
    // Animate to minimized circle
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.2,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMinimized(true);
    });
  };

  const handleExpand = () => {
    setIsMinimized(false);
    // Animate to full size
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Don't render if not user or no offer
  if (!showForUser || !hasInitialized || !bestOffer) {
    return null;
  }

  // Format the discount text
  const discountText =
    bestOffer.type === "PERCENTAGE"
      ? `${bestOffer.value}%`
      : bestOffer.type === "FIXED"
      ? `₹${bestOffer.value}`
      : "DEAL";

  // Get fun tagline based on discount
  const getTagline = () => {
    if (bestOffer.type === "PERCENTAGE" && bestOffer.value >= 30) {
      return "🔥 HOT DEAL!";
    } else if (bestOffer.type === "PERCENTAGE" && bestOffer.value >= 20) {
      return "⚡ SUPER SAVER!";
    } else if (bestOffer.type === "FIXED" && bestOffer.value >= 200) {
      return "💰 BIG BUCKS!";
    }
    return "✨ GRAB IT!";
  };

  // If minimized, show only the small circle button
  if (isMinimized) {
    return (
      <Animated.View
        style={[
          styles.miniContainer,
          {
            transform: [{ scale: miniPulseAnim }],
          },
        ]}
      >
        <Pressable
          style={styles.miniButton}
          onPress={handleExpand}
          hitSlop={10}
        >
          <Ionicons name="gift" size={28} color="#FFF" />
          <View style={styles.miniSparkles}>
            <Text style={styles.miniSparkle}>🎁</Text>
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  // Full alert view
  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.offerCard}>
        {/* Fun sparkles decoration */}
        <View style={styles.sparkles}>
          <Text style={styles.sparkle}>🎁</Text>
          <Text style={styles.sparkle}>🎀</Text>
          <Text style={styles.sparkle}>🎉</Text>
        </View>

        {/* Discount badge */}
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{bestOffer.type === "PERCENTAGE" ? `${bestOffer.value}% OFF` : bestOffer.type === "FIXED" ? `₹${bestOffer.value} OFF` : "SPECIAL DEAL"}</Text>
        </View>

        {/* Offer title */}
        <Text style={styles.offerTitle} numberOfLines={1}>
          {bestOffer.title}
        </Text>

        {/* Promo code */}
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Use Code:</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{bestOffer.promo_code}</Text>
          </View>
        </View>

        {/* Fun tagline */}
        <Text style={styles.tagline}>{getTagline()}</Text>

        {/* Minimize button (instead of close) */}
        <Pressable
          style={styles.minimizeButton}
          onPress={handleMinimize}
          hitSlop={10}
        >
          <Ionicons name="chevron-down-circle" size={26} color="#FFF" />
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  miniContainer: {
    position: "absolute",
    bottom: 90,
    right: 20,
    zIndex: 1001,
  },
  miniButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#E91E63",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFC107",
  },
  miniText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center",
  },
  miniSparkles: {
    position: "absolute",
    top: -8,
    right: -8,
  },
  miniSparkle: {
    fontSize: 16,
  },
  offerCard: {
    backgroundColor: "#E91E63",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    shadowColor: "#E91E63",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
  },
  sparkles: {
    position: "absolute",
    top: 8,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  sparkle: {
    fontSize: 20,
  },
  discountBadge: {
    backgroundColor: "#FFD23F",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    marginBottom: 8,
    transform: [{ rotate: "-2deg" }],
  },
  discountText: {
    color: "#1A1A2E",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  offerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  codeLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    fontWeight: "600",
    marginRight: 8,
  },
  codeBox: {
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  codeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  tagline: {
    color: "#FFD23F",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
  },
  minimizeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
});

export default BestOfferAlert;
