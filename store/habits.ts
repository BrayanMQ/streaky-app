import { create } from 'zustand';

interface HabitsStore {
  // Local UI state for habits (filters, sorting, search, etc.)
  // This store is for client-side state only.
  // Server state is managed by React Query in hooks/useHabits.ts
}

export const useHabitsStore = create<HabitsStore>(() => ({
  // Initial state - can be extended as needed
  // Examples of what could go here:
  // - searchQuery: string
  // - sortBy: 'title' | 'created_at' | 'streak'
  // - filterBy: 'all' | 'active' | 'completed'
  // - viewMode: 'list' | 'grid'
}));

