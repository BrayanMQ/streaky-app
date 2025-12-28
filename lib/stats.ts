import type { Habit, HabitLog } from '@/types/database'
import { formatDateLocal, getTodayDateLocal } from './streaks'
import { getLongestStreak } from './streaks'

/**
 * Utility functions for calculating habit statistics
 */

/**
 * Parses a YYYY-MM-DD date string as a local date (not UTC)
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object representing the date in local timezone
 */
function parseDateLocal(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  // Create date in local timezone (month is 0-indexed in Date constructor)
  return new Date(year, month - 1, day)
}

/**
 * Gets a date N days ago from today in YYYY-MM-DD format
 * @param days - Number of days ago
 * @returns Date string in YYYY-MM-DD format
 */
function getDaysAgoDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return formatDateLocal(date)
}

/**
 * Calculates the completion rate of a habit in the last N days
 * @param habitId - The habit ID
 * @param logs - Array of habit logs for the habit
 * @param days - Number of days to look back (default: 30)
 * @returns Completion rate as a percentage (0-100)
 */
export function getCompletionRate(
  habitId: string,
  logs: HabitLog[],
  days: number = 30
): number {
  if (logs.length === 0) {
    return 0
  }

  const today = getTodayDateLocal()
  const startDate = getDaysAgoDate(days - 1) // Include today, so days-1 ago

  // Filter logs within the date range
  const logsInRange = logs.filter((log) => {
    const logDate = formatDateLocal(log.date)
    return logDate >= startDate && logDate <= today
  })

  // Count completed days
  const completedDays = logsInRange.filter((log) => log.completed).length

  // Calculate rate: completed days / total days in range
  // Use actual days in range (could be less than 'days' if habit is newer)
  const startDateObj = parseDateLocal(startDate)
  const todayDateObj = parseDateLocal(today)
  const daysDiff = Math.floor(
    (todayDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1 // +1 to include both start and end dates

  const totalDays = Math.min(days, daysDiff)
  
  if (totalDays === 0) {
    return 0
  }

  return Math.round((completedDays / totalDays) * 100)
}

/**
 * Finds the best (longest) streak among all habits
 * @param habits - Array of habits
 * @param logsByHabitId - Map of habit IDs to their logs
 * @returns The longest streak value among all habits
 */
export function getBestStreak(
  habits: Habit[],
  logsByHabitId: Map<string, HabitLog[]>
): number {
  if (habits.length === 0) {
    return 0
  }

  let bestStreak = 0

  for (const habit of habits) {
    const habitLogs = logsByHabitId.get(habit.id) || []
    const longestStreak = getLongestStreak(habit.id, habitLogs)
    bestStreak = Math.max(bestStreak, longestStreak)
  }

  return bestStreak
}

/**
 * Calculates the total number of unique days tracked across all habits
 * @param logs - Array of all habit logs
 * @returns Number of unique days tracked
 */
export function getTotalDaysTracked(logs: HabitLog[]): number {
  if (logs.length === 0) {
    return 0
  }

  const uniqueDates = new Set<string>()
  
  for (const log of logs) {
    const dateStr = formatDateLocal(log.date)
    uniqueDates.add(dateStr)
  }

  return uniqueDates.size
}

/**
 * Calculates the average completion rate across all habits
 * @param habits - Array of habits
 * @param logsByHabitId - Map of habit IDs to their logs
 * @param days - Number of days to look back (default: 30)
 * @returns Average completion rate as a percentage (0-100)
 */
export function getAverageCompletionRate(
  habits: Habit[],
  logsByHabitId: Map<string, HabitLog[]>,
  days: number = 30
): number {
  if (habits.length === 0) {
    return 0
  }

  let totalRate = 0

  for (const habit of habits) {
    const habitLogs = logsByHabitId.get(habit.id) || []
    const rate = getCompletionRate(habit.id, habitLogs, days)
    totalRate += rate
  }

  return Math.round(totalRate / habits.length)
}

/**
 * Gets the number of completed days for a habit in the last N days
 * @param habitId - The habit ID
 * @param logs - Array of habit logs for the habit
 * @param days - Number of days to look back (default: 30)
 * @returns Number of completed days
 */
export function getCompletedDaysInRange(
  habitId: string,
  logs: HabitLog[],
  days: number = 30
): number {
  if (logs.length === 0) {
    return 0
  }

  const today = getTodayDateLocal()
  const startDate = getDaysAgoDate(days - 1) // Include today

  // Filter logs within the date range and count completed
  const completedLogs = logs.filter((log) => {
    const logDate = formatDateLocal(log.date)
    return logDate >= startDate && logDate <= today && log.completed
  })

  return completedLogs.length
}

