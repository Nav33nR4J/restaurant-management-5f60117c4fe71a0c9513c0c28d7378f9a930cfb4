import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";


import { useCallback, useEffect, useMemo, useState } from "react";
import { hasPermission, isBranch, isHQ, isUser } from "../../config/accessControl";
import { MenuItem as ConfigMenuItem, SeasonalMenu } from "../../config/config";
import useSafeNavigation from "../../hooks/useSafeNavigation";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  addMenuItem,
  addSeasonalMenu,
  assignItemToSeasonalMenu,
  deleteSeasonalMenu,
  selectCategories,
} from "../../store/menuSlice";
import { toggleTheme } from "../../store/themeSlice";
import { getTheme } from "../../theme";
import { withOpacity } from "../../utils/colorUtils";
import { Loggers } from "../../utils/logger";
import { SAMPLE_MENU_ITEMS } from "../../utils/menuConstants";
import { createSeasonalMenuManager, SeasonalMenuManager } from "../../utils/seasonalMenu";

// Components
import { BranchPricingModal } from "../../components/BranchPricingModal";
import { CategoryFilter } from "../../components/CategoryFilter";
import { CartButton } from "../../components/menu/CartButton";
import { MenuHeader } from "../../components/menu/MenuHeader";
import { SeasonalBanner } from "../../components/menu/SeasonalBanner";
import { MenuItemCard } from "../../components/MenuItemCard";
import { ActionButton, ModalButtons } from "../../components/ui";


// Hooks
import { useMenuActions } from "../../hooks/menu/useMenuActions";
import { useFilteredItems, useTimeFilteredItems } from "../../utils/menu/menuHelpers";

