/**
 * Color Utility Functions
 * Provides safe color manipulation for React Native
 * Fixes issues with hex color + opacity string combinations
 * All functions include memoization for performance
 */

// Cache for memoized color functions
const hexToRgbaCache = new Map<string, string>();
const lightenColorCache = new Map<string, string>();
const darkenColorCache = new Map<string, string>();
const blendColorsCache = new Map<string, string>();
const withOpacityCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;

/**
 * Add alpha/opacity to a hex color (memoized)
 * @param hex - Hex color string (e.g., "#FFFFFF" or "#FFF")
 * @param opacity - Opacity value from 0 to 100
 * @returns RGBA color string
 */
export function hexToRgba(hex: string, opacity: number): string {
  const cacheKey = `${hex}_${opacity}`;
  const cached = hexToRgbaCache.get(cacheKey);
  if (cached) return cached;
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex values
  let r: number, g: number, b: number;
  
  if (cleanHex.length === 3) {
    // Short format #FFF
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    // Full format #FFFFFF
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else {
    // Invalid hex, return transparent
    return `rgba(0, 0, 0, ${Math.max(0, Math.min(100, opacity)) / 100})`;
  }
  
  // Normalize opacity to 0-1 range
  const normalizedOpacity = Math.max(0, Math.min(100, opacity)) / 100;
  
  const result = `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`;
  
  // Limit cache size
  if (hexToRgbaCache.size >= MAX_CACHE_SIZE) {
    const firstKey = hexToRgbaCache.keys().next().value;
    hexToRgbaCache.delete(firstKey);
  }
  hexToRgbaCache.set(cacheKey, result);
  
  return result;
}

/**
 * Lighten a color (memoized)
 * @param hex - Hex color string
 * @param percent - Percentage to lighten (0-100)
 * @returns Lightened hex color
 */
export function lightenColor(hex: string, percent: number): string {
  const cacheKey = `${hex}_${percent}`;
  const cached = lightenColorCache.get(cacheKey);
  if (cached) return cached;
  
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  
  let r = (num >> 16) + (255 * percent / 100);
  let g = ((num >> 8) & 0x00FF) + (255 * percent / 100);
  let b = (num & 0x0000FF) + (255 * percent / 100);
  
  r = Math.min(255, r);
  g = Math.min(255, g);
  b = Math.min(255, b);
  
  const result = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  
  // Limit cache size
  if (lightenColorCache.size >= MAX_CACHE_SIZE) {
    const firstKey = lightenColorCache.keys().next().value;
    lightenColorCache.delete(firstKey);
  }
  lightenColorCache.set(cacheKey, result);
  
  return result;
}

/**
 * Darken a color (memoized)
 * @param hex - Hex color string
 * @param percent - Percentage to darken (0-100)
 * @returns Darkened hex color
 */
export function darkenColor(hex: string, percent: number): string {
  const cacheKey = `${hex}_${percent}`;
  const cached = darkenColorCache.get(cacheKey);
  if (cached) return cached;
  
  const cleanHex = hex.replace('#', '');
  const num = parseInt(cleanHex, 16);
  
  let r = (num >> 16) * (1 - percent / 100);
  let g = ((num >> 8) & 0x00FF) * (1 - percent / 100);
  let b = (num & 0x0000FF) * (1 - percent / 100);
  
  r = Math.max(0, r);
  g = Math.max(0, g);
  b = Math.max(0, b);
  
  const result = `#${((Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).padStart(6, '0')}`;
  
  // Limit cache size
  if (darkenColorCache.size >= MAX_CACHE_SIZE) {
    const firstKey = darkenColorCache.keys().next().value;
    darkenColorCache.delete(firstKey);
  }
  darkenColorCache.set(cacheKey, result);
  
  return result;
}

/**
 * Get text color based on background brightness
 * @param backgroundColor - Background hex color
 * @returns 'black' or 'white' depending on brightness
 */
export function getContrastColor(backgroundColor: string): string {
  const cleanHex = backgroundColor.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Create a transparent version of a color
 * @param hex - Hex color string
 * @param opacity - Opacity from 0 to 1
 * @returns RGBA color string
 */
export function transparentize(hex: string, opacity: number): string {
  return hexToRgba(hex, opacity * 100);
}

/**
 * Blend two colors together (memoized)
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @param ratio - Blend ratio (0 = all color1, 1 = all color2)
 * @returns Blended hex color
 */
export function blendColors(color1: string, color2: string, ratio: number): string {
  const cacheKey = `${color1}_${color2}_${ratio}`;
  const cached = blendColorsCache.get(cacheKey);
  if (cached) return cached;
  
  const cleanHex1 = color1.replace('#', '');
  const cleanHex2 = color2.replace('#', '');
  
  const r1 = parseInt(cleanHex1.substring(0, 2), 16);
  const g1 = parseInt(cleanHex1.substring(2, 4), 16);
  const b1 = parseInt(cleanHex1.substring(4, 6), 16);
  
  const r2 = parseInt(cleanHex2.substring(0, 2), 16);
  const g2 = parseInt(cleanHex2.substring(2, 4), 16);
  const b2 = parseInt(cleanHex2.substring(4, 6), 16);
  
  const r = Math.round(r1 * (1 - ratio) + r2 * ratio);
  const g = Math.round(g1 * (1 - ratio) + g2 * ratio);
  const b = Math.round(b1 * (1 - ratio) + b2 * ratio);
  
  const result = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  
  // Limit cache size
  if (blendColorsCache.size >= MAX_CACHE_SIZE) {
    const firstKey = blendColorsCache.keys().next().value;
    blendColorsCache.delete(firstKey);
  }
  blendColorsCache.set(cacheKey, result);
  
  return result;
}

/**
 * Safe color with opacity for React Native
 * This handles the case where colors might be in different formats
 * @param color - Hex color or rgba string
 * @param opacity - Opacity from 0 to 1
 * @returns Color string with applied opacity
 */
export function withOpacity(color: string, opacity: number): string {
  // If already has opacity, don't modify
  if (color.includes('rgba') || color.includes('rgb')) {
    return color;
  }
  
  // If it's a hex color
  if (color.startsWith('#')) {
    return hexToRgba(color, opacity * 100);
  }
  
  // Return original if unknown format
  return color;
}

/**
 * Parse a color string and return its components
 * @param color - Any color string
 * @returns Object with r, g, b, a values or null if parsing fails
 */
export function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    const rgba = hexToRgba(color, 100);
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (match) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
        a: match[4] ? parseFloat(match[4]) : 1,
      };
    }
  }
  
  // Handle rgba/rgb
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] ? parseFloat(match[4]) : 1,
    };
  }
  
  return null;
}

export default {
  hexToRgba,
  lightenColor,
  darkenColor,
  getContrastColor,
  transparentize,
  blendColors,
  withOpacity,
  parseColor,
};

