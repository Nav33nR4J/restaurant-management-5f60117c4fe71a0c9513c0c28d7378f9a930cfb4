import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Promotion } from "../../../store/promotions/promotionsSlice";
import { useTheme } from "../../../theme/promotions/ThemeProvider";
import { api, getErrorMessage } from "../../../utils/promotions/api";
import { PromotionCard } from "../molecules/PromotionCard";

type FilterType = "all" | "active" | "upcoming" | "expired";

interface FilterTabProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const FilterTab: React.FC<FilterTabProps> = React.memo(({ label, isActive, onPress }) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.filterTab, isActive && styles.filterTabActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isActive ? (
        <LinearGradient
          colors={[theme.gradientStart, theme.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.filterTabGradient}
        >
          <Text style={styles.filterTabTextActive}>{label}</Text>
        </LinearGradient>
      ) : (
        <Text style={[styles.filterTabText, { color: theme.textSecondary }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
});

interface PromotionListProps {
  onEditPromotion: (promotion: Promotion) => void;
}

export const PromotionList: React.FC<PromotionListProps> = ({ onEditPromotion }) => {
  const { theme } = useTheme();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchPromotions = useCallback(async (currentFilter: FilterType = "all") => {
    try {
      const query = currentFilter !== "all" ? `?filter=${currentFilter}` : "";
      const response = await api.get(`/promotions${query}`);
      // API returns { success: true, data: [...] }
      const data = response.data?.data ?? response.data;
      setPromotions(Array.isArray(data) ? data : []);
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
    fetchPromotions(filter);
  }, [fetchPromotions, filter]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPromotions(filter);
  }, [fetchPromotions, filter]);

  const handleFilterChange = useCallback((newFilter: FilterType) => {
    setFilter(newFilter);
  }, []);

  const handleToggleStatus = useCallback(async (promotion: Promotion) => {
    try {
      await api.patch(`/promotions/${promotion.id}/toggle`);
      fetchPromotions(filter);
    } catch (error) {
      console.error("Error toggling promotion status:", error);
      Alert.alert("Error", "Failed to update promotion status");
    }
  }, [fetchPromotions, filter]);

  const renderItem = useCallback(
    ({ item }: { item: Promotion }) => (
      <PromotionCard
        promotion={item}
        onEdit={onEditPromotion}
        onToggleStatus={handleToggleStatus}
      />
    ),
    [onEditPromotion, handleToggleStatus]
  );

  const keyExtractor = useCallback((item: Promotion) => String(item.id), []);

  const ListEmptyComponent = useMemo(() => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyIcon]}>🎉</Text>
      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        {filter === "all" ? "No Promotions Yet" : `No ${filter} promotions`}
      </Text>
      <Text style={[styles.emptyMessage, { color: theme.textSecondary }]}>
        {filter === "all"
          ? "Create your first promotion to get started!"
          : `No ${filter} promotions at the moment`}
      </Text>
    </View>
  ), [filter, theme]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>Loading promotions...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: theme.card }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: "all" as FilterType, label: "All" },
            { key: "active" as FilterType, label: "Active" },
            { key: "upcoming" as FilterType, label: "Upcoming" },
            { key: "expired" as FilterType, label: "Expired" },
          ]}
          keyExtractor={(item) => item.key}
          renderItem={({ item }) => (
            <FilterTab
              label={item.label}
              isActive={filter === item.key}
              onPress={() => handleFilterChange(item.key)}
            />
          )}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Promotions List */}
      <FlatList
        data={promotions}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.primary]}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={ListEmptyComponent}
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
  filterContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  filterList: {
    paddingHorizontal: 12,
    gap: 8,
  },
  filterTab: {
    borderRadius: 20,
    overflow: "hidden",
    minWidth: 70,
    alignItems: "center",
  },
  filterTabActive: {
    // gradient handles the background
  },
  filterTabGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  filterTabText: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 13,
    fontWeight: "500",
  },
  filterTabTextActive: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFFFFF",
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
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
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
