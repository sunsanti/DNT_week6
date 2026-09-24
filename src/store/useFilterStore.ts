import { create } from 'zustand';
import { EMPTY_FILTERS, type FilterState } from '@/types';

interface FilterStore {
  filters: FilterState;
  setQuery: (query: string) => void;
  toggleBuilding: (building: string) => void;
  setMinCapacity: (minCapacity: number | undefined) => void;
  setStatus: (status: FilterState['status']) => void;
  setType: (type: FilterState['type']) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  filters: EMPTY_FILTERS,
  setQuery: (query) => set((s) => ({ filters: { ...s.filters, query } })),
  toggleBuilding: (building) =>
    set((s) => {
      const buildings = s.filters.buildings.includes(building)
        ? s.filters.buildings.filter((b) => b !== building)
        : [...s.filters.buildings, building];
      return { filters: { ...s.filters, buildings } };
    }),
  setMinCapacity: (minCapacity) => set((s) => ({ filters: { ...s.filters, minCapacity } })),
  setStatus: (status) =>
    set((s) => ({
      filters: { ...s.filters, status: s.filters.status === status ? undefined : status },
    })),
  setType: (type) =>
    set((s) => ({ filters: { ...s.filters, type: s.filters.type === type ? undefined : type } })),
  reset: () => set({ filters: EMPTY_FILTERS }),
}));
