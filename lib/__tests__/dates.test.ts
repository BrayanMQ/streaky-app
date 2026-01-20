import { canEditDay, getOldestEditableDate } from '../dates'

// Mock the current date for consistent testing
const MOCK_TODAY = '2025-01-19'

// Mock getTodayDateLocal to return a fixed date
jest.mock('../streaks', () => ({
    ...jest.requireActual('../streaks'),
    getTodayDateLocal: () => MOCK_TODAY,
}))

describe('canEditDay', () => {
    describe('editable days (last 3 days)', () => {
        it('should return true for today', () => {
            expect(canEditDay('2025-01-19')).toBe(true)
        })

        it('should return true for yesterday', () => {
            expect(canEditDay('2025-01-18')).toBe(true)
        })

        it('should return true for day before yesterday', () => {
            expect(canEditDay('2025-01-17')).toBe(true)
        })

        it('should return true for today as Date object', () => {
            const today = new Date(2025, 0, 19) // Jan 19, 2025
            expect(canEditDay(today)).toBe(true)
        })

        it('should return true for yesterday as Date object', () => {
            const yesterday = new Date(2025, 0, 18) // Jan 18, 2025
            expect(canEditDay(yesterday)).toBe(true)
        })
    })

    describe('non-editable days', () => {
        it('should return false for 3 days ago', () => {
            expect(canEditDay('2025-01-16')).toBe(false)
        })

        it('should return false for 7 days ago', () => {
            expect(canEditDay('2025-01-12')).toBe(false)
        })

        it('should return false for a month ago', () => {
            expect(canEditDay('2024-12-19')).toBe(false)
        })

        it('should return false for future dates', () => {
            expect(canEditDay('2025-01-20')).toBe(false)
        })

        it('should return false for far future dates', () => {
            expect(canEditDay('2025-02-01')).toBe(false)
        })

        it('should return false for 3 days ago as Date object', () => {
            const threeDaysAgo = new Date(2025, 0, 16) // Jan 16, 2025
            expect(canEditDay(threeDaysAgo)).toBe(false)
        })
    })

    describe('month boundary cases', () => {
        // These tests use the mocked date of 2025-01-19
        // In a real scenario, we'd want to test when today is Jan 1 or Jan 2

        it('should handle dates from previous month correctly', () => {
            // Since today is Jan 19, Dec 31 is definitely not editable
            expect(canEditDay('2024-12-31')).toBe(false)
        })
    })
})

describe('getOldestEditableDate', () => {
    it('should return the day before yesterday', () => {
        // With today being 2025-01-19, oldest editable is 2025-01-17
        expect(getOldestEditableDate()).toBe('2025-01-17')
    })
})
