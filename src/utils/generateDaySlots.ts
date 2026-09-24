import type { TimeSlot } from '@/types';

const DAY_START_HOUR = 8;
const DAY_END_HOUR = 20;
const SLOT_DURATION_MINUTES = 60;

export function generateDaySlots(date: Date): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const cursor = new Date(date);
  cursor.setHours(DAY_START_HOUR, 0, 0, 0);
  const end = new Date(date);
  end.setHours(DAY_END_HOUR, 0, 0, 0);

  while (cursor < end) {
    const start = new Date(cursor);
    cursor.setMinutes(cursor.getMinutes() + SLOT_DURATION_MINUTES);
    slots.push({ start: start.toISOString(), end: new Date(cursor).toISOString() });
  }

  return slots;
}
