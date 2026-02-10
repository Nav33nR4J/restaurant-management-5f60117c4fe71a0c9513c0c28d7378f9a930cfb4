/**
 * Menu Selectors
 * Memoized selectors for menu state
 */

import { MenuItem, SeasonalMenu } from '../../config/config';
import { memoize } from '../../utils/memoize';

// State type
export interface MenuState {
  items: MenuItem[];
  seasonalMenus: SeasonalMenu[];
  currentSeasonalMenu: SeasonalMenu | null;
  activeSeasonalMenus: SeasonalMenu[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
}

// Initial state
export const menuInitialState: MenuState = {
  items: [],
  seasonalMenus: [],
  currentSeasonalMenu: null,
  activeSeasonalMenus: [],
  loading: false,
  error: null,
  selectedCategory: null,
};

/**
 * Get all menu items
 */
export const selectAllMenuItems = (state: { menu: MenuState }) => state.menu.items;

/**
 * Get all categories (memoized with stable reference)
 * Uses LRU cache for efficient memoization
 */
const selectCategoriesCache = new Map<string, string[]>();

export const selectCategories = (state: { menu: MenuState }) => {
  const items = state.menu.items;
  
  // Create a cache key based on item IDs
  const cacheKey = items.map(i => i.id).join(',');
  
  // Check cache first
  const cached = selectCategoriesCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Compute categories
  const categories = Array.from(new Set(items.map(item => item.category))).sort();
  
  // Limit cache size to prevent memory leaks
  if (selectCategoriesCache.size > 10) {
    const firstKey = selectCategoriesCache.keys().next().value;
    selectCategoriesCache.delete(firstKey);
  }
  
  selectCategoriesCache.set(cacheKey, categories);
  return categories;
};

/**
 * Get filtered items by category (memoized)
 */
const selectItemsByCategoryCache = new Map<string, MenuItem[]>();

export const selectItemsByCategory = (state: { menu: MenuState }, category: string | null) => {
  if (!category) return state.menu.items;
  
  // Create cache key
  const cacheKey = `${category}_${state.menu.items.map(i => i.id).join(',')}`;
  
  const cached = selectItemsByCategoryCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  const filtered = state.menu.items.filter(item => item.category === category);
  
  // Limit cache size
  if (selectItemsByCategoryCache.size > 10) {
    const firstKey = selectItemsByCategoryCache.keys().next().value;
    selectItemsByCategoryCache.delete(firstKey);
  }
  
  selectItemsByCategoryCache.set(cacheKey, filtered);
  return filtered;
};

/**
 * Get current seasonal menu
 */
export const selectCurrentSeasonalMenu = (state: { menu: MenuState }) => state.menu.currentSeasonalMenu;

/**
 * Get all seasonal menus
 */
export const selectAllSeasonalMenus = (state: { menu: MenuState }) => state.menu.seasonalMenus;

/**
 * Get items for current seasonal menu (memoized)
 */
const selectCurrentSeasonalMenuItemsCache = new Map<string, MenuItem[]>();

export const selectCurrentSeasonalMenuItems = (state: { menu: MenuState }) => {
  const currentMenu = state.menu.currentSeasonalMenu;
  if (!currentMenu) return [];
  
  // Create cache key
  const cacheKey = `${currentMenu.id}_${state.menu.items.map(i => i.id).join(',')}`;
  
  const cached = selectCurrentSeasonalMenuItemsCache.get(cacheKey);
  if (cached) {
    return cached;
  }
  
  const filtered = state.menu.items.filter(item => item.seasonalMenuId === currentMenu.id);
  
  // Limit cache size
  if (selectCurrentSeasonalMenuItemsCache.size > 5) {
    const firstKey = selectCurrentSeasonalMenuItemsCache.keys().next().value;
    selectCurrentSeasonalMenuItemsCache.delete(firstKey);
  }
  
  selectCurrentSeasonalMenuItemsCache.set(cacheKey, filtered);
  return filtered;
};

/**
 * Get loading state
 */
export const selectMenuLoading = (state: { menu: MenuState }) => state.menu.loading;

/**
 * Get menu error
 */
export const selectMenuError = (state: { menu: MenuState }) => state.menu.error;

/**
 * Get menu item by ID (memoized with id as part of selector)
 */
export const createSelectMenuItemById = memoize((id: string) => 
  (state: { menu: MenuState }) => state.menu.items.find(item => item.id === id)
);

// For backward compatibility
export const selectMenuItemById = (id: string) => createSelectMenuItemById(id);

/**
 * Get active seasonal menus
 */
export const selectActiveSeasonalMenus = (state: { menu: MenuState }) => state.menu.activeSeasonalMenus;

/**
 * Get selected category
 */
export const selectSelectedCategory = (state: { menu: MenuState }) => state.menu.selectedCategory;

