export const colors = {
  light: {
    background: "#F8F9FA",
    card: "#FFFFFF",
    text: "#212529",
    textSecondary: "#6C757D",
    border: "#DEE2E6",
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
    background: "#1A1A2E",
    card: "#16213E",
    text: "#FFFFFF",
    textSecondary: "#A0AEC0",
    border: "#2D3748",
    primary: "#8B5CF6",
    primaryLight: "#A78BFA",
    secondary: "#F43F5E",
    success: "#34D399",
    warning: "#FBBF24",
    error: "#F87171",
    gradientStart: "#8B5CF6",
    gradientEnd: "#7C3AED",
  },
};

export type ThemeColors = typeof colors.light;
