import {
    getCompletionRate,
    getBestStreak,
    getTotalDaysTracked,
    getAverageCompletionRate,
    getDaysForPeriod,
    getPeriodLabel
} from '../stats'
import type { Habit, HabitLog } from '@/types/database'

const createLog = (date: string, completed: boolean = true, habitId: string = 'habit-1'): HabitLog => ({
    id: 'log-id',
    habit_id: habitId,
    date,
    completed
})

describe('stats.ts', () => {
    beforeEach(() => {
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-01-10T12:00:00.000Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    describe('Basic utilities', () => {
        it('should return correct days for periods', () => {
            expect(getDaysForPeriod('week')).toBe(7)
            expect(getDaysForPeriod('month')).toBe(30)
            expect(getDaysForPeriod('year')).toBe(365)
        })

        it('should return correct labels for periods', () => {
            expect(getPeriodLabel('week')).toBe('Last 7 days')
        })
    })

    describe('getCompletionRate', () => {
        it('should return 0 if no logs', () => {
            expect(getCompletionRate('habit-1', [])).toBe(0)
        })

        it('should calculate rate correctly for last 30 days', () => {
            // 3 completed days out of 3 total days in range (if data started 3 days ago)
            // or 3 completed days out of 30 if we assume window?
            // The logic is: totalDays = Math.min(days, daysDiff).
            // If data is dense (past 30 days exist), it's completed / 30.

            // Let's seed completion for 5 days in a row, ending today.
            // Window 30. Start date = 30 days ago.
            // Logs only exist for last 5 days.
            // daysDiff = 5. totalDays = 5. Rate = 5/5 = 100%.
            const logs = [
                createLog('2024-01-10'),
                createLog('2024-01-09'),
                createLog('2024-01-08'),
                createLog('2024-01-07'),
                createLog('2024-01-06'),
            ]
            expect(getCompletionRate('habit-1', logs, 5)).toBe(100)
        })

        it('should calculate rate considering unlogged days as missed IF they form the range?', () => {
            // Wait, `getCompletionRate` logic:
            // logsInRange = logs filtered by date.
            // completedDays = logsInRange.completed length.
            // daysDiff = today - startDate.
            // totalDays = min(days, daysDiff).

            // Issue with current implementation: It calculates based on FIRST log within range?
            // No, it uses `startDate` variable which is `getDaysAgoDate(days - 1)`.
            // The `daysDiff` is calculated from `startDate` (which is computed from `days`).

            // Wait, let's re-read the code logic in `stats.ts`:
            // `const startDate = getDaysAgoDate(days - 1)`
            // `const startDateObj = parseDateLocal(startDate)`
            // So `daysDiff` will always be `days` (approx).

            // Actually `daysDiff` logic:
            // `(todayDateObj - startDateObj) ... + 1`. This is roughly `days`.
            // So `totalDays` is basically `days` unless something weird happens.

            // So if I have 1 completed log today, and check 30 days... rate = 1/30 = 3%.
            const logs = [
                createLog('2024-01-10')
            ]
            expect(getCompletionRate('habit-1', logs, 10)).toBe(10) // 1/10 = 10%
        })
    })

    describe('getBestStreak', () => {
        it('should find the max streak across all habits', () => {
            const habits = [
                { id: 'h1' } as Habit,
                { id: 'h2' } as Habit
            ]

            // H1: 3 days streak
            const logsH1 = [
                createLog('2024-01-10', true, 'h1'),
                createLog('2024-01-09', true, 'h1'),
                createLog('2024-01-08', true, 'h1'),
            ]

            // H2: 5 days streak
            const logsH2 = [
                createLog('2024-01-10', true, 'h2'),
                createLog('2024-01-09', true, 'h2'),
                createLog('2024-01-08', true, 'h2'),
                createLog('2024-01-07', true, 'h2'),
                createLog('2024-01-06', true, 'h2'),
            ]

            const logsMap = new Map<string, HabitLog[]>()
            logsMap.set('h1', logsH1)
            logsMap.set('h2', logsH2)

            expect(getBestStreak(habits, logsMap)).toBe(5)
        })
    })

    describe('getTotalDaysTracked', () => {
        it('should count unique days across all logs', () => {
            const logs = [
                createLog('2024-01-10', true, 'h1'),
                createLog('2024-01-10', true, 'h2'), // Duplicate date
                createLog('2024-01-09', true, 'h1'),
            ]
            expect(getTotalDaysTracked(logs)).toBe(2)
        })
    })

    describe('getAverageCompletionRate', () => {
        it('should average rates of provided habits', () => {
            const habits = [
                { id: 'h1' } as Habit,
                { id: 'h2' } as Habit
            ]

            // H1: 100% (1/1 day) - wait, rate logic uses fixed window
            // Let's use 1 day window for simplicity
            // H1: Completed today -> 100%
            const logsH1 = [createLog('2024-01-10', true, 'h1')]

            // H2: Not completed today -> 0% (assuming empty log means missed)
            const logsH2: HabitLog[] = []

            const logsMap = new Map<string, HabitLog[]>()
            logsMap.set('h1', logsH1)
            logsMap.set('h2', logsH2)

            // (100 + 0) / 2 = 50
            expect(getAverageCompletionRate(habits, logsMap, 1)).toBe(50)
        })
    })
})
