import React, { createContext, ReactNode, useContext } from "react";
import { useColorScheme } from "react-native";
import { useAppSelector } from "../../store/hooks";
import { colors, ThemeColors } from "./colors";

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const system = useColorScheme() ?? "light";
  const storeMode = useAppSelector((state) => state.theme.mode);
  const resolvedMode = storeMode === "light" || storeMode === "dark" ? storeMode : system;
  const isDark = resolvedMode === "dark";
  const theme = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ theme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
