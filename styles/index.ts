/**
 * Consolidated Styles for Restaurant Management App
 * 
 * All styles are organized by namespace:
 * - shared: Common reusable styles used across components
 * - components: Component-specific styles
 * - app: Page-specific styles
 */

import { StyleSheet } from 'react-native';

// =============================================================================
// SHARED STYLES - Common reusable styles
// =============================================================================

export const sharedStyles = StyleSheet.create({
  // Modal overlay (common across all modals)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal content container
  modalContent: {
    width: "90%",
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },

  // Modal title
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  // Form input (common)
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },

  // Modal buttons container
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },

  // Primary modal button
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },

  // Modal button text
  modalButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },

  // Circle button (controls)
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  // Circle button text (plus/minus)
  controlText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
  },

  // Quantity text
  qty: {
    fontSize: 16,
    fontWeight: "600",
    minWidth: 20,
    textAlign: "center",
  },

  // Card container
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    flexDirection: "row",
    elevation: 2,
  },

  // Primary action button
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  // Add button text
  addText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },

  // Delete button
  deleteButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  // Delete button text
  deleteText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },

  // Stock indicator
  stockIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  // Stock indicator text
  stockText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "600",
  },

  // Controls row
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  // Item price
  itemPrice: {
    fontSize: 18,
    fontWeight: "700",
  },

  // Base price (strikethrough)
  basePrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
  },

  // Loading container
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Loading text
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },

  // Row layout
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  // Row layout (tight)
  rowTight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  // Badge
  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Badge text
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },

  // Error text
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },

  // Empty text
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 20,
  },
});

// =============================================================================
// COMPONENT STYLES - Component-specific styles
// =============================================================================

