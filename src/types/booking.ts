export interface TimeSlot {
  start: string;
  end: string;
}

export type BookingStatus = 'confirmed' | 'cancelled';

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  slot: TimeSlot;
  /** Zero-based seat positions held in the room. Shown to users as seatId + 1. */
  seatIds: number[];
  createdAt: string;
  status: BookingStatus;
}
