
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  initializeMenuDatabase,
  loadMenuItems,
  loadSeasonalMenus,
  refreshCurrentSeasonalMenu,
} from "../../store/menuSlice";
import { Loggers } from "../../utils/logger";
import { DB_INIT_TIMEOUT, MENU_REFRESH_INTERVAL } from "../../utils/menuConstants";

/**
 * Custom hook for managing menu data initialization and loading
 */
export function useMenuData() {

  const dispatch = useAppDispatch();
  const [dbError, setDbError] = useState<string | null>(null);
  const seasonalMenus = useAppSelector((state) => state.menu.seasonalMenus);
  const [refreshInterval, setRefreshInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  const initializeData = useCallback(async () => {
    let isMounted = true;

    try {
      Loggers.menu.info("Initializing menu data...");

      // Create a timeout promise with user-friendly error
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("DB_INIT_TIMEOUT"));
        }, DB_INIT_TIMEOUT);
      });

      // Race between initialization and timeout
      try {
        const result = await Promise.race([
          dispatch(initializeMenuDatabase()).unwrap(),
          timeoutPromise,
        ]);

        if (isMounted) {
          await dispatch(loadMenuItems()).unwrap();
          await dispatch(loadSeasonalMenus()).unwrap();
          Loggers.menu.info("Menu data loaded successfully");
          setDbError(null);
        }
      } catch (initError: any) {
        if (initError?.message === "DB_INIT_TIMEOUT") {
          Loggers.menu.warn("Database initialization timed out, using sample data");
        } else {
          Loggers.menu.error("Failed to initialize menu data", initError);
        }

        if (isMounted) {
          setDbError("Using sample menu data - database unavailable");
          // Still try to load data (it might work or fallback to sample)
          try {
            await dispatch(loadMenuItems()).unwrap();
          } catch {
            Loggers.menu.warn("Could not load menu items, using sample data only");
          }
          try {
            await dispatch(loadSeasonalMenus()).unwrap();
          } catch {
            Loggers.menu.warn("Could not load seasonal menus");
          }
        }
      }
    } catch (error) {
      Loggers.menu.error("Unexpected error during menu initialization", error);
      if (isMounted) {
        setDbError("Using sample menu data");
      }
    }

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  /**
   * Refresh the current seasonal menu based on time
   * This should be called periodically to update menu visibility
   */
  const refreshSeasonalMenu = useCallback(async () => {
    try {
      await dispatch(refreshCurrentSeasonalMenu()).unwrap();
      Loggers.menu.debug("Seasonal menu refreshed based on current time");
    } catch (error) {
      Loggers.menu.warn("Failed to refresh seasonal menu", error);
    }
  }, [dispatch]);

  /**
   * Start periodic refresh of seasonal menu (for customer view)
   */
  const startPeriodicRefresh = useCallback(() => {
    // Clear any existing interval
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    // Set up new interval
    const interval = setInterval(() => {
      refreshSeasonalMenu();
    }, MENU_REFRESH_INTERVAL);

    setRefreshInterval(interval);
    Loggers.menu.info(`Started periodic menu refresh every ${MENU_REFRESH_INTERVAL / 1000} seconds`);
  }, [refreshInterval, refreshSeasonalMenu]);

  /**
   * Stop periodic refresh
   */
  const stopPeriodicRefresh = useCallback(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      setRefreshInterval(null);
      Loggers.menu.info("Stopped periodic menu refresh");
    }
  }, [refreshInterval]);

  // Initial data load
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Set up periodic refresh when seasonal menus are loaded
  useEffect(() => {
    if (seasonalMenus.length > 0) {
      // Initial refresh after data load
      refreshSeasonalMenu();
      // Start periodic refresh
      startPeriodicRefresh();
    }

    // Cleanup on unmount
    return () => {
      stopPeriodicRefresh();
    };
  }, [seasonalMenus.length, refreshSeasonalMenu, startPeriodicRefresh, stopPeriodicRefresh]);

  return { dbError, setDbError, refreshSeasonalMenu, startPeriodicRefresh, stopPeriodicRefresh };
}

