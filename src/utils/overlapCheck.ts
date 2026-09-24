import type { TimeSlot } from '@/types';

export function slotsOverlap(a: TimeSlot, b: TimeSlot): boolean {
  const aStart = new Date(a.start).getTime();
  const aEnd = new Date(a.end).getTime();
  const bStart = new Date(b.start).getTime();
  const bEnd = new Date(b.end).getTime();

  return aStart < bEnd && bStart < aEnd;
}

export function overlapCheck(existingSlots: TimeSlot[], candidate: TimeSlot): boolean {
  return existingSlots.some((slot) => slotsOverlap(slot, candidate));
}

// Seat positions already held by confirmed bookings that overlap `slot`.
export function takenSeatIds(
  bookings: { slot: TimeSlot; seatIds: number[] }[],
  slot: TimeSlot,
): Set<number> {
  const taken = new Set<number>();
  for (const b of bookings) {
    if (slotsOverlap(b.slot, slot)) b.seatIds.forEach((id) => taken.add(id));
  }
  return taken;
}

export function seatsLeft(
  capacity: number,
  bookings: { slot: TimeSlot; seatIds: number[] }[],
  slot: TimeSlot,
): number {
  return Math.max(0, capacity - takenSeatIds(bookings, slot).size);
}
