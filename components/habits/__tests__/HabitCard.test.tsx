import { render, screen, fireEvent } from '@testing-library/react'
import { HabitCard } from '../HabitCard'
import { HabitWithLogs } from '@/types/database'
import '@testing-library/jest-dom'

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'habits.card.streak') return `${options.count} day streak`
            return key
        },
    }),
}))

jest.mock('@/components/I18nProvider', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/store/ui', () => ({
    useUIStore: () => ({
        setSelectedHabit: jest.fn(),
        openEditHabitModal: jest.fn(),
        openDeleteHabitModal: jest.fn(),
    }),
}))

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, className, onClick }: any) => (
            <div className={className} onClick={onClick}>
                {children}
            </div>
        ),
        span: ({ children, className }: any) => <span className={className}>{children}</span>,
    },
}))

describe('HabitCard', () => {
    const mockHabit: HabitWithLogs = {
        id: 'habit-1',
        title: 'Test Habit',
        streak: 5,
        completedToday: false,
        color: 'bg-red-500',
        icon: '🎯',
        created_at: '2024-01-01',
        user_id: 'user-1',
        frequency: null
    }

    const mockOnToggle = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders habit title and streak', () => {
        render(<HabitCard habit={mockHabit} onToggle={mockOnToggle} />)

        expect(screen.getByText('Test Habit')).toBeInTheDocument()
        expect(screen.getByText('5 day streak')).toBeInTheDocument()
    })

    it('calls onToggle when clicked in execution mode', () => {
        render(<HabitCard habit={mockHabit} onToggle={mockOnToggle} mode="execution" />)

        // Find the card (clickable container)
        // The card has "Test Habit" inside it.
        const cardTitle = screen.getByText('Test Habit')
        // Click parent card
        fireEvent.click(cardTitle) // Event bubbles up to Card

        // Depending on markup, might need to find the card specifically.
        // But click bubbles.
        expect(mockOnToggle).toHaveBeenCalledWith('habit-1')
    })

    it('renders correctly in management mode', () => {
        render(<HabitCard habit={mockHabit} onToggle={mockOnToggle} mode="management" />)

        // Should show icon
        expect(screen.getByText('🎯')).toBeInTheDocument()
        // Should NOT show streak text (based on code logic: isExecution && ...)
        expect(screen.queryByText('5 day streak')).not.toBeInTheDocument()
    })
})
