import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CalendarPage from '../page'
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

// Mock scrollIntoView and other DOM methods not present in jsdom
window.HTMLElement.prototype.scrollTo = jest.fn()

describe('CalendarPage', () => {
    const mockHabits: Habit[] = [
        {
            id: 'habit-1',
            title: 'Habit 1',
            color: 'bg-red-500',
            icon: 'test',
            created_at: '2024-01-01',
            user_id: 'user-1',
            frequency: null,
            archived_at: null
        },
        {
            id: 'habit-2',
            title: 'Habit 2',
            color: 'bg-blue-500',
            icon: 'test',
            created_at: '2024-01-01',
            user_id: 'user-1',
            frequency: null,
            archived_at: null
        }
    ]

    const mockLogs: HabitLog[] = [
        {
            id: 'log-1',
            habit_id: 'habit-1',
            date: '2024-01-15', // Mid-month
            completed: true
        }
    ]

    beforeEach(() => {
        jest.clearAllMocks()

            // Default mocks
            ; (useHabits as jest.Mock).mockReturnValue({
                habits: mockHabits,
                isLoading: false,
            })

            ; (useHabitLogs as jest.Mock).mockReturnValue({
                logs: mockLogs,
                isLoading: false,
            })

        // Mock date to consistent value (Jan 2024)
        jest.useFakeTimers()
        jest.setSystemTime(new Date('2024-01-10T12:00:00.000Z'))
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('renders loading state initially', () => {
        ; (useHabits as jest.Mock).mockReturnValue({
            habits: [],
            isLoading: true,
        })

        // Won't show specific loading text, but acts on it.
        // The component renders "..." for stats when loading.
        render(<CalendarPage />)

        // Check for some loading indicator or absence of content
        const statsValues = screen.getAllByText('...')
        expect(statsValues.length).toBeGreaterThan(0)
    })

    it('renders empty state when no habits', () => {
        ; (useHabits as jest.Mock).mockReturnValue({
            habits: [],
            isLoading: false,
        })

        render(<CalendarPage />)

        expect(screen.getByText('calendar.noHabits')).toBeInTheDocument()
        expect(screen.getByText('calendar.createFirst')).toBeInTheDocument()
    })

    it('renders calendar and stats with habits', () => {
        render(<CalendarPage />)

        // Check habits are listed
        expect(screen.getByText('Habit 1')).toBeInTheDocument()
        expect(screen.getByText('Habit 2')).toBeInTheDocument()

        // Check header info
        expect(screen.getByText('calendar.months.january')).toBeInTheDocument()
        expect(screen.getByText('2024')).toBeInTheDocument()
    })

    it('switches selected habit', () => {
        render(<CalendarPage />)

        const habit2Btn = screen.getByText('Habit 2')
        fireEvent.click(habit2Btn)

        // Component should update selected habit state.
        // We can check if style changes or internal state logic works.
        // In this component, selecting a habit triggers a scroll and recalculates stats.

        // Since we mock useHabitLogs to return logs for habit-1 only,
        // switching to habit-2 should likely show 0 completed days if filtering works.

        // Habit 1 has 1 log. Habit 2 has 0.
        // Default selection is Habit 1.
        // Wait for text "1" in stats (completed days) - might be tricky due to generic text
        // Let's rely on button class change or visually hidden select logic if easier, 
        // but button variant check is good.

        // The button for Habit 2 is the parent of the span with text "Habit 2"
        // fireEvent.click clicked the span probably, bubbling to button.

        // Re-query to get updated DOM
        const habit2BtnUpdated = screen.getByText('Habit 2').closest('button')
        expect(habit2BtnUpdated).toHaveClass('ring-2') // Selected class
    })

    it('navigates months', () => {
        render(<CalendarPage />)

        expect(screen.getByText('calendar.months.january')).toBeInTheDocument()

        // Find next month button (chevron right)
        // It's an icon button, might need ari-label or role.
        // The code shows <ChevronRight /> inside a Button.
        // Let's assume buttons are in order? Or try to get by role 'button' with icon?
        // There are habit buttons too.

        // Easier: render writes "calendar.months.january".
        // Next button logic: select month + 1.

        // The buttons have no text, just icons.
        // We can add data-testid or aria-label in source, or select by class/icon.
        // For now, let's try selecting all buttons and clicking the last one (Next) 
        // or typically Previous is earlier in DOM than Next in the header.

        const buttons = screen.getAllByRole('button')
        // Habit buttons (2) + Previous + Next
        const nextBtn = buttons[buttons.length - 1]

        fireEvent.click(nextBtn)

        expect(screen.getByText('calendar.months.february')).toBeInTheDocument()
    })
})
