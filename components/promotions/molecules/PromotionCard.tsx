import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../theme/promotions/ThemeProvider";
import { Text } from "../atoms/Text";

interface PromotionCardProps {
  promotion: {
    id: string;
    promo_code: string;
    title: string;
    type: "PERCENTAGE" | "FIXED" | "CUSTOM_ITEMS";
    value: number;
    start_at: string;
    end_at: string;
    status: "ACTIVE" | "INACTIVE";
    usage_limit: number | null;
    usage_count: number;
    min_order_amount: number;
    max_discount_amount: number | null;
    description: string | null;
    custom_items?: any[];
  };
  onEdit: (promotion: any) => void;
  onToggleStatus: (promotion: any) => void;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  onEdit,
  onToggleStatus,
}) => {
  const { theme } = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDiscount = () => {
    if (promotion.type === "PERCENTAGE") {
      return `${promotion.value}% OFF`;
    }
    if (promotion.type === "FIXED") {
      return `₹${promotion.value} OFF`;
    }
    // CUSTOM_ITEMS
    const itemsCount = promotion.custom_items?.length || 0;
    return `${itemsCount} Items`;
  };

  const getTypeLabel = () => {
    if (promotion.type === "PERCENTAGE") return "%";
    if (promotion.type === "FIXED") return "₹";
    return "Items";
  };

  const isExpired = new Date(promotion.end_at) < new Date();
  const isNotStarted = new Date(promotion.start_at) > new Date();
  const isActive = promotion.status === "ACTIVE" && !isExpired && !isNotStarted;

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <View style={styles.codeContainer}>
          <Text style={[styles.code, { color: theme.primary }]}>
            {promotion.promo_code}
          </Text>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: theme.secondary + "20" },
            ]}
          >
            <Text style={[styles.typeText, { color: theme.secondary }]}>
              {promotion.type === "CUSTOM_ITEMS" ? "Custom" : promotion.type === "PERCENTAGE" ? "%" : "₹"}
            </Text>
          </View>
        </View>
        <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isActive
                  ? theme.success + "20"
                  : isExpired || isNotStarted
                  ? theme.warning + "20"
                  : theme.error + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: isActive
                    ? theme.success
                    : isExpired || isNotStarted
                    ? theme.warning
                    : theme.error,
                },
              ]}
            >
              {isExpired
                ? "Expired"
                : isNotStarted
                ? "Not Started"
                : promotion.status === "ACTIVE"
                ? "Active"
                : "Inactive"}
            </Text>
          </View>
      </View>

      <Text style={[styles.title, { color: theme.text }]}>
        {promotion.title}
      </Text>

      <Text style={[styles.discount, { color: theme.secondary }]}>
        {formatDiscount()}
      </Text>

      {promotion.description && (
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {promotion.description}
        </Text>
      )}

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            Start Date:
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {formatDate(promotion.start_at)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            End Date:
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {formatDate(promotion.end_at)}
          </Text>
        </View>
        {promotion.min_order_amount > 0 && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Min Order:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              ₹{promotion.min_order_amount}
            </Text>
          </View>
        )}
        {promotion.max_discount_amount && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Max Discount:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              ₹{promotion.max_discount_amount}
            </Text>
          </View>
        )}
        {promotion.usage_limit && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Uses:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {promotion.usage_count || 0} / {promotion.usage_limit}
            </Text>
          </View>
        )}
        {promotion.type === "CUSTOM_ITEMS" && promotion.custom_items && promotion.custom_items.length > 0 && (
          <View style={styles.customItemsSection}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Discounted Items ({promotion.custom_items.length}):
            </Text>
            <View style={styles.customItemsList}>
              {promotion.custom_items.map((ci: any) => (
                <View key={ci.item_id} style={[styles.customItemChip, { backgroundColor: theme.primary + "15" }]}>
                  <Text style={[styles.customItemName, { color: theme.text }]}>
                    {ci.item_name}
                  </Text>
                  <Text style={[styles.customItemDiscount, { color: theme.primary }]}>
                    {ci.discount_type === "PERCENTAGE"
                      ? `${ci.discount_value}% off`
                      : `₹${ci.discount_value} off`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.editButton, { borderColor: theme.border }]}
          onPress={() => onEdit(promotion)}
        >
          <Text style={[styles.editButtonText, { color: theme.text }]}>
            Edit
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            {
              backgroundColor: isActive ? theme.error : theme.success,
            },
          ]}
          onPress={() => onToggleStatus(promotion)}
        >
          <Text style={styles.toggleButtonText}>
            {isActive ? "Deactivate" : "Activate"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  codeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  code: {
    fontSize: 18,
    fontWeight: "700",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  title: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  discount: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  details: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  toggleButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  customItemsSection: {
    marginBottom: 12,
  },
  customItemsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  customItemChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  customItemName: {
    fontSize: 12,
    fontWeight: "500",
  },
  customItemDiscount: {
    fontSize: 12,
    fontWeight: "700",
  },
});

