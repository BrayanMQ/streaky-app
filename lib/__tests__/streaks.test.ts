import { calculateStreak, getLongestStreak, formatDateLocal } from '../streaks'
import type { HabitLog } from '@/types/database'

// Helper to create logs
const createLog = (date: string, completed: boolean = true): HabitLog => ({
    id: 'log-id',
    habit_id: 'habit-id',
    date,
    completed
})

describe('streaks.ts', () => {
    beforeEach(() => {
        // Mock today to be 2024-01-10T12:00:00.000Z
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-01-10T12:00:00.000Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('formatDateLocal', () => {
        it('should format Date object correctly', () => {
            const date = new Date('2024-01-01T12:00:00.000Z')
            // Note: This test depends on local timezone, but we'll assume the environment uses UTC or consistent
            // For controlled testing, better to rely on what the function does: getFullYear etc.
            // With fake timers, date creation might be affected, but standard Date methods work.
            expect(formatDateLocal(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        })

        it('should return string input as-is if in YYYY-MM-DD format', () => {
            expect(formatDateLocal('2024-01-01')).toBe('2024-01-01')
        })

        it('should parse non-YYYY-MM-DD strings', () => {
            // "01/01/2024" or ISO string
            const iso = '2024-01-01T12:00:00.000Z'
            expect(formatDateLocal(iso)).toMatch(/^\d{4}-\d{2}-\d{2}$/)
        })
    })

    describe('calculateStreak', () => {
        it('should return 0 when no logs exist', () => {
            expect(calculateStreak('habit-1', [])).toBe(0)
        })

        it('should return current streak including today if completed', () => {
            const logs = [
                createLog('2024-01-10'), // Today
                createLog('2024-01-09'), // Yesterday
                createLog('2024-01-08'), // Day before
            ]
            expect(calculateStreak('habit-1', logs)).toBe(3)
        })

        it('should return current streak starting yesterday if today is not logged', () => {
            const logs = [
                createLog('2024-01-09'), // Yesterday
                createLog('2024-01-08'), // Day before
            ]
            expect(calculateStreak('habit-1', logs)).toBe(2)
        })

        it('should return 0 if neither today nor yesterday are completed', () => {
            const logs = [
                createLog('2024-01-07'), // 3 days ago
            ]
            expect(calculateStreak('habit-1', logs)).toBe(0)
        })

        it('should stop counting at a gap', () => {
            const logs = [
                createLog('2024-01-10'),
                createLog('2024-01-09'),
                // Gap at 08
                createLog('2024-01-07'),
            ]
            expect(calculateStreak('habit-1', logs)).toBe(2)
        })

        it('should stop counting if a day is explicitly not completed', () => {
            const logs = [
                createLog('2024-01-10'),
                createLog('2024-01-09', false),
                createLog('2024-01-08'),
            ]
            // Streak breaks at 09, but today (10) counts?
            // Logic says: if today completed, start from today, go back.
            // 10: true (streak=1). 09: false (break). result 1.
            expect(calculateStreak('habit-1', logs)).toBe(1)
        })
    })

    describe('getLongestStreak', () => {
        it('should return 0 for empty logs', () => {
            expect(getLongestStreak('habit-1', [])).toBe(0)
        })

        it('should calculate longest streak from history', () => {
            const logs = [
                createLog('2024-01-01'),
                createLog('2024-01-02'),
                createLog('2024-01-03'), // Streak of 3

                createLog('2024-01-05'), // Gap

                createLog('2024-01-07'),
                createLog('2024-01-08'), // Streak of 2
            ]
            expect(getLongestStreak('habit-1', logs)).toBe(3)
        })

        it('should handle unsorted logs', () => {
            const logs = [
                createLog('2024-01-03'),
                createLog('2024-01-01'),
                createLog('2024-01-02'),
            ]
            expect(getLongestStreak('habit-1', logs)).toBe(3)
        })
    })
})
