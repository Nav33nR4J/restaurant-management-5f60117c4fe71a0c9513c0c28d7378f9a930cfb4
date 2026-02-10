/**
 * DateTime Utilities
 * Helper functions for date and time manipulation
 */

// Days of week enum
export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

/**
 * Get current date and time
 */
export function getCurrentDateTime(): Date {
  return new Date();
}

/**
 * Get current time in HH:mm format
 */
export function getCurrentTime(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get current day of week (0-6, Sunday-Saturday)
 */
export function getCurrentDayOfWeek(): DayOfWeek {
  return getCurrentDateTime().getDay() as DayOfWeek;
}

/**
 * Get current date in ISO format (YYYY-MM-DD)
 */
export function getCurrentDate(): string {
  const now = getCurrentDateTime();
  return now.toISOString().split('T')[0];
}

/**
 * Parse time string (HH:mm) to minutes since midnight
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Compare two time strings
 * Returns -1 if time1 < time2, 0 if equal, 1 if time1 > time2
 */
export function compareTime(time1: string, time2: string): number {
  const mins1 = timeToMinutes(time1);
  const mins2 = timeToMinutes(time2);
  
  if (mins1 < mins2) return -1;
  if (mins1 > mins2) return 1;
  return 0;
}

/**
 * Check if current time is within the specified time range
 */
export function isTimeInRange(startTime: string, endTime: string): boolean {
  const currentTime = getCurrentTime();
  
  // Handle overnight ranges (e.g., 22:00 to 06:00)
  if (startTime > endTime) {
    return currentTime >= startTime || currentTime <= endTime;
  }
  
  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Parse date string (YYYY-MM-DD) to Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00');
}

/**
 * Check if current date is within the specified date range
 */
export function isDateInRange(startDate: string, endDate: string): boolean {
  const currentDate = getCurrentDate();
  return currentDate >= startDate && currentDate <= endDate;
}

/**
 * Check if a date is valid
 */
export function isValidDate(dateString: string): boolean {
  const date = parseDate(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if a time string is valid (HH:mm format)
 */
export function isValidTime(timeString: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeString);
}

/**
 * Format Date object to ISO date string (YYYY-MM-DD)
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Format Date object to time string (HH:mm)
 */
export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Get day name from day of week
 */
export function getDayName(dayOfWeek: DayOfWeek): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek];
}

/**
 * Get day abbreviation from day of week
 */
export function getDayAbbreviation(dayOfWeek: DayOfWeek): string {
  const abbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return abbreviations[dayOfWeek];
}

/**
 * Format time range for display (12-hour format)
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  const formatSingleTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  return `${formatSingleTime(startTime)} - ${formatSingleTime(endTime)}`;
}

export default {
  DayOfWeek,
  getCurrentDateTime,
  getCurrentTime,
  getCurrentDayOfWeek,
  getCurrentDate,
  timeToMinutes,
  compareTime,
  isTimeInRange,
  parseDate,
  isDateInRange,
  isValidDate,
  isValidTime,
  formatDate,
  formatTime,
  getDayName,
  getDayAbbreviation,
  formatTimeRange,
};

