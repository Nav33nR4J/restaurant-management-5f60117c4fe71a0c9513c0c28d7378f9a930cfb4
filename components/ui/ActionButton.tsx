import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { componentStyles } from "../../styles";

// Button variants type
export type ButtonVariant = "primary" | "muted" | "danger" | "accent";

interface ActionButtonProps {
  /** Button label text */
  title: string;
  /** Callback when button is pressed */
  onPress: () => void;
  /** Button style variant */
  variant?: ButtonVariant;
  /** Optional icon to show before the text */
  icon?: React.ReactNode;
  /** Optional icon to show after the text */
  iconAfter?: React.ReactNode;
  /** Custom styles for the button container */
  style?: object;
  /** Custom styles for the text */
  textStyle?: object;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Theme colors object */
  theme: {
    primary: string;
    muted: string;
    text: string;
    accent?: string;
  };
}

/**
 * Reusable ActionButton component with variant support.
 * Replaces repetitive button code throughout the app.
 */
export const ActionButton = memo(function ActionButton({
  title,
  onPress,
  variant = "primary",
  icon,
  iconAfter,
  style,
  textStyle,
  disabled,
  theme,
}: ActionButtonProps) {
  const getBackgroundColor = useCallback(() => {
    switch (variant) {
      case "primary":
        return theme.primary;
      case "muted":
        return theme.muted;
      case "danger":
        return "#EF4444";
      case "accent":
        return theme.accent || theme.primary;
      default:
        return theme.primary;
    }
  }, [variant, theme]);

  const getTextColor = useCallback(() => {
    if (variant === "muted") {
      return theme.text;
    }
    return "#FFF";
  }, [variant, theme]);

  const backgroundColor = getBackgroundColor();
  const color = getTextColor();

  // Flatten styles for proper style merging
  const flattenedStyle = StyleSheet.flatten([
    componentStyles.actionButton.button,
    { backgroundColor },
    disabled && componentStyles.actionButton.disabled,
    style,
  ]);

  return (
    <Pressable
      onPress={onPress}
      style={flattenedStyle}
      disabled={disabled}
    >
      {icon}
      <Text style={[componentStyles.actionButton.text, { color }, textStyle]}>{title}</Text>
      {iconAfter}
    </Pressable>
  );
});

interface ModalButtonsProps {
  /** Cancel button action */
  onCancel: () => void;
  /** Confirm/save button action */
  onConfirm: () => void;
  /** Confirm button label (default: "Save") */
  confirmLabel?: string;
  /** Cancel button label (default: "Cancel") */
  cancelLabel?: string;
  /** Theme colors object */
  theme: {
    primary: string;
    muted: string;
    text: string;
  };
  /** Whether confirm button is loading */
  loading?: boolean;
  /** Custom confirm button variant */
  confirmVariant?: ButtonVariant;
  /** Custom styles for container */
  style?: object;
}

/**
 * Reusable modal button pair (Cancel + Confirm).
 * Standard pattern used throughout the app.
 */
export const ModalButtons = memo(function ModalButtons({
  onCancel,
  onConfirm,
  confirmLabel = "Save",
  cancelLabel = "Cancel",
  theme,
  loading,
  confirmVariant = "primary",
  style,
}: ModalButtonsProps) {
  return (
    <View style={[componentStyles.actionButton.modalButtons, style]}>
      <ActionButton
        title={cancelLabel}
        onPress={onCancel}
        variant="muted"
        theme={theme}
      />
      <ActionButton
        title={loading ? "Loading..." : confirmLabel}
        onPress={onConfirm}
        variant={confirmVariant}
        theme={theme}
        disabled={loading}
      />
    </View>
  );
});