// Using type assertion to allow nested style objects that TypeScript
// would normally reject for StyleSheet.create()
const componentStylesRaw = {
  // --- MenuCard ---
  menuCard: {
    container: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
    },
    content: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
    },
    pressable: {
      padding: 8,
      borderRadius: 8,
    },
    quantity: {
      marginHorizontal: 16,
      fontSize: 16,
    },
  },

  // --- MenuItemCard ---
  menuItemCard: {
    card: {
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      flexDirection: "row",
      elevation: 2,
    },
    stockControlsContainer: {
      position: "absolute",
      bottom: 10,
      right: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    stockIndicator: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    stockText: {
      color: "#FFF",
      fontSize: 10,
      fontWeight: "600",
    },
    itemImage: {
      width: 90,
      height: 90,
      borderRadius: 10,
    },
    itemContent: {
      flex: 1,
      paddingLeft: 14,
      justifyContent: "center",
    },
    itemHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    itemName: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 4,
      flex: 1,
    },
    itemDesc: {
      fontSize: 13,
      marginBottom: 12,
    },
    itemPrice: {
      fontSize: 18,
      fontWeight: "700",
    },
    seasonalBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    seasonalBadgeText: {
      color: "#FFF",
      fontSize: 10,
      fontWeight: "600",
    },
  },

  // --- CategoryFilter ---
  categoryFilter: {
    categoryContainer: {
      maxHeight: 48,
      marginBottom: 8,
    },
    categoryContent: {
      paddingHorizontal: 16,
      gap: 8,
    },
  },

  // --- CategoryChip ---
  categoryChip: {
    container: {
      flexDirection: "row",
      paddingHorizontal: 16,
      gap: 8,
      marginBottom: 8,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginRight: 8,
      gap: 4,
    },
    icon: {
      marginBottom: -1,
    },
    text: {
      fontWeight: "600",
      fontSize: 12,
    },
  },

  // --- ProfileModal ---
  profileModal: {
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    modalBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 34,
      maxHeight: "85%",
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 200,
      paddingVertical: 40,
    },
    loadingText: {
      fontSize: 16,
      opacity: 0.7,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: "rgba(0,0,0,0.1)",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
    },
    profileHeader: {
      alignItems: "center",
      paddingVertical: 20,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 12,
    },
    userName: {
      fontSize: 22,
      fontWeight: "700",
      marginBottom: 8,
    },
    profileInfoContainer: {
      width: "100%",
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    infoText: {
      fontSize: 12,
      marginLeft: 6,
      flex: 1,
    },
    editButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    editButtonText: {
      color: "#FFF",
      fontWeight: "600",
      fontSize: 14,
    },
    scrollView: {
      flex: 1,
    },
    fieldsContainer: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
    fieldWrapper: {
      flex: 1,
    },
    fieldWrapperLeft: {
      marginRight: 8,
    },
    fieldWrapperRight: {
      marginLeft: 8,
    },
    fieldContainer: {
      marginBottom: 16,
    },
    fieldLabel: {
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    fieldInput: {
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      borderWidth: 1,
    },
    addressInput: {
      minHeight: 80,
      paddingTop: 12,
    },
    actionButtons: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    saveButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
    },
    saveButtonText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "600",
    },
    logoutContainer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: "600",
    },
  },

  // --- SeasonalMenuModal ---
  seasonalMenuModal: {
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      maxHeight: "80%",
      borderRadius: 16,
      padding: 20,
      elevation: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 8,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      marginTop: 8,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 8,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 16,
    },
    seasonalMenuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    seasonalMenuName: {
      fontSize: 16,
      fontWeight: "600",
    },
    seasonalMenuDate: {
      fontSize: 12,
      marginTop: 4,
    },
    seasonalMenuTime: {
      fontSize: 12,
      marginTop: 2,
    },
    seasonalMenuActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    addSeasonalButton: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginTop: 16,
    },
    addSeasonalButtonText: {
      color: "#FFF",
      fontWeight: "600",
      fontSize: 16,
      textAlign: "center",
    },
    emptyText: {
      fontSize: 16,
      textAlign: "center",
      marginVertical: 20,
    },
    addItemButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 8,
    },
    addItemButtonText: {
      color: "#FFF",
      fontWeight: "600",
      fontSize: 12,
    },
  },

  // --- SpecialMenuModal ---
  specialMenuModal: {
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      width: "90%",
      borderRadius: 16,
      padding: 20,
      elevation: 8,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 14,
      marginBottom: 16,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      marginBottom: 8,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 16,
    },
  },

  // --- ActionButton ---
  actionButton: {
    button: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
    },
    text: {
      fontWeight: "600",
      fontSize: 16,
    },
    disabled: {
      opacity: 0.6,
    },
    modalButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 12,
      marginTop: 16,
    },
  },

  // --- QuantityControl ---
  quantityControl: {
    controls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    circle: {
      alignItems: "center",
      justifyContent: "center",
    },
    controlText: {
      color: "#FFF",
      fontWeight: "700",
    },
    qty: {
      fontWeight: "600",
      textAlign: "center",
    },
    disabled: {
      opacity: 0.5,
    },
  },

  // --- ErrorBoundary ---
  errorBoundary: {
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F9FAFB",
      padding: 20,
    },
    errorCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 24,
      alignItems: "center",
      maxWidth: 400,
      width: "100%",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1F2937",
      marginTop: 16,
      textAlign: "center",
    },
    message: {
      fontSize: 14,
      color: "#6B7280",
      marginTop: 8,
      textAlign: "center",
    },
    devInfo: {
      marginTop: 16,
      padding: 12,
      backgroundColor: "#F3F4F6",
      borderRadius: 8,
      width: "100%",
    },
    devTitle: {
      fontSize: 12,
      fontWeight: "600",
      color: "#4B5563",
      marginBottom: 4,
    },
    stackTrace: {
      fontSize: 10,
      color: "#9CA3AF",
      fontFamily: __DEV__ ? "monospace" : undefined,
    },
    buttonContainer: {
      flexDirection: "row",
      marginTop: 24,
      gap: 12,
    },
    button: {
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      minWidth: 120,
    },
    retryButton: {
      backgroundColor: "#7C3AED",
    },
    reloadButton: {
      backgroundColor: "#6B7280",
    },
    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
  },
};

// Export componentStyles with proper typing
export const componentStyles = StyleSheet.create(componentStylesRaw as any);

// =============================================================================
// APP STYLES - Page-specific styles
// =============================================================================

