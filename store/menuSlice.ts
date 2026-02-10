import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MenuItem, SeasonalMenu } from '../config/config';
import { menuInitialState } from './menu/menuSelectors';
import * as thunks from './menu/menuThunks';

// Re-export thunks with backward-compatible names
export const {
  initializeMenuDatabase,
  loadMenuItems,
  addMenuItemAsync,
  updateMenuItemAsync,
  deleteMenuItemAsync,
  loadSeasonalMenus,
  addSeasonalMenuAsync,
  updateSeasonalMenuAsync,
  deleteSeasonalMenuAsync,
  refreshCurrentSeasonalMenu,
  assignItemToSeasonalMenuAsync,
  removeItemFromSeasonalMenuAsync,
} = thunks;

// Backward-compatible aliases (for old import names)
export const addMenuItem = thunks.addMenuItemAsync;
export const updateMenuItem = thunks.updateMenuItemAsync;
export const deleteMenuItem = thunks.deleteMenuItemAsync;
export const addSeasonalMenu = thunks.addSeasonalMenuAsync;
export const updateSeasonalMenu = thunks.updateSeasonalMenuAsync;
export const deleteSeasonalMenu = thunks.deleteSeasonalMenuAsync;
export const assignItemToSeasonalMenu = thunks.assignItemToSeasonalMenuAsync;
export const removeItemFromSeasonalMenu = thunks.removeItemFromSeasonalMenuAsync;

// Re-export selectors for backward compatibility
export * from './menu/menuSelectors';

// Menu slice
const menuSlice = createSlice({
  name: 'menu',
  initialState: menuInitialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setItems: (state, action: PayloadAction<MenuItem[]>) => {
      state.items = action.payload;
    },
    setSeasonalMenus: (state, action: PayloadAction<SeasonalMenu[]>) => {
      state.seasonalMenus = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize database
    builder
      .addCase(thunks.initializeMenuDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.initializeMenuDatabase.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(thunks.initializeMenuDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to initialize database';
      });

    // Load menu items
    builder
      .addCase(thunks.loadMenuItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.loadMenuItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(thunks.loadMenuItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load menu items';
      });

    // Add menu item
    builder
      .addCase(thunks.addMenuItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.addMenuItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
      })
      .addCase(thunks.addMenuItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update menu item
    builder
      .addCase(thunks.updateMenuItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.updateMenuItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item: MenuItem) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(thunks.updateMenuItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete menu item
    builder
      .addCase(thunks.deleteMenuItemAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.deleteMenuItemAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((item: MenuItem) => item.id !== action.payload);
      })
      .addCase(thunks.deleteMenuItemAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load seasonal menus
    builder
      .addCase(thunks.loadSeasonalMenus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.loadSeasonalMenus.fulfilled, (state, action) => {
        state.loading = false;
        state.seasonalMenus = action.payload;
      })
      .addCase(thunks.loadSeasonalMenus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load seasonal menus';
      });

    // Add seasonal menu
    builder
      .addCase(thunks.addSeasonalMenuAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.addSeasonalMenuAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.seasonalMenus.push(action.payload);
      })
      .addCase(thunks.addSeasonalMenuAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update seasonal menu
    builder
      .addCase(thunks.updateSeasonalMenuAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.updateSeasonalMenuAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.seasonalMenus.findIndex((m: SeasonalMenu) => m.id === action.payload.id);
        if (index !== -1) {
          state.seasonalMenus[index] = action.payload;
        }
      })
      .addCase(thunks.updateSeasonalMenuAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete seasonal menu
    builder
      .addCase(thunks.deleteSeasonalMenuAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.deleteSeasonalMenuAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.seasonalMenus = state.seasonalMenus.filter((m: SeasonalMenu) => m.id !== action.payload);
      })
      .addCase(thunks.deleteSeasonalMenuAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Refresh current seasonal menu
    builder
      .addCase(thunks.refreshCurrentSeasonalMenu.fulfilled, (state, action) => {
        state.currentSeasonalMenu = action.payload.currentMenu;
        state.activeSeasonalMenus = action.payload.activeMenus;
      });

    // Assign item to seasonal menu
    builder
      .addCase(thunks.assignItemToSeasonalMenuAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.assignItemToSeasonalMenuAsync.fulfilled, (state, action) => {
        state.loading = false;
        // Update the item's seasonalMenuId
        const index = state.items.findIndex((item: MenuItem) => item.id === action.payload.menuItemId);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            seasonalMenuId: action.payload.seasonalMenuId,
            updatedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(thunks.assignItemToSeasonalMenuAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Remove item from seasonal menu
    builder
      .addCase(thunks.removeItemFromSeasonalMenuAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(thunks.removeItemFromSeasonalMenuAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex((item: MenuItem) => item.id === action.payload);
        if (index !== -1) {
          state.items[index] = {
            ...state.items[index],
            seasonalMenuId: undefined,
            updatedAt: new Date().toISOString(),
          };
        }
      })
      .addCase(thunks.removeItemFromSeasonalMenuAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  setSelectedCategory,
  setItems,
  setSeasonalMenus,
  clearError,
} = menuSlice.actions;

// Export reducer
export default menuSlice.reducer;

// Export state type
export type { MenuState } from './menu/menuSelectors';
