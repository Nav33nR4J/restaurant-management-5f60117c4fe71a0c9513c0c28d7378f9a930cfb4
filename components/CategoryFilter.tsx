import { Ionicons } from "@expo/vector-icons";
import { memo, useCallback } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { componentStyles } from "../styles";
import { CATEGORY_ICONS } from "../utils/menuConstants";

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  theme: {
    primary: string;
    muted: string;
    text: string;
  };
}

// Memoized category chip component to prevent unnecessary re-renders
const CategoryChip = memo(function CategoryChip({
  category,
  isSelected,
  onPress,
  theme,
}: {
  category: string;
  isSelected: boolean;
  onPress: () => void;
  theme: CategoryFilterProps["theme"];
}) {
  const backgroundColor = isSelected ? theme.primary : theme.muted;
  const textColor = isSelected ? "#FFF" : theme.text;
  const iconName = CATEGORY_ICONS[category] || "restaurant";

  return (
    <Pressable
      onPress={onPress}
      style={[
        componentStyles.categoryChip.chip,
        { backgroundColor },
      ]}
    >
      <Ionicons
        name={iconName as any}
        size={16}
        color={textColor}
        style={componentStyles.categoryChip.icon}
      />
      <Text style={[componentStyles.categoryChip.text, { color: textColor }]}>
        {category}
      </Text>
    </Pressable>
  );
});

export const CategoryFilter = memo(function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  theme,
}: CategoryFilterProps) {
  // Early return if no categories
  const handleSelectAll = useCallback(() => {
    onSelectCategory(null);
  }, [onSelectCategory]);

  if (categories.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={componentStyles.categoryFilter.categoryContainer}
      contentContainerStyle={componentStyles.categoryFilter.categoryContent}
    >
      {/* All category */}
      <CategoryChip
        category="All"
        isSelected={selectedCategory === null}
        onPress={handleSelectAll}
        theme={theme}
      />

      {/* Category chips */}
      {categories.map((category) => (
        <CategoryChip
          key={category}
          category={category}
          isSelected={selectedCategory === category}
          onPress={() => onSelectCategory(category)}
          theme={theme}
        />
      ))}
    </ScrollView>
  );
});

