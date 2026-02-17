import React from "react";
import { TextInput, TextInputProps } from "react-native";
import { useTheme } from "../../../theme/promotions/ThemeProvider";
import { componentStyles } from "../../../theme/promotions/styles";

interface InputProps extends TextInputProps {
  placeholder: string;
  style?: any;
}

export const Input = ({ style, ...props }: InputProps) => {
  const { theme } = useTheme();
  return (
    <TextInput
      {...props}
      style={[componentStyles.input.container, { backgroundColor: theme.card, color: theme.text }, style]}
      placeholderTextColor={theme.textSecondary}
    />
  );
};
