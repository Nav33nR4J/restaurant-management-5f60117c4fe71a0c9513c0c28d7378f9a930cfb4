import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useTheme } from "../../../theme/promotions/ThemeProvider";
import { componentStyles } from "../../../theme/promotions/styles";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const Button = ({ title, onPress, disabled, loading, style }: ButtonProps) => {
  const { theme } = useTheme();

  const containerStyle = [
    componentStyles.button.container,
    disabled && { opacity: 0.6 },
    style,
  ];

  return (
    <LinearGradient
      colors={[theme.gradientStart, theme.gradientEnd]}
      style={containerStyle}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <TouchableOpacity
        onPress={onPress}
        style={componentStyles.button.inner}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={componentStyles.button.text}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
};
