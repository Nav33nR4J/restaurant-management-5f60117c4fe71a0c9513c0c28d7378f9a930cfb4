import React, { memo, useCallback } from "react";
import { StyleProp, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { componentStyles } from "../../../theme/promotions/styles";
import { useTheme } from "../../../theme/promotions/ThemeProvider";

interface CheckboxProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const CheckboxComponent: React.FC<CheckboxProps> = ({
  value,
  onValueChange,
  disabled = false,
  color = "#4CAF50",
  size = 24,
  style,
}: CheckboxProps) => {
  const { theme } = useTheme();

  const handlePress = useCallback(() => {
    if (!disabled) {
      onValueChange(!value);
    }
  }, [disabled, onValueChange, value]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        componentStyles.checkbox.container,
        style,
        {
          width: size,
          height: size,
          borderColor: disabled ? "#ccc" : value ? color : theme.border,
          backgroundColor: value ? color : "transparent",
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {value && (
        <View style={componentStyles.checkbox.checkmark}>
          <Text style={[componentStyles.checkbox.checkmarkText, { fontSize: size * 0.7 }]}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const Checkbox = memo(CheckboxComponent);
