// Promotions theme colors aligned with the central app's HQ flavor theme
export const colors = {
  light: {
    background: "#F8FAFC",
    card: "#FFFFFF",
    text: "#0F172A",
    textSecondary: "#6C757D",
    border: "#E2E8F0",
    primary: "#7C3AED",
    primaryLight: "#A78BFA",
    secondary: "#E11D48",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    gradientStart: "#8B5CF6",
    gradientEnd: "#7C3AED",
  },
  dark: {
    background: "#0A061A",
    card: "#1E1B3A",
    text: "#FFFFFF",
    textSecondary: "#A0AEC0",
    border: "#4C1D95",
    primary: "#8B5CF6",
    primaryLight: "#C4B5FD",
    secondary: "#F43F5E",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    gradientStart: "#8B5CF6",
    gradientEnd: "#7C3AED",
  },
};

export type ThemeColors = typeof colors.light;
