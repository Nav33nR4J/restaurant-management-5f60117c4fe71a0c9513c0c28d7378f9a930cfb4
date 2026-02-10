import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { componentStyles } from "../../styles";

interface QuantityControlProps {
  /** Current quantity */
  quantity: number;
  /** Callback when increase button is pressed */
  onIncrease: () => void;
  /** Callback when decrease button is pressed */
  onDecrease: () => void;
  /** Theme colors object */
  theme: {
    primary: string;
    text: string;
  };
  /** Minimum quantity (default: 0) */
  minQuantity?: number;
  /** Whether the controls are disabled */
  disabled?: boolean;
  /** Optional size variant */
  size?: "small" | "medium" | "large";
  /** Optional custom styles */
  style?: object;
}

/**
 * Reusable quantity control component with - / quantity / + buttons.
 * Used in cart, menu items, and anywhere quantity adjustment is needed.
 */
export const QuantityControl = memo(function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  theme,
  minQuantity = 0,
  disabled,
  size = "medium",
  style,
}: QuantityControlProps) {
  const getSizeValues = useCallback(() => {
    switch (size) {
      case "small":
        return { circle: 28, font: 16 };
      case "large":
        return { circle: 40, font: 24 };
      default:
        return { circle: 32, font: 20 };
    }
  }, [size]);

  const { circle, font } = getSizeValues();
  const canDecrease = quantity > minQuantity && !disabled;

  // Flatten styles for proper merging
  const controlsStyle = StyleSheet.flatten([componentStyles.quantityControl.controls, style]);
  const circleStyle = StyleSheet.flatten([
    componentStyles.quantityControl.circle,
    {
      backgroundColor: theme.primary,
      width: circle,
      height: circle,
      borderRadius: circle / 2,
    },
    !canDecrease && componentStyles.quantityControl.disabled,
  ]);

  return (
    <View style={controlsStyle}>
      <Pressable
        onPress={onDecrease}
        style={circleStyle}
        disabled={!canDecrease}
      >
        <Text style={[componentStyles.quantityControl.controlText, { fontSize: font }]}>−</Text>
      </Pressable>

      <Text
        style={[
          componentStyles.quantityControl.qty,
          {
            color: theme.text,
            fontSize: size === "small" ? 14 : 16,
            minWidth: size === "small" ? 16 : 20,
          },
        ]}
      >
        {quantity}
      </Text>

      <Pressable
        onPress={onIncrease}
        style={StyleSheet.flatten([
          componentStyles.quantityControl.circle,
          {
            backgroundColor: theme.primary,
            width: circle,
            height: circle,
            borderRadius: circle / 2,
          },
          disabled && componentStyles.quantityControl.disabled,
        ])}
        disabled={disabled}
      >
        <Text style={[componentStyles.quantityControl.controlText, { fontSize: font }]}>+</Text>
      </Pressable>
    </View>
  );
});

