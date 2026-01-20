import { getTodayDateLocal, formatDateLocal } from './streaks'

/**
 * Number of days in the past that can be edited (including today)
 * 3 means: today, yesterday, and the day before yesterday
 */
const EDITABLE_DAYS_WINDOW = 3

/**
 * Parses a YYYY-MM-DD date string as a local date (not UTC)
 * This is important because new Date("YYYY-MM-DD") interprets it as UTC,
 * which can cause day shifts in negative timezones
 * 
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object representing the date in local timezone at midnight
 */
function parseDateLocal(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number)
    // Create date in local timezone (month is 0-indexed in Date constructor)
    const date = new Date(year, month - 1, day)
    date.setHours(0, 0, 0, 0)
    return date
}

/**
 * Checks if a date is editable (within the last 3 calendar days)
 * 
 * A day is editable if: date >= today - 2 days
 * This means: today, yesterday, and the day before yesterday are editable.
 * 
 * The rule is based on calendar days, not hours (NOT a 72h window).
 * 
 * @param date - Date to check (Date object or YYYY-MM-DD string)
 * @returns true if the date can be edited
 * 
 * @example
 * ```ts
 * // If today is 2025-01-19
 * canEditDay('2025-01-19') // true (today)
 * canEditDay('2025-01-18') // true (yesterday)
 * canEditDay('2025-01-17') // true (day before yesterday)
 * canEditDay('2025-01-16') // false (3 days ago)
 * canEditDay('2025-01-20') // false (future)
 * ```
 */
export function canEditDay(date: Date | string): boolean {
    // Normalize the input date to YYYY-MM-DD string
    const targetDateStr = formatDateLocal(date)
    const todayStr = getTodayDateLocal()

    // Parse both dates as local dates at midnight
    const targetDate = parseDateLocal(targetDateStr)
    const today = parseDateLocal(todayStr)

    // Calculate the difference in days
    const diffTime = today.getTime() - targetDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    // Editable if:
    // - diffDays >= 0 (not in the future)
    // - diffDays < EDITABLE_DAYS_WINDOW (within the window)
    return diffDays >= 0 && diffDays < EDITABLE_DAYS_WINDOW
}

/**
 * Gets the oldest editable date in YYYY-MM-DD format
 * 
 * @returns The oldest date that can still be edited
 */
export function getOldestEditableDate(): string {
    const today = parseDateLocal(getTodayDateLocal())
    today.setDate(today.getDate() - (EDITABLE_DAYS_WINDOW - 1))
    return formatDateLocal(today)
}
