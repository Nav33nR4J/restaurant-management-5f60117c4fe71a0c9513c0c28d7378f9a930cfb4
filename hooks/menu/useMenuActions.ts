
import { useCallback } from "react";
import { MenuItem as ConfigMenuItem, SeasonalMenu } from "../../config/config";
import { addItem, removeItem } from "../../store/cartSlice";
import { useAppDispatch } from "../../store/hooks";
import {
    addMenuItem,
    addSeasonalMenu,
    assignItemToSeasonalMenu,
    deleteMenuItem,
    deleteSeasonalMenu,
} from "../../store/menuSlice";
import { Loggers } from "../../utils/logger";

/**
 * Interface for new menu item form data
 */
interface NewMenuItemData {
  name: string;
  description: string;
  price: string;
  category: string;
}

/**
 * Interface for new seasonal menu form data
 */
interface NewSeasonalMenuData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
}

/**
 * Custom hook for menu actions (add, remove, delete items)
 */
export function useMenuActions() {
  const dispatch = useAppDispatch();

  // Cart actions
  const handleAddItem = useCallback(
    (id: string, name: string, price: number) => {
      dispatch(addItem({ id, name, price }));
    },
    [dispatch]
  );

  const handleRemoveItem = useCallback(
    (id: string) => {
      dispatch(removeItem(id));
    },
    [dispatch]
  );

  // Menu item actions
  const handleDeleteItem = useCallback(
    (id: string) => {
      dispatch(deleteMenuItem(id));
    },
    [dispatch]
  );

  const handleAddMenuItem = useCallback(
    (data: NewMenuItemData, onComplete?: () => void) => {
      if (!data.name || !data.price || !data.category) {
        Loggers.menu.warn("Please fill all required fields");
        return;
      }

      const newItem: Omit<ConfigMenuItem, "id" | "createdAt" | "updatedAt"> = {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        basePrice: parseFloat(data.price),
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        category: data.category,
        isAvailable: true,
        inStock: true,
      };

      dispatch(addMenuItem(newItem));
      Loggers.menu.info(`Added menu item: ${newItem.name}`);
      onComplete?.();
    },
    [dispatch]
  );

  // Seasonal menu actions
  const handleAddSeasonalMenu = useCallback(
    (data: NewSeasonalMenuData, onComplete?: () => void) => {
      if (!data.name || !data.startDate || !data.endDate) {
        Loggers.menu.warn("Please fill all required fields");
        return;
      }

      const newMenu = {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: true,
        items: [],
      };

      dispatch(addSeasonalMenu(newMenu));
      Loggers.menu.info(`Created seasonal menu: ${newMenu.name}`);
      onComplete?.();
    },
    [dispatch]
  );

  const handleDeleteSeasonalMenu = useCallback(
    (id: string) => {
      dispatch(deleteSeasonalMenu(id));
    },
    [dispatch]
  );

  const handleAddItemToSeasonalMenu = useCallback(
    (menuItem: ConfigMenuItem, seasonalMenu: SeasonalMenu) => {
      dispatch(
        assignItemToSeasonalMenu({
          menuItemId: menuItem.id,
          seasonalMenuId: seasonalMenu.id,
        })
      );
      Loggers.menu.info(`Added ${menuItem.name} to seasonal menu ${seasonalMenu.name}`);
    },
    [dispatch]
  );

  return {
    // Cart actions
    handleAddItem,
    handleRemoveItem,
    // Menu item actions
    handleDeleteItem,
    handleAddMenuItem,
    // Seasonal menu actions
    handleAddSeasonalMenu,
    handleDeleteSeasonalMenu,
    handleAddItemToSeasonalMenu,
  };
}