const appStylesRaw = {
  // --- Home (index) ---
  home: {
    container: {
      flex: 1,
    },
    themeToggle: {
      marginTop: 12,
    },
    themeToggleText: {
      opacity: 0.7,
    },
    hero: {
      height: "100%",
      justifyContent: "flex-end",
    },
    heroContent: {
      padding: 24,
    },
    brand: {
      fontSize: 42,
      fontWeight: "800",
    },
    tagline: {
      fontSize: 18,
      marginTop: 12,
    },
    flavorSelector: {
      marginTop: 24,
    },
    flavorLabel: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      opacity: 0.8,
    },
    flavorButtons: {
      flexDirection: "row",
      gap: 8,
    },
    flavorButton: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 20,
      borderWidth: 1,
    },
    flavorButtonText: {
      fontSize: 14,
      fontWeight: "600",
    },
    cta: {
      marginTop: 24,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
    },
    ctaText: {
      color: "#FFF",
      fontSize: 16,
      fontWeight: "600",
    },
  },

  // --- Menu ---
  menu: {
    container: {
      flex: 1,
    },
    header: {
      paddingVertical: 16,
      marginBottom: 8,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
    },
    locationText: {
      fontSize: 14,
      marginBottom: 4,
    },
    headerAction: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
    },
    headerActionText: {
      color: "#FFF",
      fontWeight: "600",
      fontSize: 14,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
    },
    dbErrorBanner: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
    },
    dbErrorText: {
      flex: 1,
      fontSize: 14,
      fontWeight: "600",
    },
    seasonalBanner: {
      padding: 12,
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 12,
    },
    seasonalBannerTitle: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: "700",
    },
    seasonalBannerSubtitle: {
      color: "#FFF",
      fontSize: 14,
      opacity: 0.9,
    },
    seasonalBannerTime: {
      color: "#FFF",
      fontSize: 12,
      marginTop: 4,
      opacity: 0.8,
    },
    cartButton: {
      position: "absolute",
      bottom: 24,
      right: 24,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 30,
      elevation: 8,
    },
    cartText: {
      color: "#FFF",
      fontWeight: "700",
      fontSize: 16,
    },
    itemsListContainer: {
      maxHeight: 400,
      marginVertical: 12,
    },
    menuItemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
    },
    menuItemInfo: {
      flex: 1,
    },
    menuItemName: {
      fontSize: 16,
      fontWeight: "600",
    },
    menuItemCategory: {
      fontSize: 12,
      marginTop: 2,
    },
    menuItemActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    menuItemPrice: {
      fontSize: 16,
      fontWeight: "600",
    },
  },

  // --- Cart ---
  cart: {
    container: {
      flex: 1,
    },
    card: {
      borderRadius: 18,
      padding: 18,
      marginBottom: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 6,
    },
    name: {
      fontSize: 17,
      fontWeight: "700",
      marginBottom: 4,
    },
    price: {
      fontSize: 15,
      fontWeight: "600",
    },
    checkoutBar: {
      position: "absolute",
      bottom: 16,
      left: 16,
      right: 16,
      borderRadius: 20,
      padding: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      elevation: 20,
    },
    totalLabel: {
      color: "#FFF",
      fontSize: 14,
      opacity: 0.85,
    },
    totalAmount: {
      color: "#FFF",
      fontSize: 22,
      fontWeight: "800",
    },
    checkoutText: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: "800",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyText: {
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 20,
    },
  },

  // --- Order ---
  order: {
    container: {
      flex: 1,
    },
    orderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 24,
    },
    orderCard: {
      backgroundColor: "transparent",
      alignItems: "center",
      maxWidth: 320,
    },
    iconContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    orderTitle: {
      fontSize: 28,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 12,
    },
    orderSubtitle: {
      fontSize: 16,
      textAlign: "center",
      marginBottom: 32,
      lineHeight: 24,
    },
    orderButton: {
      flexDirection: "row",
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    orderButtonText: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: "600",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
      gap: 12,
    },
    scrollContent: {
      padding: 20,
      paddingTop: 40,
      minHeight: "100%",
      flexGrow: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
    },
    formContainer: {
      gap: 16,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginLeft: 4,
    },
    input: {
      padding: 14,
      borderRadius: 12,
      fontSize: 16,
    },
    errorText: {
      fontSize: 12,
      marginLeft: 4,
      marginTop: 2,
    },
  },

  // --- Order Success ---
  orderSuccess: {
    container: {
      flex: 1,
    },
    successContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    iconWrapper: {
      marginBottom: 32,
    },
    successIcon: {
      width: 120,
      height: 120,
      borderRadius: 60,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 20,
    },
    successTitle: {
      fontSize: 28,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 12,
    },
    successSubtitle: {
      fontSize: 16,
      textAlign: "center",
      opacity: 0.8,
      marginBottom: 24,
      lineHeight: 24,
    },
    messageContainer: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      borderWidth: 1,
    },
    funnyMessage: {
      fontSize: 15,
      textAlign: "center",
      lineHeight: 24,
      fontStyle: "italic",
    },
    confettiContainer: {
      position: "absolute",
      top: 100,
      left: 0,
      right: 0,
      height: 200,
      overflow: "hidden",
    },
    confetti: {
      position: "absolute",
      width: 10,
      height: 10,
      borderRadius: 5,
      top: -20,
    },
    buttonContainer: {
      paddingHorizontal: 24,
      paddingBottom: 48,
      gap: 16,
    },
    orderButton: {
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 10,
    },
    pressable: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 18,
      paddingHorizontal: 24,
    },
    orderButtonText: {
      color: "#FFF",
      fontSize: 18,
      fontWeight: "700",
    },
  },

  // --- Layout ---
  layout: {
    profileIconContainer: {
      padding: 4,
    },
    profileIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: "center",
      alignItems: "center",
    },
  },
};

// Export appStyles with proper typing
export const appStyles = StyleSheet.create(appStylesRaw as any);

// =============================================================================
// DEFAULT EXPORT - For easy importing
// =============================================================================

export default {
  ...sharedStyles,
  ...componentStyles,
  ...appStyles,
};

