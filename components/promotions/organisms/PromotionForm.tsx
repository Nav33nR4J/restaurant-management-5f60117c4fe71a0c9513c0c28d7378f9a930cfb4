import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "../../../theme/promotions/ThemeProvider";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Input } from "../atoms/Input";
import { Text } from "../atoms/Text";
import { ToggleSwitch } from "../molecules/ToggleSwitch";

interface PromotionFormProps {
  initialData?: {
    id?: string;
    promo_code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    min_order_amount?: number;
    max_uses?: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
    description?: string;
  };
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { theme } = useTheme();

  const [promoCode, setPromoCode] = useState(initialData?.promo_code || "");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    initialData?.discount_type || "percentage"
  );
  const [discountValue, setDiscountValue] = useState(
    initialData?.discount_value?.toString() || ""
  );
  const [minOrderAmount, setMinOrderAmount] = useState(
    initialData?.min_order_amount?.toString() || ""
  );
  const [maxUses, setMaxUses] = useState(
    initialData?.max_uses?.toString() || ""
  );
  const [startDate, setStartDate] = useState(initialData?.start_date || "");
  const [endDate, setEndDate] = useState(initialData?.end_date || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);

  const validateForm = () => {
    if (!promoCode.trim()) {
      Alert.alert("Error", "Promo code is required");
      return false;
    }
    if (!discountValue || parseFloat(discountValue) <= 0) {
      Alert.alert("Error", "Valid discount value is required");
      return false;
    }
    if (!startDate) {
      Alert.alert("Error", "Start date is required");
      return false;
    }
    if (!endDate) {
      Alert.alert("Error", "End date is required");
      return false;
    }
    if (new Date(startDate) > new Date(endDate)) {
      Alert.alert("Error", "End date must be after start date");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    onSubmit({
      id: initialData?.id,
      promo_code: promoCode.toUpperCase().trim(),
      discount_type: discountType,
      discount_value: parseFloat(discountValue),
      min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      max_uses: maxUses ? parseInt(maxUses) : null,
      start_date: startDate,
      end_date: endDate,
      description: description.trim() || null,
      is_active: isActive,
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text }]}>Promo Code *</Text>
        <Input
          placeholder="Enter promo code (e.g., SAVE20)"
          value={promoCode}
          onChangeText={(text) => setPromoCode(text.toUpperCase())}
          autoCapitalize="characters"
          style={{ backgroundColor: theme.card, color: theme.text }}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text }]}>Discount Type *</Text>
        <View style={styles.radioGroup}>
          <View style={styles.radioOption}>
            <Checkbox
              value={discountType === "percentage"}
              onValueChange={() => setDiscountType("percentage")}
              color={theme.primary}
            />
            <Text style={[styles.radioLabel, { color: theme.text }]}>
              Percentage (%)
            </Text>
          </View>
          <View style={styles.radioOption}>
            <Checkbox
              value={discountType === "fixed"}
              onValueChange={() => setDiscountType("fixed")}
              color={theme.primary}
            />
            <Text style={[styles.radioLabel, { color: theme.text }]}>
              Fixed Amount (₹)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text }]}>Discount Value *</Text>
        <Input
          placeholder={
            discountType === "percentage"
              ? "Enter percentage (e.g., 20)"
              : "Enter amount (e.g., 100)"
          }
          value={discountValue}
          onChangeText={setDiscountValue}
          keyboardType="numeric"
          style={{ backgroundColor: theme.card, color: theme.text }}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.section, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>
            Min Order Amount (₹)
          </Text>
          <Input
            placeholder="0"
            value={minOrderAmount}
            onChangeText={setMinOrderAmount}
            keyboardType="numeric"
            style={{ backgroundColor: theme.card, color: theme.text }}
          />
        </View>
        <View style={[styles.section, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>Max Uses</Text>
          <Input
            placeholder="Unlimited"
            value={maxUses}
            onChangeText={setMaxUses}
            keyboardType="numeric"
            style={{ backgroundColor: theme.card, color: theme.text }}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.section, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>Start Date *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
            style={{ backgroundColor: theme.card, color: theme.text }}
          />
        </View>
        <View style={[styles.section, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>End Date *</Text>
          <Input
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={setEndDate}
            style={{ backgroundColor: theme.card, color: theme.text }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text }]}>Description</Text>
        <Input
          placeholder="Enter description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ backgroundColor: theme.card, color: theme.text, height: 80 }}
        />
      </View>

      <View style={styles.switchRow}>
        <View>
          <Text style={[styles.switchLabel, { color: theme.text }]}>
            Active Status
          </Text>
          <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
            Enable or disable this promotion
          </Text>
        </View>
        <ToggleSwitch value={isActive} onValueChange={setIsActive} />
      </View>

      <View style={styles.buttons}>
        <Button
          title={isLoading ? "Saving..." : "Save Promotion"}
          onPress={handleSubmit}
          loading={isLoading}
          style={{ backgroundColor: theme.primary }}
        />
        <Button
          title="Cancel"
          onPress={onCancel}
          style={{
            backgroundColor: theme.border,
            marginTop: 12,
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  radioGroup: {
    flexDirection: "row",
    gap: 20,
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  radioLabel: {
    fontSize: 14,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  switchDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  buttons: {
    marginTop: 8,
    marginBottom: 40,
  },
});
