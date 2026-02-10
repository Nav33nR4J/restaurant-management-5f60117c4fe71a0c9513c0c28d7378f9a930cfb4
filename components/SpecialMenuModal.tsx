import { useState } from "react";
import { Modal, StyleSheet, Text, TextInput, View } from "react-native";
import { MenuItem } from "../config/config";
import { withOpacity } from "../utils/colorUtils";
import { ModalButtons } from "./ui";

interface SpecialMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: Omit<MenuItem, "id" | "createdAt" | "updatedAt">) => void;
  theme: any;
}

export function SpecialMenuModal({ visible, onClose, onAdd, theme }: SpecialMenuModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const handleAdd = () => {
    if (!name || !price || !category) return;
    onAdd({
      name, description, price: parseFloat(price), basePrice: parseFloat(price),
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      category, isAvailable: true, inStock: true,
    });
    setName(""); setDescription(""); setPrice(""); setCategory("");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Add Special Food Item</Text>
          <Text style={[styles.modalSubtitle, { color: withOpacity(theme.text, 0.5) }]}>Add a special item to the menu with custom pricing</Text>
          <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} placeholder="Food Name *" placeholderTextColor={withOpacity(theme.text, 0.5)} value={name} onChangeText={setName} />
          <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} placeholder="Description" placeholderTextColor={withOpacity(theme.text, 0.5)} value={description} onChangeText={setDescription} multiline numberOfLines={3} />
          <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} placeholder="Price (₹) *" placeholderTextColor={withOpacity(theme.text, 0.5)} value={price} onChangeText={setPrice} keyboardType="numeric" />
          <TextInput style={[styles.input, { borderColor: theme.border, color: theme.text }]} placeholder="Category * (e.g., Main Course, Appetizer, Special)" placeholderTextColor={withOpacity(theme.text, 0.5)} value={category} onChangeText={setCategory} />
          <ModalButtons
            onCancel={onClose}
            onConfirm={handleAdd}
            confirmLabel="Add Special"
            theme={theme}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", borderRadius: 16, padding: 20, elevation: 8 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  modalSubtitle: { fontSize: 14, marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
});

