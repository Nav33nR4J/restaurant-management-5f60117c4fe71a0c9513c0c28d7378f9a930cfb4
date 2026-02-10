import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, StyleSheet } from "react-native";

export type IconButtonVariant = "default" | "primary" | "muted" | "danger";

interface IconButtonProps {
  /** Icon name (uses Ionicons) */
  name: string;
  /** Callback when button is pressed */
  onPress: () => void;
  /** Icon size (default: 24) */
  size?: number;
  /** Button variant for background color */
  variant?: IconButtonVariant;
  /** Theme colors object */
  theme: {
    primary?: string;
    muted?: string;
    text: string;
  };
  /** Custom icon color (overrides variant color) */
  color?: string;
  /** Optional accessibility label */
  accessibilityLabel?: string;
  /** Optional custom styles */
  style?: object;
  /** Whether button is disabled */
  disabled?: boolean;
}

/**
 * Reusable icon-only button component.
 * Used for close buttons, back arrows, and other icon actions.
 */
export const IconButton = memo(function IconButton({
  name,
  onPress,
  size = 24,
  variant = "default",
  theme,
  color: customColor,
  accessibilityLabel,
  style,
  disabled,
}: IconButtonProps) {
  const getColor = () => {
    if (customColor) return customColor;
    switch (variant) {
      case "primary":
        return theme.primary || "#007AFF";
      case "muted":
        return theme.muted || "#8E8E93";
      case "danger":
        return "#EF4444";
      default:
        return theme.text;
    }
  };

  const getBackgroundColor = () => {
    if (variant === "default") return "transparent";
    if (variant === "primary" || variant === "muted" || variant === "danger") {
      return `${getColor()}20`; // 20 = ~12% opacity hex
    }
    return "transparent";
  };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
        },
        disabled && styles.disabled,
        style,
      ]}
      accessibilityLabel={accessibilityLabel || name}
      disabled={disabled}
    >
      <Ionicons
        name={name as any}
        size={size}
        color={getColor()}
      />
    </Pressable>
  );
});

interface CloseButtonProps {
  /** Callback when close button is pressed */
  onPress: () => void;
  /** Theme colors object */
  theme: {
    text: string;
  };
  /** Optional custom size */
  size?: number;
  /** Optional custom styles */
  style?: object;
}

/**
 * Convenience component for modal close (X) buttons.
 */
export const CloseButton = memo(function CloseButton({
  onPress,
  theme,
  size = 24,
  style,
}: CloseButtonProps) {
  return (
    <IconButton
      name="close"
      onPress={onPress}
      size={size}
      variant="default"
      theme={theme}
      accessibilityLabel="Close"
      style={style}
    />
  );
});

interface BackButtonProps {
  /** Callback when back button is pressed */
  onPress: () => void;
  /** Theme colors object */
  theme: {
    text: string;
  };
  /** Optional custom size */
  size?: number;
  /** Optional custom styles */
  style?: object;
}

/**
 * Convenience component for navigation back buttons.
 */
export const BackButton = memo(function BackButton({
  onPress,
  theme,
  size = 24,
  style,
}: BackButtonProps) {
  return (
    <IconButton
      name="arrow-back"
      onPress={onPress}
      size={size}
      variant="default"
      theme={theme}
      accessibilityLabel="Go back"
      style={style}
    />
  );
});

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});

