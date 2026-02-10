import { MenuItem, SeasonalMenu } from '../config/config';
import {
  formatTimeRange,
  getCurrentDate,
  getCurrentDayOfWeek,
  getCurrentTime,
  isDateInRange,
  isTimeInRange,
  parseDate,
  timeToMinutes,
} from './dateTime';

/**
 * Seasonal Menu Manager
 * Handles time-based menu switching
 */
export class SeasonalMenuManager {
  private seasonalMenus: SeasonalMenu[];

  constructor(seasonalMenus: SeasonalMenu[] = []) {
    this.seasonalMenus = seasonalMenus;
  }

  /**
   * Update the list of seasonal menus
   */
  setSeasonalMenus(menus: SeasonalMenu[]): void {
    this.seasonalMenus = menus;
  }

  /**
   * Get all active seasonal menus
   */
  getActiveSeasonalMenus(): SeasonalMenu[] {
    return this.seasonalMenus.filter(menu => menu.isActive);
  }

  /**
   * Get the current applicable seasonal menu based on date and time
   */
  getCurrentSeasonalMenu(): SeasonalMenu | null {
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();
    const currentDay = getCurrentDayOfWeek();

    // Find a menu that matches the current date and time
    for (const menu of this.seasonalMenus) {
      if (!menu.isActive) continue;

      // Check date range
      const isInDateRange = isDateInRange(menu.startDate, menu.endDate);
      if (!isInDateRange) continue;

      // Check time range
      const isInTimeRange = isTimeInRange(menu.startTime, menu.endTime);
      if (!isInTimeRange) continue;

      return menu;
    }

    return null;
  }

  /**
   * Get all menus that are currently active (for preview/admin view)
   */
  getAllCurrentlyActiveMenus(): SeasonalMenu[] {
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();

    return this.seasonalMenus.filter(menu => {
      if (!menu.isActive) return false;
      
      const isInDateRange = isDateInRange(menu.startDate, menu.endDate);
      if (!isInDateRange) return false;

      const isInTimeRange = isTimeInRange(menu.startTime, menu.endTime);
      return isInTimeRange;
    });
  }

  /**
   * Get menus by date range (for admin calendar view)
   */
  getMenusByDateRange(startDate: string, endDate: string): SeasonalMenu[] {
    return this.seasonalMenus.filter(menu => {
      return (
        menu.startDate <= endDate &&
        menu.endDate >= startDate
      );
    });
  }

  /**
   * Check if a menu is currently active
   */
  isMenuActive(menuId: string): boolean {
    const menu = this.seasonalMenus.find(m => m.id === menuId);
    if (!menu) return false;

    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();

    if (!menu.isActive) return false;
    if (currentDate < menu.startDate || currentDate > menu.endDate) return false;
    if (!isTimeInRange(menu.startTime, menu.endTime)) return false;

    return true;
  }