export default function MenuPage() {
  const { safePush } = useSafeNavigation(200);
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.cart.items);
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const user = useAppSelector((state) => state.auth.user);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const menuItems = useAppSelector((state) => state.menu.items);
  const seasonalMenus = useAppSelector((state) => state.menu.seasonalMenus);
  const currentSeasonalMenu = useAppSelector((state) => state.menu.currentSeasonalMenu);
  const loading = useAppSelector((state) => state.menu.loading);
  const stockItems = useAppSelector((state) => state.stock.items);
  const categories = useAppSelector(selectCategories);

  const theme = getTheme(flavor, resolvedMode);
  const { handleAddItem, handleRemoveItem, handleDeleteItem, handleAddMenuItem } = useMenuActions();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [showSeasonalMenuModal, setShowSeasonalMenuModal] = useState(false);
  const [showSeasonalMenuList, setShowSeasonalMenuList] = useState(false);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [selectedSeasonalMenu, setSelectedSeasonalMenu] = useState<SeasonalMenu | null>(null);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [seasonalMenuManager, setSeasonalMenuManager] = useState<SeasonalMenuManager | null>(null);
  const [showSpecialMenuModal, setShowSpecialMenuModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPricingItem, setSelectedPricingItem] = useState<ConfigMenuItem | null>(null);

  // Form states
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");

  const [seasonalName, setSeasonalName] = useState("");
  const [seasonalDescription, setSeasonalDescription] = useState("");
  const [seasonalStartDate, setSeasonalStartDate] = useState("");
  const [seasonalEndDate, setSeasonalEndDate] = useState("");
  const [seasonalStartTime, setSeasonalStartTime] = useState("12:00");
  const [seasonalEndTime, setSeasonalEndTime] = useState("23:59");

  const [specialItemName, setSpecialItemName] = useState("");
  const [specialItemDescription, setSpecialItemDescription] = useState("");
  const [specialItemPrice, setSpecialItemPrice] = useState("");
  const [specialItemCategory, setSpecialItemCategory] = useState("");

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (seasonalMenus.length > 0) {
      setSeasonalMenuManager(createSeasonalMenuManager(seasonalMenus));
    }
  }, [seasonalMenus]);

  const { filteredItems } = useFilteredItems(
    menuItems,
    currentSeasonalMenu,
    selectedCategory,
    () => isHQ()
  );


  // Time-based filtering for customer view
  const { visible: timeVisibleItems, hidden: timeHiddenItems } = useTimeFilteredItems(
    filteredItems,
    seasonalMenus,
    () => isHQ()
  );

  // Count hidden items due to time restrictions
  const hiddenItemCount = useMemo(() => {
    return timeHiddenItems.length;
  }, [timeHiddenItems]);

  // Check if any seasonal menu items are currently available
  const hasActiveSeasonalItems = useMemo(() => {
    return timeVisibleItems.some(item => item.seasonalMenuId !== undefined);
  }, [timeVisibleItems]);

  // Handle edit price - opens the pricing modal
  // Memoized to prevent unnecessary re-renders of child components
  const handleEditPrice = useCallback((item: ConfigMenuItem) => {
    setSelectedPricingItem(item);
    setShowPricingModal(true);
  }, []);

  const renderMenuItem = useCallback(
    ({ item }: { item: ConfigMenuItem }) => {
      const canManageMenu = isHQ() && hasPermission("menu:delete");
      const canManagePricing = isBranch() && hasPermission("pricing:manage");
      return (
        <MenuItemCard
          item={item}
          items={items}
          stockItems={stockItems}
          seasonalMenus={seasonalMenus}
          theme={theme}
          onDelete={canManageMenu ? handleDeleteItem : undefined}
          onEditPrice={canManagePricing ? handleEditPrice : undefined}
        />
      );
    },
    [items, stockItems, seasonalMenus, theme, handleDeleteItem, handleEditPrice]
  );

  const onAddMenuItem = () => handleAddMenuItem(
    { name: newItemName, description: newItemDescription, price: newItemPrice, category: newItemCategory },
    () => {
      setShowAddMenuModal(false);
      setNewItemName("");
      setNewItemDescription("");
      setNewItemPrice("");
      setNewItemCategory("");
    }
  );

  const onAddSeasonalMenu = () => {
    if (!seasonalName || !seasonalStartDate || !seasonalEndDate) {
      Loggers.menu.warn("Please fill all required fields");
      return;
    }
    dispatch(addSeasonalMenu({
      name: seasonalName,
      description: seasonalDescription,
      startDate: seasonalStartDate,
      endDate: seasonalEndDate,
      startTime: seasonalStartTime,
      endTime: seasonalEndTime,
      isActive: true,
    }));
    setShowSeasonalMenuModal(false);
    setSeasonalName("");
    setSeasonalDescription("");
    setSeasonalStartDate("");
    setSeasonalEndDate("");
    Loggers.menu.info(`Created seasonal menu: ${seasonalName}`);
  };

  const onAddSpecialMenuItem = () => {
    if (!specialItemName || !specialItemPrice || !specialItemCategory) {
      Loggers.menu.warn("Please fill all required fields");
      return;
    }
    dispatch(addMenuItem({
      name: specialItemName,
      description: specialItemDescription,
      price: parseFloat(specialItemPrice),
      basePrice: parseFloat(specialItemPrice),
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      category: specialItemCategory,
      isAvailable: true,
      inStock: true,
    } as Omit<ConfigMenuItem, "id" | "createdAt" | "updatedAt">));
    setShowSpecialMenuModal(false);
    setSpecialItemName("");
    setSpecialItemDescription("");
    setSpecialItemPrice("");
    setSpecialItemCategory("");
    Loggers.menu.info(`Added special item: ${specialItemName}`);
  };

  const getAvailableItemsForSeasonalMenu = useCallback(() => {
    if (!selectedSeasonalMenu) return [];
    return menuItems.filter((item) => item.seasonalMenuId !== selectedSeasonalMenu.id);
  }, [menuItems, selectedSeasonalMenu]);

  const filteredAvailableItems = useCallback(() => {
    const availableItems = getAvailableItemsForSeasonalMenu();
    if (!itemSearchQuery.trim()) return availableItems;
    const lowerQuery = itemSearchQuery.toLowerCase();
    return availableItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.category.toLowerCase().includes(lowerQuery)
    );
  }, [getAvailableItemsForSeasonalMenu, itemSearchQuery]);

  const onAddItemToSeasonalMenu = useCallback((menuItem: ConfigMenuItem) => {
    if (!selectedSeasonalMenu) return;
    dispatch(assignItemToSeasonalMenu({ menuItemId: menuItem.id, seasonalMenuId: selectedSeasonalMenu.id }));
    Loggers.menu.info(`Added ${menuItem.name} to seasonal menu ${selectedSeasonalMenu.name}`);
  }, [dispatch, selectedSeasonalMenu]);

  const openAddItemsModal = useCallback((menu: SeasonalMenu) => {
    setSelectedSeasonalMenu(menu);
    setShowAddItemsModal(true);
  }, []);

  const onCartPress = useCallback(() => {
    if (isHQ()) setShowSeasonalMenuList(true);
    else if (isBranch()) setShowSpecialMenuModal(true);
    else safePush("cart");
  }, [safePush]);

  // Memoized handlers to prevent unnecessary re-renders
  const handleToggleTheme = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  const handleOpenAddMenuModal = useCallback(() => {
    setShowAddMenuModal(true);
  }, []);

  const handleClosePricingModal = useCallback(() => {
    setShowPricingModal(false);
    setSelectedPricingItem(null);
  }, []);

  // Memoized modal close handlers
  const handleCloseAddMenuModal = useCallback(() => setShowAddMenuModal(false), []);
  const handleCloseSeasonalMenuModal = useCallback(() => setShowSeasonalMenuModal(false), []);
  const handleCloseSeasonalMenuList = useCallback(() => setShowSeasonalMenuList(false), []);
  const handleCloseAddItemsModal = useCallback(() => setShowAddItemsModal(false), []);
  const handleCloseSpecialMenuModal = useCallback(() => setShowSpecialMenuModal(false), []);
  const handleCreateSeasonalMenuFromList = useCallback(() => {
    setShowSeasonalMenuList(false);
    setShowSeasonalMenuModal(true);
  }, []);


  // Use time-filtered items for customer view, otherwise use filtered items
  const displayItems = isUser() ? timeVisibleItems : (filteredItems.length > 0 ? filteredItems : SAMPLE_MENU_ITEMS);

  // Get display items for FlatList (same as displayItems but for proper typing)
  const getDisplayItems = () => displayItems;

  // Message for when items are hidden due to time restrictions
  const hiddenItemsMessage = useMemo(() => {
    if (!isUser() || hiddenItemCount === 0) return null;
    
    return {
      count: hiddenItemCount,
      message: `${hiddenItemCount} special menu ${hiddenItemCount === 1 ? 'item' : 'items'} only available during specific hours`
    };
  }, [hiddenItemCount]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SeasonalBanner currentSeasonalMenu={currentSeasonalMenu} seasonalMenuManager={seasonalMenuManager} />

      {categories.length > 0 && (
        <CategoryFilter 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
          theme={theme} 
        />
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Loading menu...</Text>
        </View>
      ) : (
        <FlatList
          data={displayItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={renderMenuItem}
          ListHeaderComponent={
            <MenuHeader 
              currentSeasonalMenu={currentSeasonalMenu} 
              user={user} 
              isLoggedIn={isLoggedIn} 
              theme={theme} 
              resolvedMode={resolvedMode}
              onToggleTheme={isBranch() ? handleToggleTheme : undefined}
              onAddMenuItem={isHQ() ? handleOpenAddMenuModal : undefined}
            />
          }
          ListEmptyComponent={
            isUser() && hiddenItemCount > 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyEmoji, { color: theme.text }]}>🕐</Text>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>Menu Unavailable</Text>
                <Text style={[styles.emptyMessage, { color: withOpacity(theme.text, 0.6) }]}>
                  Special menu items are only available during specific hours. Check back during menu hours!
                </Text>
                {hiddenItemCount > 0 && (
                  <Text style={[styles.hiddenCount, { color: withOpacity(theme.text, 0.5) }]}>
                    {hiddenItemCount} item{hiddenItemCount !== 1 ? 's' : ''} currently unavailable
                  </Text>
                )}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyEmoji, { color: theme.text }]}>🍽️</Text>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Items Available</Text>
                <Text style={[styles.emptyMessage, { color: withOpacity(theme.text, 0.6) }]}>
                  Check back soon for our delicious offerings!
                </Text>
              </View>
            )
          }
        />
      )}

      <CartButton totalItems={totalItems} onPress={onCartPress} />

      {/* Add Menu Item Modal */}
      <Modal visible={showAddMenuModal} animationType="slide" transparent onRequestClose={handleCloseAddMenuModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Menu Item</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Item Name *"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={newItemName}
              onChangeText={setNewItemName}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Description"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={newItemDescription}
              onChangeText={setNewItemDescription}
              multiline
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Price (₹) *"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={newItemPrice}
              onChangeText={setNewItemPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Category *"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={newItemCategory}
              onChangeText={setNewItemCategory}
            />
            <View style={styles.modalButtons}>
              <ModalButtons 
                onCancel={handleCloseAddMenuModal} 
                onConfirm={onAddMenuItem} 
                confirmLabel="Add Item" 
                theme={theme} 
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Seasonal Menu Modal */}
      <Modal visible={showSeasonalMenuModal} animationType="slide" transparent onRequestClose={handleCloseSeasonalMenuModal}>
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create Seasonal Menu</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Seasonal Menu Name *"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={seasonalName}
              onChangeText={setSeasonalName}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Description"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={seasonalDescription}
              onChangeText={setSeasonalDescription}
              multiline
            />
            <Text style={[styles.inputLabel, { color: theme.text }]}>Start Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="2024-12-01"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={seasonalStartDate}
              onChangeText={setSeasonalStartDate}
            />
            <Text style={[styles.inputLabel, { color: theme.text }]}>End Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="2024-12-31"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={seasonalEndDate}
              onChangeText={setSeasonalEndDate}
            />
            <Text style={[styles.inputLabel, { color: theme.text }]}>Start Time (HH:mm)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="12:00"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={seasonalStartTime}
              onChangeText={setSeasonalStartTime}
            />
            <Text style={[styles.inputLabel, { color: theme.text }]}>End Time (HH:mm)</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="23:59"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={seasonalEndTime}
              onChangeText={setSeasonalEndTime}
            />
            <View style={styles.modalButtons}>
              <ModalButtons 
                onCancel={handleCloseSeasonalMenuModal} 
                onConfirm={onAddSeasonalMenu} 
                confirmLabel="Create Menu" 
                theme={theme} 
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Seasonal Menu List Modal */}
      <Modal visible={showSeasonalMenuList} animationType="slide" transparent onRequestClose={handleCloseSeasonalMenuList}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Seasonal Menus</Text>
            {seasonalMenus.length === 0 ? (
              <Text style={[styles.emptyText, { color: withOpacity(theme.text, 0.5) }]}>No seasonal menus created yet</Text>
            ) : (
              seasonalMenus.map((menu) => (
                <View key={menu.id} style={[styles.seasonalMenuItem, { borderColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.seasonalMenuName, { color: theme.text }]}>{menu.name}</Text>
                    <Text style={[styles.seasonalMenuDate, { color: withOpacity(theme.text, 0.5) }]}>{menu.startDate} - {menu.endDate}</Text>
                    <Text style={[styles.seasonalMenuTime, { color: withOpacity(theme.text, 0.5) }]}>
                      {seasonalMenuManager?.formatTimeRange(menu.startTime, menu.endTime)}
                    </Text>
                  </View>
                  <View style={styles.seasonalMenuActions}>
                    <Switch 
                      value={menu.isActive} 
                      onValueChange={() => {}} 
                      trackColor={{ false: "#767577", true: theme.primary }} 
                      thumbColor="#FFFFFF" 
                    />
                    <ActionButton 
                      title="+ Items" 
                      onPress={() => openAddItemsModal(menu)} 
                      variant="accent" 
                      theme={theme} 
                    />
                    <ActionButton 
                      title="Delete" 
                      onPress={() => dispatch(deleteSeasonalMenu(menu.id))} 
                      variant="danger" 
                      theme={theme} 
                    />
                  </View>
                </View>
              ))
            )}
            <ActionButton 
              title="+ Create Seasonal Menu" 
              onPress={handleCreateSeasonalMenuFromList} 
              variant="primary" 
              theme={theme} 
              style={{ marginTop: 16 }} 
            />
            <ActionButton 
              title="Close" 
              onPress={handleCloseSeasonalMenuList} 
              variant="muted" 
              theme={theme} 
              style={{ marginTop: 8 }} 
            />
          </View>
        </View>
      </Modal>

      {/* Add Items to Seasonal Menu Modal */}
      <Modal visible={showAddItemsModal} animationType="slide" transparent onRequestClose={handleCloseAddItemsModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Items to {selectedSeasonalMenu?.name}</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Search items..."
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={itemSearchQuery}
              onChangeText={setItemSearchQuery}
            />
            <ScrollView style={styles.itemsListContainer}>
              {filteredAvailableItems().length === 0 ? (
                <Text style={[styles.emptyText, { color: withOpacity(theme.text, 0.5) }]}>
                  {itemSearchQuery.trim() ? "No items match" : "All items added"}
                </Text>
              ) : (
                filteredAvailableItems().map((item) => (
                  <View key={item.id} style={[styles.menuItemRow, { borderColor: theme.border }]}>
                    <View style={styles.menuItemInfo}>
                      <Text style={[styles.menuItemName, { color: theme.text }]}>{item.name}</Text>
                      <Text style={[styles.menuItemCategory, { color: withOpacity(theme.text, 0.5) }]}>{item.category}</Text>
                    </View>
                    <View style={styles.menuItemActions}>
                      <Text style={[styles.menuItemPrice, { color: theme.accent }]}>₹{item.price.toFixed(2)}</Text>
                      <ActionButton 
                        title="Add" 
                        onPress={() => onAddItemToSeasonalMenu(item)} 
                        variant="primary" 
                        theme={theme} 
                      />
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
            <ActionButton 
              title="Done" 
              onPress={handleCloseAddItemsModal} 
              variant="muted" 
              theme={theme} 
              style={{ marginTop: 16 }} 
            />
          </View>
        </View>
      </Modal>

      {/* Special Menu Modal (Branch) */}
      <Modal visible={showSpecialMenuModal} animationType="slide" transparent onRequestClose={handleCloseSpecialMenuModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Special Food Item</Text>
            <Text style={[styles.modalSubtitle, { color: withOpacity(theme.text, 0.5) }]}>
              Add a special item to the menu with custom pricing
            </Text>
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Food Name *"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={specialItemName}
              onChangeText={setSpecialItemName}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Description"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={specialItemDescription}
              onChangeText={setSpecialItemDescription}
              multiline
              numberOfLines={3}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Price (₹) *"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={specialItemPrice}
              onChangeText={setSpecialItemPrice}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text }]}
              placeholder="Category * (e.g., Main Course, Appetizer, Special)"
              placeholderTextColor={withOpacity(theme.text, 0.5)}
              value={specialItemCategory}
              onChangeText={setSpecialItemCategory}
            />
            <ModalButtons 
              onCancel={handleCloseSpecialMenuModal} 
              onConfirm={onAddSpecialMenuItem} 
              confirmLabel="Add Special" 
              theme={theme} 
            />
          </View>
        </View>
      </Modal>

      {/* Branch Pricing Modal */}
      <BranchPricingModal
        visible={showPricingModal}
        onClose={handleClosePricingModal}
        item={selectedPricingItem}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", maxHeight: "80%", borderRadius: 16, padding: 20, elevation: 8 },
  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  modalSubtitle: { fontSize: 14, marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 8 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 16 },
  seasonalMenuItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  seasonalMenuName: { fontSize: 16, fontWeight: "600" },
  seasonalMenuDate: { fontSize: 12, marginTop: 4 },
  seasonalMenuTime: { fontSize: 12, marginTop: 2 },
  seasonalMenuActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  emptyText: { fontSize: 16, textAlign: "center", marginVertical: 20 },
  itemsListContainer: { maxHeight: 400, marginVertical: 12 },
  menuItemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 16, fontWeight: "600" },
  menuItemCategory: { fontSize: 12, marginTop: 2 },
  menuItemActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuItemPrice: { fontSize: 16, fontWeight: "600" },
  emptyContainer: { padding: 40, alignItems: "center", justifyContent: "center" },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8, textAlign: "center" },
  emptyMessage: { fontSize: 14, textAlign: "center", marginBottom: 8 },
  hiddenCount: { fontSize: 12, fontStyle: "italic" },
});

