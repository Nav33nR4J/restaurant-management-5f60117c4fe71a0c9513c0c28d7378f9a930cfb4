import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { componentStyles } from "../../styles";

interface CategoryChipProps {
  /** Category name to display */
  label: string;
  /** Icon name (uses Ionicons) */
  iconName?: string;
  /** Whether this chip is currently selected */
  isSelected: boolean;
  /** Callback when chip is pressed */
  onPress: () => void;
  /** Theme colors object */
  theme: {
    primary: string;
    muted: string;
    text: string;
  };
  /** Optional custom icon name override */
  customIcon?: string;
}

/**
 * Reusable category chip component with icon and text.
 * Used for filtering categories in menu and other list views.
 */
export const CategoryChip = memo(function CategoryChip({
  label,
  iconName,
  isSelected,
  onPress,
  theme,
  customIcon,
}: CategoryChipProps) {
  const icon = customIcon || iconName || "restaurant";

  return (
    <Pressable
      onPress={onPress}
      style={[
        componentStyles.categoryChip.chip,
        {
          backgroundColor: isSelected ? theme.primary : theme.muted,
        },
      ]}
    >
      <Ionicons
        name={icon as any}
        size={16}
        color={isSelected ? "#FFF" : theme.text}
        style={componentStyles.categoryChip.icon}
      />
      <Text
        style={[
          componentStyles.categoryChip.text,
          { color: isSelected ? "#FFF" : theme.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
});

interface CategoryFilterBarProps {
  /** List of categories to display */
  categories: string[];
  /** Currently selected category (null = All) */
  selectedCategory: string | null;
  /** Callback when a category is selected */
  onSelectCategory: (category: string | null) => void;
  /** Icon mapping for categories */
  iconMap?: Record<string, string>;
  /** Theme colors object */
  theme: {
    primary: string;
    muted: string;
    text: string;
  };
  /** Optional custom styles */
  style?: object;
}

/**
 * Category filter bar with "All" option and category chips.
 * Wraps chips in a horizontal scroll view.
 */
export const CategoryFilterBar = memo(function CategoryFilterBar({
  categories,
  selectedCategory,
  onSelectCategory,
  iconMap = {},
  theme,
  style,
}: CategoryFilterBarProps) {
  if (categories.length === 0) return null;

  return (
    <View style={[componentStyles.categoryChip.container, style]}>
      {/* All category chip */}
      <CategoryChip
        label="All"
        iconName="apps"
        isSelected={selectedCategory === null}
        onPress={() => onSelectCategory(null)}
        theme={theme}
      />

      {/* Category chips */}
      {categories.map((category) => (
        <CategoryChip
          key={category}
          label={category}
          iconName={iconMap[category] || "restaurant"}
          isSelected={selectedCategory === category}
          onPress={() => onSelectCategory(category)}
          theme={theme}
        />
      ))}
    </View>
  );
});

