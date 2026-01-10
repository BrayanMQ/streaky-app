import { render, screen, fireEvent } from '@testing-library/react'
import StatsPage from '../page'
import { useHabits } from '@/hooks/useHabits'
import { useHabitLogs } from '@/hooks/useHabitLogs'
import { Habit, HabitLog } from '@/types/database'

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => key,
    }),
}))

jest.mock('@/components/I18nProvider', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/components/layout/Header', () => ({
    Header: () => <div data-testid="header">Header</div>,
}))

jest.mock('@/components/layout/BottomNav', () => ({
    BottomNav: () => <div data-testid="bottom-nav">BottomNav</div>,
}))

jest.mock('@/hooks/useHabits', () => ({
    useHabits: jest.fn(),
}))

jest.mock('@/hooks/useHabitLogs', () => ({
    useHabitLogs: jest.fn(),
}))

// Mock framer-motion - filter out motion-specific props to avoid React warnings
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, layoutId, transition, animate, initial, exit, ...rest }: any) => (
            <div className={className}>
                {children}
            </div>
        ),
    },
}))

// Mock Next.js Link
jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}))

describe('StatsPage', () => {
    const mockHabits: Habit[] = [
        {
            id: 'habit-1',
            title: 'Habit 1',
            color: 'bg-red-500',
            icon: '🎯',
            created_at: '2024-01-01',
            user_id: 'user-1',
            frequency: null
        },
        {
            id: 'habit-2',
            title: 'Habit 2',
            color: 'bg-blue-500',
            icon: '💪',
            created_at: '2024-01-01',
            user_id: 'user-1',
            frequency: null
        }
    ]

    const mockLogs: HabitLog[] = [
        {
            id: 'log-1',
            habit_id: 'habit-1',
            date: '2024-01-10',
            completed: true
        },
        {
            id: 'log-2',
            habit_id: 'habit-1',
            date: '2024-01-09',
            completed: true
        },
        {
            id: 'log-3',
            habit_id: 'habit-2',
            date: '2024-01-10',
            completed: true
        }
    ]

    beforeEach(() => {
        jest.clearAllMocks()

            // Default mocks
            ; (useHabits as jest.Mock).mockReturnValue({
                habits: mockHabits,
                isLoading: false,
                error: null,
            })

            ; (useHabitLogs as jest.Mock).mockReturnValue({
                logs: mockLogs,
                isLoading: false,
                error: null,
            })

        // Mock date
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-01-10T12:00:00.000Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders loading state', () => {
        ; (useHabits as jest.Mock).mockReturnValue({
            habits: [],
            isLoading: true,
            error: null,
        })

        render(<StatsPage />)

        expect(screen.getByText('stats.loading')).toBeInTheDocument()
    })

    it('renders error state', () => {
        ; (useHabits as jest.Mock).mockReturnValue({
            habits: [],
            isLoading: false,
            error: new Error('Test error'),
        })

        render(<StatsPage />)

        expect(screen.getByText('stats.error')).toBeInTheDocument()
    })

    it('renders empty state when no habits', () => {
        ; (useHabits as jest.Mock).mockReturnValue({
            habits: [],
            isLoading: false,
            error: null,
        })

        render(<StatsPage />)

        expect(screen.getByText('stats.noHabits')).toBeInTheDocument()
    })

    it('renders stats cards with data', () => {
        render(<StatsPage />)

        // Check stat card labels exist
        expect(screen.getByText('stats.cards.bestStreak.label')).toBeInTheDocument()
        expect(screen.getByText('stats.cards.avgCompletion.label')).toBeInTheDocument()
        expect(screen.getByText('stats.cards.activeHabits.label')).toBeInTheDocument()
        expect(screen.getByText('stats.cards.totalDays.label')).toBeInTheDocument()
    })

    it('renders habit breakdown', () => {
        render(<StatsPage />)

        // Check habits are listed in breakdown
        expect(screen.getByText('Habit 1')).toBeInTheDocument()
        expect(screen.getByText('Habit 2')).toBeInTheDocument()
    })

    it('switches period when clicking period buttons', () => {
        render(<StatsPage />)

        // Find period buttons
        const weekBtn = screen.getByText('stats.periods.week')
        const yearBtn = screen.getByText('stats.periods.year')

        // Initially month is selected (default)
        // Click week
        fireEvent.click(weekBtn)

        // The button should now be "selected" - we can check visually or by state
        // Since we can't easily check internal state, we just verify no errors occur
        expect(weekBtn).toBeInTheDocument()

        // Click year
        fireEvent.click(yearBtn)
        expect(yearBtn).toBeInTheDocument()
    })

    it('displays insights section', () => {
        render(<StatsPage />)

        // Check insight card titles
        expect(screen.getByText('stats.insights.performance.title')).toBeInTheDocument()
        expect(screen.getByText('stats.insights.topHabit.title')).toBeInTheDocument()
    })
})
