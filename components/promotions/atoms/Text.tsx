import React from "react";
import { Text as RNText, TextProps } from "react-native";
import { useTheme } from "../../../theme/promotions/ThemeProvider";

export const Text = ({ style, ...props }: TextProps) => {
  const { theme } = useTheme();
  return <RNText style={[{ color: theme.text }, style]} {...props} />;
};

