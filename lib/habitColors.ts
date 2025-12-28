/**
 * Centralized color utilities for habits
 * 
 * This module provides:
 * - Available color options for habit creation
 * - Color name to Tailwind class mapping
 * - Default colors for rotation
 * - Function to get habit color class
 */

export interface HabitColorOption {
  name: string;
  value: string; // Tailwind class (e.g., "bg-orange-500")
  hex: string; // Hex color code (e.g., "#f97316")
}

/**
 * Available color options for habits
 * Used in AddHabitModal and can be referenced elsewhere
 */
export const HABIT_COLORS: HabitColorOption[] = [
  { name: "Orange", value: "bg-orange-500", hex: "#f97316" },
  { name: "Blue", value: "bg-blue-500", hex: "#3b82f6" },
  { name: "Purple", value: "bg-purple-500", hex: "#a855f7" },
  { name: "Green", value: "bg-green-500", hex: "#22c55e" },
  { name: "Red", value: "bg-red-500", hex: "#ef4444" },
  { name: "Pink", value: "bg-pink-500", hex: "#ec4899" },
  { name: "Cyan", value: "bg-cyan-500", hex: "#06b6d4" },
  { name: "Yellow", value: "bg-yellow-500", hex: "#eab308" },
];

/**
 * Mapping from color names to Tailwind classes
 * Used when color is stored as a name string instead of a Tailwind class
 */
export const COLOR_NAME_TO_CLASS: Record<string, string> = {
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  cyan: 'bg-cyan-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
};

/**
 * Default colors for rotation when habit has no color set
 * Used to provide consistent default colors based on habit index
 */
export const DEFAULT_COLORS = [
  'bg-orange-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-cyan-500',
  'bg-green-500',
];

/**
 * Gets the Tailwind color class for a habit
 * 
 * @param habit - Habit object with optional color property
 * @param index - Optional index for default color rotation
 * @param defaultColors - Optional array of default colors (defaults to DEFAULT_COLORS)
 * @returns Tailwind color class string
 * 
 * @example
 * ```ts
 * // Habit with Tailwind class
 * getHabitColor({ color: 'bg-orange-500' }) // Returns 'bg-orange-500'
 * 
 * // Habit with color name
 * getHabitColor({ color: 'orange' }) // Returns 'bg-orange-500'
 * 
 * // Habit without color (uses default rotation)
 * getHabitColor({ color: null }, 0) // Returns 'bg-orange-500'
 * getHabitColor({ color: null }, 1) // Returns 'bg-blue-500'
 * ```
 */
export function getHabitColor(
  habit: { color?: string | null },
  index?: number,
  defaultColors: string[] = DEFAULT_COLORS
): string {
  if (habit.color) {
    // If color is stored as a Tailwind class, use it directly
    if (habit.color.startsWith('bg-')) {
      return habit.color;
    }
    // Otherwise, try to map common color names
    return COLOR_NAME_TO_CLASS[habit.color.toLowerCase()] || 'bg-primary';
  }
  
  // Default color rotation based on habit index
  if (index !== undefined && index >= 0) {
    return defaultColors[index % defaultColors.length];
  }
  
  // Fallback to primary if no index provided
  return 'bg-primary';
}

