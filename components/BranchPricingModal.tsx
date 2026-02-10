/**
 * Branch Pricing Modal
 * Allows branch users to edit prices on menu items
 */

import React, { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { hasPermission, isBranch } from "../config/accessControl";
import { MenuItem as ConfigMenuItem } from "../config/config";
import { useAppDispatch } from "../store/hooks";
import { updateMenuItemAsync } from "../store/menu/menuThunks";

interface BranchPricingModalProps {
  visible: boolean;
  onClose: () => void;
  item: ConfigMenuItem | null;
  theme: any;
}

export function BranchPricingModal({
  visible,
  onClose,
  item,
  theme,
}: BranchPricingModalProps) {
  const dispatch = useAppDispatch();
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  // Initialize price when modal opens
  React.useEffect(() => {
    if (item) {
      setPrice(item.price.toFixed(2));
    }
  }, [item]);

  const handleSave = useCallback(async () => {
    if (!item || !price) return;
    
    const newPrice = parseFloat(price);
    if (isNaN(newPrice) || newPrice < 0) return;
    
    setSaving(true);
    
    try {
      await dispatch(updateMenuItemAsync({
        ...item,
        price: newPrice,
        updatedAt: new Date().toISOString(),
      })).unwrap();
      
      onClose();
    } catch (error) {
      console.error("Failed to update price:", error);
    } finally {
      setSaving(false);
    }
  }, [dispatch, item, price, onClose]);

  const handleClose = useCallback(() => {
    if (!saving) {
      onClose();
    }
  }, [saving, onClose]);

  // Reset price when modal closes
  const handleModalHide = useCallback(() => {
    if (item) {
      setPrice(item.price.toFixed(2));
    }
  }, [item]);

  if (!item) return null;

  const canManagePricing = isBranch() && hasPermission("pricing:manage");

  return (
    <Modal
      visible={visible && canManagePricing}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable 
        style={styles.modalOverlay} 
        onPress={handleClose}
      >
        <Pressable 
          style={[styles.modalContent, { backgroundColor: theme.background }]} 
          onPress={(e) => e.stopPropagation()}
        >
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Edit Price
          </Text>

          <Text style={[styles.itemName, { color: theme.text }]}>
            {item.name}
          </Text>

          <Text style={[styles.label, { color: theme.text }]}>
            Current Price: ₹{item.price.toFixed(2)}
          </Text>

          <Text style={[styles.label, { color: theme.text }]}>
            Base Price (HQ): ₹{item.basePrice.toFixed(2)}
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.text,
                backgroundColor: theme.card,
              },
            ]}
            placeholder="New Price (₹)"
            placeholderTextColor={theme.text + "80"}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            editable={!saving}
          />

          {parseFloat(price) !== item.price && (
            <Text style={[styles.priceDiff, { color: theme.accent }]}>
              {parseFloat(price) > item.price
                ? `Price will increase by ₹${(parseFloat(price) - item.price).toFixed(2)}`
                : `Price will decrease by ₹${(item.price - parseFloat(price)).toFixed(2)}`}
            </Text>
          )}

          <View style={styles.modalButtons}>
            <Pressable
              onPress={handleClose}
              style={[
                styles.modalButton,
                { backgroundColor: theme.muted },
                saving && styles.buttonDisabled,
              ]}
              disabled={saving}
            >
              <Text style={[styles.modalButtonText, { color: theme.text }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={[
                styles.modalButton,
                { backgroundColor: theme.primary },
                (saving || !price) && styles.buttonDisabled,
              ]}
              disabled={saving || !price}
            >
              <Text style={styles.modalButtonText}>
                {saving ? "Saving..." : "Save Price"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 12,
    textAlign: "center",
  },
  priceDiff: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 90,
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

