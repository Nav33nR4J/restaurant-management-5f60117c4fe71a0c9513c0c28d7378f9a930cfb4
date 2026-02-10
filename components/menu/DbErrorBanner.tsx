
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface DbErrorBannerProps {
  dbError: string | null;
}

/**
 * Database error banner component
 */
export function DbErrorBanner({ dbError }: DbErrorBannerProps) {
  if (!dbError) return null;

  return (
    <View style={[styles.dbErrorBanner, { backgroundColor: "#FEF3C7" }]}>
      <Ionicons name="warning" size={20} color="#D97706" />
      <Text style={[styles.dbErrorText, { color: "#92400E" }]}>{dbError}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dbErrorBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  dbErrorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
});

