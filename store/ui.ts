import { create } from 'zustand';
import type { Habit } from '@/types/database';

interface UIStore {
  // Modal states
  isAddHabitModalOpen: boolean;
  isEditHabitModalOpen: boolean;
  isDeleteHabitModalOpen: boolean;

  // Selected habit for editing/deleting
  selectedHabit: Habit | null;

  // Actions
  openAddHabitModal: () => void;
  closeAddHabitModal: () => void;
  openEditHabitModal: () => void;
  closeEditHabitModal: () => void;
  openDeleteHabitModal: () => void;
  closeDeleteHabitModal: () => void;
  closeAllModals: () => void;
  setSelectedHabit: (habit: Habit | null) => void;
  clearSelectedHabit: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // Initial state
  isAddHabitModalOpen: false,
  isEditHabitModalOpen: false,
  isDeleteHabitModalOpen: false,
  selectedHabit: null,

  // Modal actions
  openAddHabitModal: () => set({ isAddHabitModalOpen: true }),
  closeAddHabitModal: () => set({ isAddHabitModalOpen: false }),
  openEditHabitModal: () => set({ isEditHabitModalOpen: true }),
  closeEditHabitModal: () => set({ isEditHabitModalOpen: false }),
  openDeleteHabitModal: () => set({ isDeleteHabitModalOpen: true }),
  closeDeleteHabitModal: () => set({ isDeleteHabitModalOpen: false }),
  closeAllModals: () =>
    set({
      isAddHabitModalOpen: false,
      isEditHabitModalOpen: false,
      isDeleteHabitModalOpen: false,
    }),

  // Selected habit actions
  setSelectedHabit: (habit) => set({ selectedHabit: habit }),
  clearSelectedHabit: () => set({ selectedHabit: null }),
}));

