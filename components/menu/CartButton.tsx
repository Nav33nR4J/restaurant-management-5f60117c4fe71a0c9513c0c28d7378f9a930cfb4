
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { isBranch, isHQ, isUser } from "../../config/accessControl";
import useSafeNavigation from "../../hooks/useSafeNavigation";
import { appStyles } from "../../styles";

interface CartButtonProps {
  totalItems: number;
  onPress?: () => void;
}

// Flavor-specific colors
const FLAVOR_COLORS = {
  HQ: "#7C3AED",    // Purple
  BRANCH: "#2563EB", // Blue
  USER: "#DC2626",   // Red
};

/**
 * Get the background color based on current flavor
 */
function getFlavorColor(): string {
  if (isHQ()) return FLAVOR_COLORS.HQ;
  if (isBranch()) return FLAVOR_COLORS.BRANCH;
  if (isUser()) return FLAVOR_COLORS.USER;
  return FLAVOR_COLORS.USER; // Default to user color
}

/**
 * Floating cart button component
 */
export function CartButton({ totalItems, onPress }: CartButtonProps) {
  const { safePush } = useSafeNavigation(200);
  const isHQUser = isHQ();
  const isBranchUser = isBranch();
  const flavorColor = getFlavorColor();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (isHQUser) {
      // HQ user - handled by parent via onPress prop
    } else if (isBranchUser) {
      // Branch user - handled by parent via onPress prop
    } else {
      safePush("cart");
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[appStyles.menu.cartButton, { backgroundColor: flavorColor }]}
    >
      {totalItems > 0 && !isHQUser && !isBranchUser && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{totalItems}</Text>
        </View>
      )}
      <Text style={appStyles.menu.cartText}>
        {isHQUser ? "Seasonal Menu →" : isBranchUser ? "Special Menu →" : "View Cart →"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
});

