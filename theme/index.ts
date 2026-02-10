import { Flavor } from "../config/config";

// Import from colors and content modules
import { getTheme, Theme, themeColors } from "./colors";
import { flavorContent, getFlavorContent } from "./content";

// Re-export colors and content
export * from "./colors";
export * from "./content";

// Re-export helper functions from their modules (using proper syntax)
export { flavorContent, getFlavorContent, getTheme, Theme, themeColors };

// Helper to get the full theme object (colors + content)
export function getFullTheme(flavor: Flavor, mode: "light" | "dark") {
  const theme = getTheme(flavor, mode);
  const content = getFlavorContent(flavor);
  return {
    ...theme,
    content,
  };
}
