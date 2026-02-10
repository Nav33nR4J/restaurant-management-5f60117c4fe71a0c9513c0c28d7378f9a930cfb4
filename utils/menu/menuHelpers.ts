

import { useCallback, useMemo } from "react";
import { MenuItem as ConfigMenuItem, SeasonalMenu } from "../../config/config";
import { SAMPLE_MENU_ITEMS } from "../../utils/menuConstants";
import { createSeasonalMenuManager, SeasonalMenuManager } from "../../utils/seasonalMenu";


/**
 * Get displayed menu items based on current seasonal menu
 */
export function getDisplayedItems(
  menuItems: ConfigMenuItem[],
  currentSeasonalMenu: SeasonalMenu | null,
  isHQ: () => boolean
): ConfigMenuItem[] {
  if (currentSeasonalMenu && isHQ()) {
    return menuItems.length > 0 ? menuItems : SAMPLE_MENU_ITEMS;
  }
  if (currentSeasonalMenu) {
    const seasonalItems = menuItems.filter(
      (item) => item.seasonalMenuId === currentSeasonalMenu.id
    );
    if (seasonalItems.length > 0) return seasonalItems;
  }
  return menuItems.length > 0 ? menuItems : SAMPLE_MENU_ITEMS;
}

/**
 * Filter items by category
 */
export function filterByCategory(
  items: ConfigMenuItem[],
  category: string | null
): ConfigMenuItem[] {
  if (!category) return items;
  return items.filter((item) => item.category === category);
}

/**
 * Create a hook for filtering displayed items
 */
export function useFilteredItems(
  menuItems: ConfigMenuItem[],
  currentSeasonalMenu: SeasonalMenu | null,
  selectedCategory: string | null,
  isHQ: () => boolean
) {
  const displayedItems = useMemo(
    () => getDisplayedItems(menuItems, currentSeasonalMenu, isHQ),
    [menuItems, currentSeasonalMenu, isHQ]
  );

  const filteredItems = useMemo(
    () => filterByCategory(displayedItems, selectedCategory),
    [displayedItems, selectedCategory]
  );

  return { displayedItems, filteredItems };
}

/**
 * Get items not already in the selected seasonal menu
 */
export function getAvailableItemsForSeasonalMenu(
  menuItems: ConfigMenuItem[],
  selectedSeasonalMenu: SeasonalMenu | null
): ConfigMenuItem[] {
  if (!selectedSeasonalMenu) return [];
  return menuItems.filter(
    (item) => item.seasonalMenuId !== selectedSeasonalMenu.id
  );
}

/**
 * Filter items by search query
 */
export function filterBySearchQuery(
  items: ConfigMenuItem[],
  query: string
): ConfigMenuItem[] {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Create a hook for filtering items by search query
 */
export function useSearchFilteredItems(
  getAvailableItems: () => ConfigMenuItem[],
  searchQuery: string
) {
  return useCallback(() => {
    const availableItems = getAvailableItems();
    return filterBySearchQuery(availableItems, searchQuery);
  }, [getAvailableItems, searchQuery]);
}

// ============================================================================
// Time-Based Filtering Helpers
// ============================================================================

/**
 * Filter items by current time based on their seasonal menu
 * This is for customer view - items only show during their menu time
 */
export function getTimeFilteredItems(
  items: ConfigMenuItem[],
  seasonalMenus: SeasonalMenu[],
  includeHidden: boolean = false
): { visible: ConfigMenuItem[]; hidden: ConfigMenuItem[]; manager: SeasonalMenuManager } {
  const manager = createSeasonalMenuManager(seasonalMenus);
  const result = manager.getVisibleItemsForTime(items);
  
  if (includeHidden) {
    return { visible: result.visible as ConfigMenuItem[], hidden: result.hidden as ConfigMenuItem[], manager };
  }
  
  return { visible: result.visible as ConfigMenuItem[], hidden: result.hidden as ConfigMenuItem[], manager };
}

/**
 * Check if a seasonal menu is currently active and visible
 */
export function isSeasonalMenuCurrentlyActive(
  menu: SeasonalMenu,
  seasonalMenus: SeasonalMenu[]
): boolean {
  const manager = createSeasonalMenuManager(seasonalMenus);
  return manager.isMenuActive(menu.id);
}

/**
 * Get formatted time remaining for a seasonal menu
 */
export function getSeasonalMenuTimeRemaining(
  menu: SeasonalMenu,
  seasonalMenus: SeasonalMenu[]
): string | null {
  const manager = createSeasonalMenuManager(seasonalMenus);
  return manager.formatTimeRemaining(menu);
}



/**
 * Create a hook for time-based filtered items (for customer view)
 */
export function useTimeFilteredItems(
  items: ConfigMenuItem[],
  seasonalMenus: SeasonalMenu[],
  isHQ: () => boolean
): { visible: ConfigMenuItem[]; hidden: ConfigMenuItem[]; manager: SeasonalMenuManager } {
  return useMemo(() => {
    // HQ/Branch users see all items regardless of time
    if (isHQ()) {
      return {
        visible: items,
        hidden: [],
        manager: createSeasonalMenuManager(seasonalMenus),
      };
    }
    
    // Customer view - filter by time
    return getTimeFilteredItems(items, seasonalMenus);
  }, [items, seasonalMenus, isHQ]);
}

/**
 * Get items grouped by seasonal menu for organized display
 */
export function getItemsGroupedBySeasonalMenu(
  items: ConfigMenuItem[],
  seasonalMenus: SeasonalMenu[]
): {
  regular: ConfigMenuItem[];
  seasonalGroups: { menu: SeasonalMenu; items: ConfigMenuItem[]; isActive: boolean }[];
} {
  const manager = createSeasonalMenuManager(seasonalMenus);
  const grouped = manager.getItemsGroupedByMenu(items);
  
  return {
    regular: grouped.regular,
    seasonalGroups: grouped.seasonalGroups.map(g => ({
      ...g,
      isActive: manager.isMenuActive(g.menu.id),
    })),
  };
}

/**
 * Check if any seasonal menu items are currently available
 */
export function hasActiveSeasonalMenuItems(
  items: ConfigMenuItem[],
  seasonalMenus: SeasonalMenu[]
): boolean {
  const result = getTimeFilteredItems(items, seasonalMenus);
  return result.visible.some(item => item.seasonalMenuId !== undefined);
}

/**
 * Get count of hidden items due to time restrictions
 */
export function getHiddenItemCount(
  items: ConfigMenuItem[],
  seasonalMenus: SeasonalMenu[]
): number {
  const result = getTimeFilteredItems(items, seasonalMenus);
  return result.hidden.length;
}