  /**
   * Get menu duration in days
   */
  getMenuDurationDays(menu: SeasonalMenu): number {
    const start = parseDate(menu.startDate);
    const end = parseDate(menu.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  /**
   * Get time until menu ends (in hours)
   */
  getHoursUntilMenuEnd(menu: SeasonalMenu): number | null {
    if (!this.isMenuActive(menu.id)) return null;

    const now = new Date();
    const [endHours, endMinutes] = menu.endTime.split(':').map(Number);
    
    const endDateTime = new Date(now);
    endDateTime.setHours(endHours, endMinutes, 0, 0);

    // If end time is earlier than current time, assume next day
    if (endDateTime <= now) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const diffMs = endDateTime.getTime() - now.getTime();
    return Math.max(0, diffMs / (1000 * 60 * 60));
  }

  /**
   * Format menu duration for display
   */
  formatMenuDuration(menu: SeasonalMenu): string {
    const start = parseDate(menu.startDate);
    const end = parseDate(menu.endDate);
    
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
    const duration = this.getMenuDurationDays(menu);
    
    return `${startStr} - ${endStr} (${duration} day${duration > 1 ? 's' : ''})`;
  }

  /**
   * Format time range for display
   */
  formatTimeRange(startTime: string, endTime: string): string {
    return formatTimeRange(startTime, endTime);
  }

  /**
   * Check if a specific item is currently visible based on its seasonal menu time
   * Returns the active seasonal menu if item is visible, null otherwise
   */
  isItemTimeVisible(item: MenuItem): SeasonalMenu | null {
    if (!item.seasonalMenuId) {
      // Regular items are always visible
      return null;
    }

    const menu = this.seasonalMenus.find(m => m.id === item.seasonalMenuId);
    if (!menu) return null;

    if (!menu.isActive) return null;

    // Check date range
    const currentDate = getCurrentDate();
    if (currentDate < menu.startDate || currentDate > menu.endDate) return null;

    // Check time range
    const currentTime = getCurrentTime();
    if (!isTimeInRange(menu.startTime, menu.endTime)) return null;

    return menu;
  }

  /**
   * Get all items that should be visible at the current time
   * Regular items + items whose seasonal menu is currently active
   */
  getVisibleItemsForTime(items: MenuItem[]): { visible: MenuItem[]; hidden: MenuItem[] } {
    const currentDate = getCurrentDate();
    const currentTime = getCurrentTime();

    const visible: MenuItem[] = [];
    const hidden: MenuItem[] = [];

    for (const item of items) {
      if (!item.seasonalMenuId) {
        // Regular items are always visible
        visible.push(item);
        continue;
      }

      const menu = this.seasonalMenus.find(m => m.id === item.seasonalMenuId);
      if (!menu) {
        // If menu doesn't exist, show item anyway (safety fallback)
        visible.push(item);
        continue;
      }

      if (!menu.isActive) {
        // Menu is deactivated, hide items
        hidden.push(item);
        continue;
      }

      // Check date range
      const inDateRange = currentDate >= menu.startDate && currentDate <= menu.endDate;
      if (!inDateRange) {
        hidden.push(item);
        continue;
      }

      // Check time range
      const inTimeRange = isTimeInRange(menu.startTime, menu.endTime);
      if (!inTimeRange) {
        hidden.push(item);
        continue;
      }

      visible.push(item);
    }

    return { visible, hidden };
  }

  /**
   * Get time remaining until menu ends (for countdown display)
   * Returns { hours, minutes, seconds } or null if not applicable
   */
  getTimeUntilMenuEnd(menu: SeasonalMenu): { hours: number; minutes: number; seconds: number } | null {
    if (!menu.isActive) return null;

    const currentDate = getCurrentDate();
    if (currentDate < menu.startDate || currentDate > menu.endDate) return null;

    const currentTime = getCurrentTime();
    const [endHours, endMinutes] = menu.endTime.split(':').map(Number);
    
    // Calculate end time as minutes from midnight
    const endMinutesFromMidnight = endHours * 60 + endMinutes;
    const currentMinutesFromMidnight = timeToMinutes(currentTime);

    // If current time is past end time, check if it's overnight
    if (menu.startTime > menu.endTime) {
      // Overnight menu (e.g., 22:00 to 06:00)
      if (currentTime >= menu.startTime || currentTime <= menu.endTime) {
        const remainingMins = (24 * 60 - currentMinutesFromMidnight) + endMinutesFromMidnight;
        const hours = Math.floor(remainingMins / 60);
        const mins = remainingMins % 60;
        const secs = 0;
        return { hours, minutes: mins, seconds: secs };
      }
    } else {
      // Same-day menu
      if (currentTime >= menu.startTime && currentTime <= menu.endTime) {
        const remainingMins = endMinutesFromMidnight - currentMinutesFromMidnight;
        if (remainingMins > 0) {
          const hours = Math.floor(remainingMins / 60);
          const mins = remainingMins % 60;
          const secs = 0;
          return { hours, minutes: mins, seconds: secs };
        }
      }
    }

    return null;
  }

  /**
   * Format time remaining for display
   */
  formatTimeRemaining(menu: SeasonalMenu): string | null {
    const timeRemaining = this.getTimeUntilMenuEnd(menu);
    if (!timeRemaining) return null;

    const { hours, minutes } = timeRemaining;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  }

  /**
   * Get items grouped by their seasonal menu for display
   */
  getItemsGroupedByMenu(items: MenuItem[]): { 
    regular: MenuItem[]; 
    seasonalGroups: { menu: SeasonalMenu; items: MenuItem[] }[] 
  } {
    const regular: MenuItem[] = [];
    const menuGroups = new Map<string, { menu: SeasonalMenu; items: MenuItem[] }>();

    for (const item of items) {
      if (!item.seasonalMenuId) {
        regular.push(item);
        continue;
      }

      const menu = this.seasonalMenus.find(m => m.id === item.seasonalMenuId);
      if (!menu) {
        regular.push(item);
        continue;
      }

      if (!menuGroups.has(menu.id)) {
        menuGroups.set(menu.id, { menu, items: [] });
      }
      menuGroups.get(menu.id)!.items.push(item);
    }

    return {
      regular,
      seasonalGroups: Array.from(menuGroups.values())
    };
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Filter menu items by seasonal menu
 */
export function filterItemsBySeasonalMenu(items: MenuItem[], seasonalMenuId?: string): MenuItem[] {
  if (!seasonalMenuId) {
    return items.filter(item => !item.seasonalMenuId);
  }
  return items.filter(item => item.seasonalMenuId === seasonalMenuId);
}

/**
 * Get only available items (in stock and available)
 */
export function getAvailableItems(items: MenuItem[]): MenuItem[] {
  return items.filter(item => item.isAvailable && item.inStock);
}

/**
 * Create a seasonal menu manager instance
 */
export function createSeasonalMenuManager(menus: SeasonalMenu[]): SeasonalMenuManager {
  return new SeasonalMenuManager(menus);
}

