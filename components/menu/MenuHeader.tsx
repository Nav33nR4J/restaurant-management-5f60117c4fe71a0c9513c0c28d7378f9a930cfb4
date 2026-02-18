import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { isBranch, isHQ } from "../../config/accessControl";
import { SeasonalMenu } from "../../config/config";
import { withOpacity } from "../../utils/colorUtils";
import { IconButton } from "../ui";

interface MenuHeaderProps {
  currentSeasonalMenu: SeasonalMenu | null;
  user: { firstName?: string; lastName?: string; address?: string } | null;
  isLoggedIn: boolean;
  theme: {
    text: string;
    muted: string;
    primary: string;
  };
  resolvedMode: "light" | "dark";
  onToggleTheme?: () => void;
  onAddMenuItem?: () => void;
}

/**
 * Menu header component with user info and actions
 */
export function MenuHeader({
  currentSeasonalMenu,
  user,
  isLoggedIn,
  theme,
  resolvedMode,
  onToggleTheme,
  onAddMenuItem,
}: MenuHeaderProps) {
  const isHQUser = useMemo(() => isHQ(), []);
  const isBranchUser = useMemo(() => isBranch(), []);

  const handlePromotionsPress = () => {
    try {
      // Navigate to the promotions screen
      router.push("/promotions");
    } catch (error) {
      console.log("Could not navigate to promotions:", error);
    }
  };

  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {currentSeasonalMenu ? currentSeasonalMenu.name : "Our Menu"}
          </Text>
          {user?.address && (
            <Text style={[styles.locationText, { color: withOpacity(theme.text, 0.5) }]}>
              📍 {user.address}
            </Text>
          )}
          <Text style={[styles.headerSubtitle, { color: withOpacity(theme.text, 0.5) }]}>
            {isLoggedIn
              ? user?.firstName 
                ? `Hello ${user.firstName}!` 
                : `Welcome, ${isHQUser ? "HQ Admin" : isBranchUser ? "Branch Admin" : "Customer"}!`
              : "Please sign in to order"}
          </Text>
        </View>

        {/* Right side action buttons */}
        <View style={styles.actionsContainer}>
          {isHQUser && (
            <View style={[styles.hqActionsContainer, { backgroundColor: theme.primary }]}>
              <Pressable
                style={styles.hqActionButton}
                onPress={handlePromotionsPress}
              >
                <Ionicons
                  name="pricetag-outline"
                  size={22}
                  color="#FFF"
                />
              </Pressable>
              <View style={styles.separator} />
              <Pressable
                style={styles.hqActionButton}
                onPress={onAddMenuItem}
              >
                <Ionicons
                  name="add"
                  size={22}
                  color="#FFF"
                />
              </Pressable>
            </View>
          )}
          {isBranchUser && onToggleTheme && (
            <IconButton
              name={resolvedMode === "dark" ? "sunny" : "moon"}
              onPress={onToggleTheme}
              size={24}
              variant="default"
              theme={theme}
              accessibilityLabel="Toggle theme"
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingVertical: 16, marginBottom: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  headerTitle: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  headerSubtitle: { fontSize: 16 },
  locationText: { fontSize: 14, marginBottom: 4 },
  actionsContainer: { flexDirection: "row", alignItems: "center", gap: 8 },
  hqActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 25,
    overflow: "hidden",
  },
  hqActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
});

