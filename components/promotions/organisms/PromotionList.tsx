import React, { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../../theme/promotions/ThemeProvider";
import { api, getErrorMessage } from "../../../utils/promotions/api";
import { PromotionCard } from "../molecules/PromotionCard";

interface Promotion {
  id: string;
  promo_code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  current_uses?: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  description?: string;
}

interface PromotionListProps {
  onEditPromotion: (promotion: Promotion) => void;
}

export const PromotionList: React.FC<PromotionListProps> = ({ onEditPromotion }) => {
  const { theme } = useTheme();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPromotions = useCallback(async () => {
    try {
      const response = await api.get("/promotions");
      setPromotions(response.data);
    } catch (error) {
      console.error("Error fetching promotions:", error);
      const message = getErrorMessage(error);
      Alert.alert("Error Fetching Promotions", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPromotions();
  }, [fetchPromotions]);

  const handleToggleStatus = async (promotion: Promotion) => {
    try {
      await api.put(`/promotions/${promotion.id}`, {
        is_active: !promotion.is_active,
      });
      fetchPromotions();
    } catch (error) {
      console.error("Error toggling promotion status:", error);
      Alert.alert("Error", "Failed to update promotion status");
    }
  };

  const renderItem = useCallback(
    ({ item }: { item: Promotion }) => (
      <PromotionCard
        promotion={item}
        onEdit={onEditPromotion}
        onToggleStatus={handleToggleStatus}
      />
    ),
    [onEditPromotion]
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No Promotions Yet
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
        Create your first promotion to get started!
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading promotions...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: "center",
  },
});
