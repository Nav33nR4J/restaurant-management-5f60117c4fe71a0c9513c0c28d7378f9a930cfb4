import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../../theme/promotions/ThemeProvider";
import { Text } from "../atoms/Text";

interface PromotionCardProps {
  promotion: {
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
    if (promotion.discount_type === "percentage") {
      return `${promotion.discount_value}% OFF`;
    }
    return `₹${promotion.discount_value} OFF`;
  };

  const isExpired = new Date(promotion.end_date) < new Date();
  const isNotStarted = new Date(promotion.start_date) > new Date();
  const isActive = promotion.is_active && !isExpired && !isNotStarted;

  return (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <View style={styles.header}>
        <View style={styles.codeContainer}>
          <Text style={[styles.code, { color: theme.primary }]}>
            {promotion.promo_code}
          </Text>
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
                : promotion.is_active
                ? "Active"
                : "Inactive"}
            </Text>
          </View>
        </View>
        <Text style={[styles.discount, { color: theme.secondary }]}>
          {formatDiscount()}
        </Text>
      </View>

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
            {formatDate(promotion.start_date)}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
            End Date:
          </Text>
          <Text style={[styles.detailValue, { color: theme.text }]}>
            {formatDate(promotion.end_date)}
          </Text>
        </View>
        {promotion.min_order_amount && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Min Order:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              ₹{promotion.min_order_amount}
            </Text>
          </View>
        )}
        {promotion.max_uses && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
              Uses:
            </Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>
              {promotion.current_uses || 0} / {promotion.max_uses}
            </Text>
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
    marginBottom: 8,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  discount: {
    fontSize: 20,
    fontWeight: "800",
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
});
