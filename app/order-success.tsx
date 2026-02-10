import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  Text,
  useColorScheme,
  View,
} from "react-native";

import { ActionButton } from "../components/ui/ActionButton";
import { useSafeNavigation } from "../hooks/useSafeNavigation";
import { clearCart } from "../store/cartSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { appStyles } from "../styles";
import { getTheme } from "../theme";
import { Loggers } from "../utils/logger";

const funnyMessages = [
  "🍕 Your pizza is feeling nervous... in a good way!",
  "🍔 The chef just got a little more handsome. Blame your order!",
  "🌮 Taco 'bout a great choice! Your food is on the way!",
  "🍣 Wasabi you waiting for? It's coming!",
  "🥗 Healthy eating wins! Your greens are being chopped!",
  "🍜 Noodle-itate on how amazing this meal will be!",
  "🍩 You'll thank yourself later. We promise!",
  "🍳 You're egg-cellent! Your order is being cooked!",
  "🥐 This is un-brie-lievable! Your croissants are warming up!",
  "🍖 Meat you halfway there! Grilling your order now!",
];

function getRandomMessage(): string {
  return funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
}

interface SuccessViewProps {
  theme: ReturnType<typeof getTheme>;
}

// Memoized SuccessView to prevent unnecessary re-renders
const SuccessView = memo(function SuccessView({ theme }: SuccessViewProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const [message] = React.useState(getRandomMessage());

  // Use accent color as success color, with a darker variant for gradients
  const successColor = theme.accent;
  const successColorDark = theme.primary;

  // Generate confetti colors from theme
  const confettiColors = [
    theme.primary,
    theme.accent,
    successColor,
    theme.text,
    theme.muted,
  ];

  useEffect(() => {
    // Pop-in animation for success icon
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();

    // Fade in for main content
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Delayed message animation
    const messageTimer = setTimeout(() => {
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 800);

    // Cleanup timer on unmount
    return () => {
      clearTimeout(messageTimer);
      // Stop any ongoing animations
      scaleAnim.stopAnimation();
      opacityAnim.stopAnimation();
      messageOpacity.stopAnimation();
    };
  }, []);

  return (
    <View style={appStyles.orderSuccess.successContainer}>
      {/* Animated success icon */}
      <Animated.View
        style={[
          appStyles.orderSuccess.iconWrapper,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={[successColor, successColorDark]}
          style={appStyles.orderSuccess.successIcon}
        >
          <Ionicons name="checkmark" size={60} color="#FFF" />
        </LinearGradient>
      </Animated.View>

      {/* Main text */}
      <Animated.View style={{ opacity: opacityAnim }}>
        <Text style={[appStyles.orderSuccess.successTitle, { color: successColor }]}>
          Order Placed Successfully!
        </Text>
        <Text style={[appStyles.orderSuccess.successSubtitle, { color: theme.text }]}>
          🎉 Your delicious meal is being prepared with love!
        </Text>
      </Animated.View>

      {/* Funny message */}
      <Animated.View
        style={[
          appStyles.orderSuccess.messageContainer,
          {
            opacity: messageOpacity,
            backgroundColor: theme.muted,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[appStyles.orderSuccess.funnyMessage, { color: theme.text }]}>
          {message}
        </Text>
      </Animated.View>

      {/* Confetti effect */}
      <View style={appStyles.orderSuccess.confettiContainer}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View
            key={i}
            style={[
              appStyles.orderSuccess.confetti,
              {
                left: `${5 + i * 9}%`,
                backgroundColor: confettiColors[i % confettiColors.length],
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
});

function OrderSuccessPage() {
  const { safePush } = useSafeNavigation(200);
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = getTheme(flavor, resolvedMode);

  const handleOrderAgain = () => {
    try {
      dispatch(clearCart());
      Loggers.cart.info("Cart cleared, navigating to menu");
      safePush("menu");
    } catch (error) {
      Loggers.cart.error("Failed to order again", error);
    }
  };

  return (
    <View style={[appStyles.orderSuccess.container, { backgroundColor: theme.background }]}>
      <SuccessView theme={theme} />

      {/* Order Again Button */}
      <View style={appStyles.orderSuccess.buttonContainer}>
        <LinearGradient
          colors={[theme.primary, theme.accent]}
          style={appStyles.orderSuccess.orderButton}
        >
          <Pressable
            onPress={handleOrderAgain}
            style={appStyles.orderSuccess.pressable}
          >
            <Ionicons name="restaurant" size={22} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={appStyles.orderSuccess.orderButtonText}>Order More Food</Text>
          </Pressable>
        </LinearGradient>

        <ActionButton
          title="Go to Home"
          onPress={() => {
            dispatch(clearCart());
            router.replace("/");
          }}
          variant="muted"
          theme={theme}
        />
      </View>
    </View>
  );
}

export default memo(OrderSuccessPage);

