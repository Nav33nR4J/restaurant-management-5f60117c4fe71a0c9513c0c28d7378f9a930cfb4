import React, { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../../theme/promotions/ThemeProvider";
import { Button } from "../atoms/Button";
import { Checkbox } from "../atoms/Checkbox";
import { Input } from "../atoms/Input";

export interface MenuItemOption {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
}

interface MenuItemPickerProps {
  visible: boolean;
  onClose: () => void;
  menuItems: MenuItemOption[];
  selectedItems: {
    item_id: string;
    item_name: string;
    discount_type: "PERCENTAGE" | "FIXED";
    discount_value: number;
  }[];
  onConfirm: (items: {
    item_id: string;
    item_name: string;
    discount_type: "PERCENTAGE" | "FIXED";
    discount_value: number;
  }[]) => void;
}

export const MenuItemPicker: React.FC<MenuItemPickerProps> = ({
  visible,
  onClose,
  menuItems,
  selectedItems,
  onConfirm,
}) => {
  const { theme } = useTheme();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [itemDiscounts, setItemDiscounts] = useState<{
    [key: string]: { discount_type: "PERCENTAGE" | "FIXED"; discount_value: number };
  }>({});
  const [category, setCategory] = useState<string>("");

  // Initialize selected items and category when modal opens
  useEffect(() => {
    if (visible) {
      const initialSelected = new Set<string>();
      const initialDiscounts: { [key: string]: any } = {};
      selectedItems.forEach((item) => {
        initialSelected.add(item.item_id);
        initialDiscounts[item.item_id] = {
          discount_type: item.discount_type,
          discount_value: item.discount_value,
        };
      });
      setSelected(initialSelected);
      setItemDiscounts(initialDiscounts);

      // Set default category
      if (menuItems.length > 0) {
        const categories = [...new Set(menuItems.map((item) => item.category))];
        if (categories.length > 0 && !category) {
          setCategory(categories[0]);
        }
      }
    }
  }, [visible, selectedItems, menuItems]);

  const toggleItem = (itemId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
      // Remove discount when deselecting
      const newDiscounts = { ...itemDiscounts };
      delete newDiscounts[itemId];
      setItemDiscounts(newDiscounts);
    } else {
      newSelected.add(itemId);
      // Add default discount
      setItemDiscounts((prev) => ({
        ...prev,
        [itemId]: { discount_type: "PERCENTAGE", discount_value: 10 },
      }));
    }
    setSelected(newSelected);
  };

  const updateDiscount = (
    itemId: string,
    field: "discount_type" | "discount_value",
    value: string | number
  ) => {
    setItemDiscounts((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: field === "discount_value" ? Number(value) : value,
      },
    }));
  };

  const handleConfirm = () => {
    const result = Array.from(selected).map((itemId) => {
      const menuItem = menuItems.find((m) => m.id === itemId);
      return {
        item_id: itemId,
        item_name: menuItem?.name || "",
        discount_type: itemDiscounts[itemId]?.discount_type || "PERCENTAGE",
        discount_value: itemDiscounts[itemId]?.discount_value || 10,
      };
    });
    onConfirm(result);
    onClose();
  };

  const categories = [...new Set(menuItems.map((item) => item.category))];
  const filteredItems = category
    ? menuItems.filter((item) => item.category === category)
    : menuItems;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Select Menu Items
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: theme.primary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Select items and set individual discounts for each
          </Text>

          {menuItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No menu items available.{"\n"}Please add items to the menu first.
              </Text>
            </View>
          ) : (
            <>
              {/* Category Filter */}
              {categories.length > 1 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.categoryScroll}
                >
                  <TouchableOpacity
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor:
                          category === "" ? theme.primary : theme.card,
                      },
                    ]}
                    onPress={() => setCategory("")}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: category === "" ? "#fff" : theme.text,
                        },
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor:
                            category === cat ? theme.primary : theme.card,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            color: category === cat ? "#fff" : theme.text,
                          },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Items List */}
              <FlatList
                data={filteredItems}
                keyExtractor={(item) => item.id}
                style={styles.list}
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.itemCard,
                      {
                        backgroundColor: selected.has(item.id)
                          ? theme.primary + "10"
                          : theme.card,
                        borderColor: selected.has(item.id)
                          ? theme.primary
                          : theme.border,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.itemHeader}
                      onPress={() => toggleItem(item.id)}
                      activeOpacity={0.7}
                    >
                      <Checkbox
                        value={selected.has(item.id)}
                        onValueChange={() => toggleItem(item.id)}
                        color={theme.primary}
                      />
                      <View style={styles.itemInfo}>
                        <Text style={[styles.itemName, { color: theme.text }]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.itemCategory, { color: theme.textSecondary }]}>
                          {item.category}
                        </Text>
                      </View>
                      <Text style={[styles.itemPrice, { color: theme.primary }]}>
                        ₹{item.price}
                      </Text>
                    </TouchableOpacity>

                    {selected.has(item.id) && (
                      <View style={[styles.discountSection, { borderTopColor: theme.border }]}>
                        <View style={styles.discountRow}>
                          <Text style={[styles.discountLabel, { color: theme.textSecondary }]}>
                            Discount:
                          </Text>
                          <View style={styles.discountTypeButtons}>
                            <TouchableOpacity
                              style={[
                                styles.typeButton,
                                {
                                  backgroundColor:
                                    itemDiscounts[item.id]?.discount_type === "PERCENTAGE"
                                      ? theme.primary
                                      : "transparent",
                                  borderColor: theme.border,
                                },
                              ]}
                              onPress={() =>
                                updateDiscount(item.id, "discount_type", "PERCENTAGE")
                              }
                            >
                              <Text
                                style={[
                                  styles.typeButtonText,
                                  {
                                    color:
                                      itemDiscounts[item.id]?.discount_type === "PERCENTAGE"
                                        ? "#fff"
                                        : theme.text,
                                  },
                                ]}
                              >
                                %
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.typeButton,
                                {
                                  backgroundColor:
                                    itemDiscounts[item.id]?.discount_type === "FIXED"
                                      ? theme.primary
                                      : "transparent",
                                  borderColor: theme.border,
                                },
                              ]}
                              onPress={() =>
                                updateDiscount(item.id, "discount_type", "FIXED")
                              }
                            >
                              <Text
                                style={[
                                  styles.typeButtonText,
                                  {
                                    color:
                                      itemDiscounts[item.id]?.discount_type === "FIXED"
                                        ? "#fff"
                                        : theme.text,
                                  },
                                ]}
                              >
                                ₹
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <Input
                            placeholder="10"
                            value={itemDiscounts[item.id]?.discount_value?.toString() || ""}
                            onChangeText={(text) =>
                              updateDiscount(item.id, "discount_value", text)
                            }
                            keyboardType="numeric"
                            style={[
                              styles.discountInput,
                              { backgroundColor: theme.background, color: theme.text },
                            ]}
                          />
                        </View>
                        <Text style={[styles.discountPreview, { color: theme.textSecondary }]}>
                          {itemDiscounts[item.id]?.discount_type === "PERCENTAGE"
                            ? `Save ${itemDiscounts[item.id]?.discount_value || 0}% on this item`
                            : `Save ₹${itemDiscounts[item.id]?.discount_value || 0} on this item`}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              />
            </>
          )}

          <View style={styles.footer}>
            <Text style={[styles.selectionCount, { color: theme.textSecondary }]}>
              {selected.size} item{selected.size !== 1 ? "s" : ""} selected
            </Text>
            <Button
              title={`Confirm ${selected.size} Item${selected.size !== 1 ? "s" : ""}`}
              onPress={handleConfirm}
              style={{ backgroundColor: selected.size > 0 ? theme.primary : theme.border }}
            />
            <Button
              title="Cancel"
              onPress={onClose}
              style={{ backgroundColor: theme.border, marginTop: 8 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    maxHeight: "92%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
  },
  categoryScroll: {
    marginBottom: 16,
    flexGrow: 0,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  list: {
    maxHeight: 380,
  },
  itemCard: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1.5,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemCategory: {
    fontSize: 12,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "bold",
  },
  discountSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  discountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  discountLabel: {
    fontSize: 13,
    fontWeight: "500",
    minWidth: 70,
  },
  discountTypeButtons: {
    flexDirection: "row",
    gap: 4,
  },
  typeButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  discountInput: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  discountPreview: {
    fontSize: 12,
    marginTop: 6,
    fontStyle: "italic",
  },
  footer: {
    marginTop: 16,
  },
  selectionCount: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 8,
  },
});
