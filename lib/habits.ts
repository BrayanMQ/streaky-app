import type { HabitLog } from '@/types/database'
import { formatDateLocal, getTodayDateLocal } from './streaks'

/**
 * Utility functions for habit calculations and checks
 */

/**
 * Formats a date string to YYYY-MM-DD format
 * Uses UTC for database compatibility (dates stored in DB are timezone-agnostic)
 * @param date - Date object or date string
 * @returns Formatted date string (YYYY-MM-DD) in UTC
 * @deprecated For UI calculations, use formatDateLocal from streaks.ts instead
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toISOString().split('T')[0]
}

/**
 * Gets today's date in YYYY-MM-DD format
 * Uses UTC for database compatibility
 * @returns Today's date string in UTC
 * @deprecated For UI calculations, use getTodayDateLocal from streaks.ts instead
 */
export function getTodayDate(): string {
  return formatDate(new Date())
}

/**
 * Calculates the current streak for a habit based on its logs
 * 
 * A streak is the number of consecutive days (going backwards from today)
 * where the habit was completed. The streak breaks if:
 * - There's a day missing (no log entry)
 * - There's a day with completed = false
 * 
 * @param habitLogs - Array of habit logs, should be sorted by date descending
 * @returns The current streak count (0 if no streak)
 * 
 * @example
 * ```ts
 * // Logs: [today: completed, yesterday: completed, day before: not completed]
 * calculateStreak(logs) // Returns 2
 * ```
 */
export function calculateStreak(habitLogs: HabitLog[]): number {
  if (habitLogs.length === 0) {
    return 0
  }

  // Sort logs by date descending (most recent first)
  const sortedLogs = [...habitLogs].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Get today's date
  const today = getTodayDate()
  const todayDate = new Date(today)
  todayDate.setHours(0, 0, 0, 0)

  // Create a map of dates to completion status for quick lookup
  const logMap = new Map<string, boolean>()
  for (const log of sortedLogs) {
    const logDate = formatDate(log.date)
    logMap.set(logDate, log.completed)
  }

  let streak = 0
  let currentDate = new Date(todayDate)

  // Check backwards from today
  while (true) {
    const dateStr = formatDate(currentDate)
    const completed = logMap.get(dateStr)

    // If no log entry exists for this date, streak breaks
    if (completed === undefined) {
      break
    }

    // If completed is false, streak breaks
    if (!completed) {
      break
    }

    // Increment streak and move to previous day
    streak++
    currentDate.setDate(currentDate.getDate() - 1)
  }

  return streak
}

/**
 * Checks if a habit was completed today
 * Uses local timezone for accurate day detection
 * 
 * @param habitLogs - Array of habit logs for the habit
 * @returns true if there's a log entry for today with completed = true
 */
export function isCompletedToday(habitLogs: HabitLog[]): boolean {
  const today = getTodayDateLocal()
  const todayLog = habitLogs.find((log) => formatDateLocal(log.date) === today)
  return todayLog?.completed === true
}

/**
 * Gets the log entry for today if it exists
 * Uses local timezone for accurate day detection
 * 
 * @param habitLogs - Array of habit logs for the habit
 * @returns The log entry for today, or undefined if it doesn't exist
 */
export function getTodayLog(habitLogs: HabitLog[]): HabitLog | undefined {
  const today = getTodayDateLocal()
  return habitLogs.find((log) => formatDateLocal(log.date) === today)
}

