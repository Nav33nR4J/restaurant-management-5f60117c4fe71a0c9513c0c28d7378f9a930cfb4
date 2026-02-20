import React, { useMemo, useState } from "react";
import {
  Alert,
  Text as RNText,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { useSelector } from "react-redux";
import { selectAllMenuItems } from "../../../store/menuSlice";
import { useTheme } from "../../../theme/promotions/ThemeProvider";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { Text } from "../atoms/Text";
import { MenuItemOption, MenuItemPicker } from "../molecules/MenuItemPicker";
import { ToggleSwitch } from "../molecules/ToggleSwitch";

interface PromotionFormProps {
  initialData?: {
    id?: string;
    promo_code: string;
    title: string;
    type: "PERCENTAGE" | "FIXED" | "CUSTOM_ITEMS";
    value: number;
    min_order_amount: number;
    max_discount_amount?: number;
    usage_limit?: number | null;
    start_at: string;
    end_at: string;
    status: "ACTIVE" | "INACTIVE";
    description?: string;
    custom_items?: {
      item_id: string;
      item_name: string;
      discount_type: "PERCENTAGE" | "FIXED";
      discount_value: number;
    }[];
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

  // Get menu items from Redux store
  const reduxMenuItems = useSelector(selectAllMenuItems);
  const menuItemOptions = useMemo<MenuItemOption[]>(
    () =>
      reduxMenuItems
        .filter((item) => item.isAvailable)
        .map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
        })),
    [reduxMenuItems]
  );

  const [promoCode, setPromoCode] = useState(initialData?.promo_code || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED" | "CUSTOM_ITEMS">(
    initialData?.type || "PERCENTAGE"
  );
  const [discountValue, setDiscountValue] = useState(
    initialData?.value?.toString() || ""
  );
  const [minOrderAmount, setMinOrderAmount] = useState(
    initialData?.min_order_amount?.toString() || "0"
  );
  const [maxDiscountAmount, setMaxDiscountAmount] = useState(
    initialData?.max_discount_amount?.toString() || ""
  );
  const [usageLimit, setUsageLimit] = useState(
    initialData?.usage_limit != null ? initialData.usage_limit.toString() : ""
  );
  const [startDate, setStartDate] = useState(initialData?.start_at || "");
  const [endDate, setEndDate] = useState(initialData?.end_at || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isActive, setIsActive] = useState(initialData?.status === "ACTIVE");
  const [showMenuPicker, setShowMenuPicker] = useState(false);
  const [customItems, setCustomItems] = useState(
    initialData?.custom_items || []
  );

  const validateForm = () => {
    if (!promoCode.trim()) {
      Alert.alert("Error", "Promo code is required");
      return false;
    }
    if (!title.trim()) {
      Alert.alert("Error", "Title is required");
      return false;
    }
    if (discountType !== "CUSTOM_ITEMS" && (!discountValue || parseFloat(discountValue) <= 0)) {
      Alert.alert("Error", "Valid discount value is required");
      return false;
    }
    if (discountType === "PERCENTAGE" && parseFloat(discountValue) > 100) {
      Alert.alert("Error", "Percentage cannot exceed 100");
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
    if (discountType === "CUSTOM_ITEMS" && customItems.length === 0) {
      Alert.alert("Error", "Please select at least one menu item");
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    // Format dates to datetime
    const formatDateTime = (dateStr: string) => {
      if (!dateStr || dateStr.trim() === '') {
        return null;
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toISOString().replace('T', ' ').substring(0, 19);
    };

    onSubmit({
      id: initialData?.id,
      promo_code: promoCode.toUpperCase().trim(),
      title: title.trim(),
      type: discountType,
      value: discountType === "CUSTOM_ITEMS" ? 0 : parseFloat(discountValue),
      min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
      max_discount_amount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      start_at: formatDateTime(startDate),
      end_at: formatDateTime(endDate),
      description: description.trim() || null,
      is_active: isActive,
      custom_items: discountType === "CUSTOM_ITEMS" ? customItems : [],
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
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
        <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
        <Input
          placeholder="Enter promotion title"
          value={title}
          onChangeText={setTitle}
          style={{ backgroundColor: theme.card, color: theme.text }}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: theme.text }]}>Discount Type *</Text>
        <View style={styles.discountTypeContainer}>
          <TouchableOpacity
            style={[
              styles.discountTypeButton,
              {
                backgroundColor:
                  discountType === "PERCENTAGE" ? theme.primary : theme.card,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setDiscountType("PERCENTAGE")}
          >
            <RNText
              style={[
                styles.discountTypeText,
                {
                  color: discountType === "PERCENTAGE" ? "#fff" : theme.text,
                },
              ]}
            >
              Percentage (%)
            </RNText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.discountTypeButton,
              {
                backgroundColor:
                  discountType === "FIXED" ? theme.primary : theme.card,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setDiscountType("FIXED")}
          >
            <RNText
              style={[
                styles.discountTypeText,
                {
                  color: discountType === "FIXED" ? "#fff" : theme.text,
                },
              ]}
            >
              Fixed Amount (₹)
            </RNText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.discountTypeButton,
              {
                backgroundColor:
                  discountType === "CUSTOM_ITEMS" ? theme.primary : theme.card,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setDiscountType("CUSTOM_ITEMS")}
          >
            <RNText
              style={[
                styles.discountTypeText,
                {
                  color: discountType === "CUSTOM_ITEMS" ? "#fff" : theme.text,
                },
              ]}
            >
              Custom Items
            </RNText>
          </TouchableOpacity>
        </View>
      </View>

      {discountType === "CUSTOM_ITEMS" ? (
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>
            Selected Menu Items *
          </Text>
          {menuItemOptions.length === 0 ? (
            <View style={[styles.selectItemsButton, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <RNText style={{ color: theme.textSecondary, textAlign: "center" }}>
                No menu items available. Add items to the menu first.
              </RNText>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.selectItemsButton,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
              onPress={() => setShowMenuPicker(true)}
            >
              <RNText style={{ color: customItems.length > 0 ? theme.primary : theme.text, fontWeight: customItems.length > 0 ? "600" : "400" }}>
                {customItems.length > 0
                  ? `✓ ${customItems.length} item${customItems.length !== 1 ? "s" : ""} selected — tap to change`
                  : `Tap to select from ${menuItemOptions.length} menu items`}
              </RNText>
            </TouchableOpacity>
          )}
          {customItems.length > 0 && (
            <View style={styles.selectedItemsPreview}>
              {customItems.map((item) => (
                <View
                  key={item.item_id}
                  style={[
                    styles.selectedItemChip,
                    { backgroundColor: theme.primary + "20" },
                  ]}
                >
                  <RNText style={{ color: theme.primary, fontSize: 12, fontWeight: "600" }}>
                    {item.item_name}
                  </RNText>
                  <RNText style={{ color: theme.text, fontSize: 11 }}>
                    {" "}({item.discount_type === "PERCENTAGE" ? `${item.discount_value}% off` : `₹${item.discount_value} off`})
                  </RNText>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={[styles.label, { color: theme.text }]}>
            Discount Value {discountType === "PERCENTAGE" ? "(%)" : "(₹)"} *
          </Text>
          <Input
            placeholder={
              discountType === "PERCENTAGE"
                ? "Enter percentage (e.g., 20)"
                : "Enter amount (e.g., 100)"
            }
            value={discountValue}
            onChangeText={setDiscountValue}
            keyboardType="numeric"
            style={{ backgroundColor: theme.card, color: theme.text }}
          />
        </View>
      )}

      <View style={styles.row}>
        <View style={[styles.section, styles.halfWidth]}>
          <Text style={[styles.label, { color: theme.text }]}>
            Min Order (₹)
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
          <Text style={[styles.label, { color: theme.text }]}>
            Max Discount (₹)
          </Text>
          <Input
            placeholder="Optional"
            value={maxDiscountAmount}
            onChangeText={setMaxDiscountAmount}
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
        <Text style={[styles.label, { color: theme.text }]}>Usage Limit</Text>
        <Input
          placeholder="Leave empty for unlimited"
          value={usageLimit}
          onChangeText={setUsageLimit}
          keyboardType="numeric"
          style={{ backgroundColor: theme.card, color: theme.text }}
        />
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

      {/* Menu Item Picker Modal */}
      <MenuItemPicker
        visible={showMenuPicker}
        onClose={() => setShowMenuPicker(false)}
        menuItems={menuItemOptions}
        selectedItems={customItems}
        onConfirm={(items) => setCustomItems(items)}
      />
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
  discountTypeContainer: {
    flexDirection: "row",
    gap: 8,
  },
  discountTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  discountTypeText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  selectItemsButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  selectedItemsPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    alignItems: "center",
  },
  selectedItemChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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

