import { create } from 'zustand';
import type { TimeSlot } from '@/types';

interface BookingDraftStore {
  selectedSlot: TimeSlot | null;
  seatIds: number[];
  /** Changing the slot clears the seats: availability differs per slot. */
  selectSlot: (slot: TimeSlot | null) => void;
  toggleSeat: (id: number) => void;
  clear: () => void;
}

export const useBookingDraftStore = create<BookingDraftStore>((set) => ({
  selectedSlot: null,
  seatIds: [],
  selectSlot: (slot) => set({ selectedSlot: slot, seatIds: [] }),
  toggleSeat: (id) =>
    set((s) => ({
      seatIds: s.seatIds.includes(id) ? s.seatIds.filter((x) => x !== id) : [...s.seatIds, id],
    })),
  clear: () => set({ selectedSlot: null, seatIds: [] }),
}));
