import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AddHabitModal } from '../AddHabitModal'
import { useUIStore } from '@/store/ui'
import { useCreateHabit } from '@/hooks/useHabits'

// Mock dependencies
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}))

jest.mock('@/components/I18nProvider', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/store/ui', () => ({
    useUIStore: jest.fn(),
}))

jest.mock('@/hooks/useHabits', () => ({
    useCreateHabit: jest.fn(),
}))

jest.mock('../habit-emoji-picker', () => ({
    HabitEmojiPicker: () => <div data-testid="emoji-picker">EmojiPicker</div>
}))

// Mock Dialog components (Radix UI)
jest.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: any) => (open ? <div>{children}</div> : null),
    DialogContent: ({ children }: any) => <div>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogTitle: ({ children }: any) => <div>{children}</div>,
    DialogDescription: ({ children }: any) => <div>{children}</div>,
    DialogFooter: ({ children }: any) => <div>{children}</div>,
}))

describe('AddHabitModal', () => {
    const mockClose = jest.fn()
    const mockCreateHabit = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

            // Setup store mock
            ; (useUIStore as unknown as jest.Mock).mockReturnValue({
                isAddHabitModalOpen: true,
                closeAddHabitModal: mockClose,
            })

            // Setup hook mock
            ; (useCreateHabit as unknown as jest.Mock).mockReturnValue({
                createHabit: mockCreateHabit,
                isCreating: false,
                createError: null,
            })
    })

    it('renders when open', () => {
        render(<AddHabitModal />)
        expect(screen.getByText('modals.addHabit.title')).toBeInTheDocument()
    })

    it('validates input length', async () => {
        render(<AddHabitModal />)

        const input = screen.getByPlaceholderText('modals.addHabit.placeholderName')

        // Type too short
        fireEvent.change(input, { target: { value: 'a' } })

        // Validation is real-time in code?
        // "validateTitle" called on change.
        // "setTitleError" sets error. error text is rendered.
        // t('modals.common.minChars')

        // Need to match mocked translation key
        // wait for error?
        expect(screen.getByText('modals.common.minChars')).toBeInTheDocument()
    })

    it('submits valid form', async () => {
        render(<AddHabitModal />)

        const input = screen.getByPlaceholderText('modals.addHabit.placeholderName')
        fireEvent.change(input, { target: { value: 'New Habit' } })

        const submitBtn = screen.getByText('modals.addHabit.submit') // Assuming button text
        fireEvent.click(submitBtn)

        await waitFor(() => {
            expect(mockCreateHabit).toHaveBeenCalledWith(expect.objectContaining({
                title: 'New Habit'
            }))
        })
    })
})
