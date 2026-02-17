import { TextStyle, ViewStyle } from "react-native";

export const componentStyles = {
  button: {
    container: {
      borderRadius: 12,
      overflow: "hidden",
    } as ViewStyle,
    inner: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
    text: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    } as TextStyle,
  },
  input: {
    container: {
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      borderWidth: 1,
      borderColor: "transparent",
    } as ViewStyle,
  },
  checkbox: {
    container: {
      width: 24,
      height: 24,
      borderRadius: 6,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
    checkmark: {
      alignItems: "center",
      justifyContent: "center",
    } as ViewStyle,
    checkmarkText: {
      color: "#FFFFFF",
      fontWeight: "bold",
    } as TextStyle,
  },
  text: {
    base: {
      fontSize: 16,
    } as TextStyle,
    title: {
      fontSize: 20,
      fontWeight: "700",
    } as TextStyle,
    subtitle: {
      fontSize: 14,
      fontWeight: "400",
    } as TextStyle,
  },
};

export const appStyles = {
  homeScreen: {
    container: { flex: 1 } as ViewStyle,
    headerGradient: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 } as ViewStyle,
    headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" } as ViewStyle,
    headerTitle: { fontSize: 28, fontWeight: "800", color: "#FFFFFF" } as TextStyle,
    headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 4 } as TextStyle,
    themeButton: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" } as ViewStyle,
    themeButtonIconStack: { position: "relative", width: 24, height: 24 } as ViewStyle,
    themeButtonIcon: { fontSize: 22, position: "absolute" } as TextStyle,
    themeIconLayer: {} as ViewStyle,
    createButtonContainer: { padding: 20, position: "absolute", bottom: 0, left: 0, right: 0 } as ViewStyle,
    createButton: { borderRadius: 12 } as ViewStyle,
    floatingButton: { position: "absolute", bottom: 100, right: 20, width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 } as ViewStyle,
    floatingButtonText: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" } as TextStyle,
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" } as ViewStyle,
    modalContent: { width: "85%", borderRadius: 16, padding: 20 } as ViewStyle,
    modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16, textAlign: "center" } as TextStyle,
    validateButton: { paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 16 } as ViewStyle,
    validateButtonDisabled: { opacity: 0.6 } as ViewStyle,
    validateButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" } as TextStyle,
    statusContainer: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginTop: 16, alignItems: "center" } as ViewStyle,
    statusEnabled: { backgroundColor: "rgba(16, 185, 129, 0.2)" } as ViewStyle,
    statusDisabled: { backgroundColor: "rgba(245, 158, 11, 0.2)" } as ViewStyle,
    statusInvalid: { backgroundColor: "rgba(239, 68, 68, 0.2)" } as ViewStyle,
    statusText: { fontSize: 14, fontWeight: "600" } as TextStyle,
    statusTextEnabled: { color: "#10B981" } as TextStyle,
    statusTextDisabled: { color: "#F59E0B" } as TextStyle,
    statusTextInvalid: { color: "#EF4444" } as TextStyle,
    closeButton: { marginTop: 16, alignItems: "center", paddingVertical: 12 } as ViewStyle,
    closeButtonText: { fontSize: 16, fontWeight: "500" } as TextStyle,
  },
  createPromotionScreen: {
    container: { flex: 1 } as ViewStyle,
    headerGradient: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 } as ViewStyle,
    headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" } as ViewStyle,
    backButton: { marginRight: 16, padding: 8 } as ViewStyle,
    backButtonText: { fontSize: 24, color: "#FFFFFF", fontWeight: "600" } as TextStyle,
    placeholder: { width: 40 } as ViewStyle,
    headerTitle: { fontSize: 24, fontWeight: "700", color: "#FFFFFF" } as TextStyle,
    scrollContent: { padding: 16, paddingBottom: 40 } as ViewStyle,
    formContainer: { flex: 1, padding: 20 } as ViewStyle,
    formTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12, marginTop: 16 } as TextStyle,
    input: { borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, marginBottom: 12, borderWidth: 1 } as ViewStyle,
    row: { flexDirection: "row", gap: 12 } as ViewStyle,
    halfInput: { flex: 1 } as ViewStyle,
    switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)" } as ViewStyle,
    switchLabel: { fontSize: 16, fontWeight: "500" } as TextStyle,
    switchDescription: { fontSize: 12, marginTop: 2 } as TextStyle,
    createButtonContainer: { padding: 20 } as ViewStyle,
    createButton: { borderRadius: 12 } as ViewStyle,
  },
};

export const getHomeScreenModalThemeStyles = (theme: any, isDark: boolean) => {
  return {
    container: {
      backgroundColor: theme.background,
    },
    themeButton: {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
    },
    floatingButton: {
      backgroundColor: theme.primary,
    },
    modalContent: {
      backgroundColor: theme.card,
    },
    modalTitle: {
      color: theme.text,
    },
    input: {
      backgroundColor: theme.background,
      color: theme.text,
      borderColor: theme.border,
    },
    validateButton: {
      backgroundColor: theme.primary,
    },
    closeButtonText: {
      color: theme.textSecondary,
    },
  };
};

export const getCreatePromotionScreenStyles = (theme: any, isDark: boolean) => {
  return {
    container: {
      backgroundColor: theme.background,
    },
    input: {
      backgroundColor: theme.card,
      color: theme.text,
      borderColor: theme.border,
    },
    formTitle: {
      color: theme.text,
    },
    switchRow: {
      borderBottomColor: theme.border,
    },
    switchLabel: {
      color: theme.text,
    },
    switchDescription: {
      color: theme.textSecondary,
    },
    createButton: {
      backgroundColor: theme.primary,
    },
  };
};
