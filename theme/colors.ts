/**
 * Theme Colors
 * Color definitions for each flavor (user, hq, branch) and mode (light, dark)
 */

import { Flavor } from "../config/config";

// Theme colors for each flavor and mode
export const themeColors = {
  user: {
    light: {
      background: "#FFFFFF",
      text: "#111111",
      primary: "#DC2626",
      accent: "#EF4444",
      muted: "#F5F5F5",
      card: ["#FFFFFF", "#F5F5F5"] as [string, string, ...string[]],
      border: "#E5E5E5",
    },
    dark: {
      background: "#0B0B0B",
      text: "#FFFFFF",
      primary: "#DC2626",
      accent: "#F87171",
      muted: "#1A1A1A",
      card: ["#1A1A1A", "#262626"] as [string, string, ...string[]],
      border: "#404040",
    },
  },

  hq: {
    light: {
      background: "#F8FAFC",
      text: "#0F172A",
      primary: "#7C3AED",
      accent: "#A78BFA",
      muted: "#EEF2FF",
      card: ["#FFFFFF", "#EEF2FF"] as [string, string, ...string[]],
      border: "#E2E8F0",
    },
    dark: {
      background: "#0A061A",
      text: "#FFFFFF",
      primary: "#8B5CF6",
      accent: "#C4B5FD",
      muted: "#1E1B3A",
      card: ["#1E1B3A", "#2D2A5C"] as [string, string, ...string[]],
      border: "#4C1D95",
    },
  },

  branch: {
    light: {
      background: "#F9FAFB",
      text: "#0F172A",
      primary: "#2563EB",
      accent: "#60A5FA",
      muted: "#EFF6FF",
      card: ["#FFFFFF", "#EFF6FF"] as [string, string, ...string[]],
      border: "#E2E8F0",
    },
    dark: {
      background: "#020617",
      text: "#FFFFFF",
      primary: "#3B82F6",
      accent: "#93C5FD",
      muted: "#0F172A",
      card: ["#0F172A", "#1E293B"] as [string, string, ...string[]],
      border: "#1E3A8A",
    },
  },
};

// Theme type
export type Theme = typeof themeColors.user.light;

// Get theme for a specific flavor and mode
export function getTheme(
  flavor: Flavor,
  mode: "light" | "dark"
): Theme {
  const flavorKey = flavor.toLowerCase() as keyof typeof themeColors;
  return themeColors[flavorKey][mode];
}

export default themeColors;

