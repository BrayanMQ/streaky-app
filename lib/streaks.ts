import type { HabitLog } from '@/types/database'

/**
 * Utility functions for streak calculations
 * 
 * Handles timezone-aware date calculations and optimized streak computation
 * using date indexes for O(1) lookups.
 */

/**
 * Formats a date to YYYY-MM-DD format using local timezone
 * @param date - Date object or date string
 * @returns Formatted date string (YYYY-MM-DD) in local timezone
 */
export function formatDateLocal(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Gets today's date in YYYY-MM-DD format using local timezone
 * @returns Today's date string in local timezone
 */
export function getTodayDateLocal(): string {
  return formatDateLocal(new Date())
}

/**
 * Gets yesterday's date in YYYY-MM-DD format using local timezone
 * @returns Yesterday's date string in local timezone
 */
export function getYesterdayDateLocal(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return formatDateLocal(yesterday)
}

/**
 * Creates an optimized date index map from habit logs
 * Maps date strings (YYYY-MM-DD) to completion status (boolean)
 * 
 * @param logs - Array of habit logs
 * @returns Map<string, boolean> for O(1) date lookups
 */
function createDateIndex(logs: HabitLog[]): Map<string, boolean> {
  const index = new Map<string, boolean>()
  for (const log of logs) {
    const dateStr = formatDateLocal(log.date)
    // If multiple logs exist for the same date, keep the most recent one
    // (though this shouldn't happen in normal operation)
    index.set(dateStr, log.completed)
  }
  return index
}

/**
 * Calculates the current streak for a habit based on its logs
 * 
 * Logic:
 * - If today is completed, count consecutive days from today backwards
 * - If today is NOT completed, start counting from yesterday backwards
 * - Streak breaks if there's a missing day or a day with completed = false
 * 
 * @param habitId - The habit ID (for future use, currently not used)
 * @param logs - Array of habit logs
 * @returns The current streak count (0 if no streak)
 * 
 * @example
 * ```ts
 * // Today: not completed, Yesterday: completed, Day before: completed
 * calculateStreak('habit-1', logs) // Returns 2 (yesterday + day before)
 * 
 * // Today: completed, Yesterday: completed
 * calculateStreak('habit-1', logs) // Returns 2 (today + yesterday)
 * ```
 */
export function calculateStreak(habitId: string, logs: HabitLog[]): number {
  if (logs.length === 0) {
    return 0
  }

  // Create optimized date index for O(1) lookups
  const dateIndex = createDateIndex(logs)

  const today = getTodayDateLocal()
  const todayCompleted = dateIndex.get(today) === true

  // Determine starting date: if today is completed, start from today
  // Otherwise, start from yesterday
  const startDate = new Date(today)
  if (!todayCompleted) {
    startDate.setDate(startDate.getDate() - 1)
  }
  startDate.setHours(0, 0, 0, 0)

  let streak = 0
  let currentDate = new Date(startDate)

  // Count consecutive completed days going backwards
  while (true) {
    const dateStr = formatDateLocal(currentDate)
    const completed = dateIndex.get(dateStr)

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
 * Gets the current streak for a habit
 * 
 * This is an alias for calculateStreak that follows the naming convention
 * requested in the issue.
 * 
 * @param habitId - The habit ID
 * @param logs - Array of habit logs
 * @returns The current streak count
 */
export function getCurrentStreak(habitId: string, logs: HabitLog[]): number {
  return calculateStreak(habitId, logs)
}

/**
 * Gets the longest streak ever achieved for a habit
 * 
 * Scans through all logs to find the longest consecutive sequence
 * of completed days, regardless of when it occurred.
 * 
 * @param habitId - The habit ID (for future use, currently not used)
 * @param logs - Array of habit logs
 * @returns The longest streak count (0 if no streaks found)
 * 
 * @example
 * ```ts
 * // Logs: [Jan 1: completed, Jan 2: completed, Jan 3: not, Jan 4: completed, Jan 5: completed]
 * getLongestStreak('habit-1', logs) // Returns 2 (either Jan 1-2 or Jan 4-5)
 * ```
 */
export function getLongestStreak(habitId: string, logs: HabitLog[]): number {
  if (logs.length === 0) {
    return 0
  }

  // Sort logs by date ascending (oldest first)
  const sortedLogs = [...logs].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  })

  let longestStreak = 0
  let currentStreak = 0
  let previousDate: Date | null = null

  for (const log of sortedLogs) {
    if (!log.completed) {
      // Reset streak if not completed
      longestStreak = Math.max(longestStreak, currentStreak)
      currentStreak = 0
      previousDate = null
      continue
    }

    const logDate = new Date(log.date)
    logDate.setHours(0, 0, 0, 0)

    if (previousDate === null) {
      // First completed log
      currentStreak = 1
      previousDate = logDate
    } else {
      // Check if this date is consecutive to the previous one
      const daysDiff = Math.floor(
        (logDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === 1) {
        // Consecutive day, increment streak
        currentStreak++
      } else {
        // Gap found, reset streak
        longestStreak = Math.max(longestStreak, currentStreak)
        currentStreak = 1
      }
      previousDate = logDate
    }
  }

  // Check final streak
  longestStreak = Math.max(longestStreak, currentStreak)

  return longestStreak
}

