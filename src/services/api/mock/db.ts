import type { BaseRoom, Booking, FilterState, Room, TimeSlot } from '@/types';
import { applyFilters } from '@/utils/applyFilters';
import { overlapCheck, takenSeatIds } from '@/utils/overlapCheck';
import { SEED_ROOMS } from './fixtures';

const SIMULATED_LATENCY_MS = 300;

export class BookingConflictError extends Error {
  constructor(message = 'Booking conflict.') {
    super(message);
    this.name = 'BookingConflictError';
  }
}

let rooms: BaseRoom[] = SEED_ROOMS.map((room) => ({ ...room }));
let bookings: Booking[] = [];
let nextBookingId = 1;

const confirmedFor = (roomId: string) =>
  bookings.filter((b) => b.roomId === roomId && b.status === 'confirmed');

// ponytail: counts every confirmed booking, not just upcoming ones. Filter by slot end if
// bookings should stop holding seats once they finish.
function withAvailability(room: BaseRoom): Room {
  const held = confirmedFor(room.id).reduce((n, b) => n + b.seatIds.length, 0);
  const left = Math.max(0, room.capacity - held);
  return {
    ...room,
    seatsLeft: left,
    status: room.status === 'occupied' || left === 0 ? 'occupied' : 'available',
  };
}

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_LATENCY_MS));
}

export async function listRooms(filters: FilterState): Promise<Room[]> {
  return delay(applyFilters(rooms.map(withAvailability), filters));
}

export async function getRoom(roomId: string): Promise<Room | undefined> {
  const room = rooms.find((r) => r.id === roomId);
  return delay(room && withAvailability(room));
}

export async function listBookingsForRoom(roomId: string): Promise<Booking[]> {
  return delay(confirmedFor(roomId));
}

export async function listMyBookings(userId: string): Promise<Booking[]> {
  return delay(bookings.filter((b) => b.userId === userId));
}

export interface CreateBookingInput {
  roomId: string;
  userId: string;
  slot: TimeSlot;
  seatIds: number[];
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const room = rooms.find((r) => r.id === input.roomId);
  if (!room) throw new Error('Room not found.');

  // Authoritative checks — the source of truth, independent of any client-side check.
  if (withAvailability(room).status === 'occupied') {
    throw new BookingConflictError('This room is occupied.');
  }
  const mine = bookings.filter((b) => b.userId === input.userId && b.status === 'confirmed');
  if (
    overlapCheck(
      mine.map((b) => b.slot),
      input.slot,
    )
  ) {
    throw new BookingConflictError('You already have a booking at this time.');
  }
  const { seatIds } = input;
  const valid =
    seatIds.length > 0 &&
    new Set(seatIds).size === seatIds.length &&
    seatIds.every((id) => Number.isInteger(id) && id >= 0 && id < room.capacity);
  if (!valid) throw new BookingConflictError('Invalid seat selection.');
  const taken = takenSeatIds(confirmedFor(room.id), input.slot);
  if (seatIds.some((id) => taken.has(id))) {
    throw new BookingConflictError('One of those seats is already booked for this time.');
  }

  const booking: Booking = {
    id: `booking-${nextBookingId++}`,
    roomId: input.roomId,
    userId: input.userId,
    slot: input.slot,
    seatIds: input.seatIds,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };
  bookings = [...bookings, booking];
  return delay(booking);
}

export async function cancelBooking(bookingId: string): Promise<void> {
  bookings = bookings.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  await delay(undefined);
}

// Test-only reset hook so unit tests don't leak state between cases.
export function __resetMockDb(): void {
  rooms = SEED_ROOMS.map((room) => ({ ...room }));
  bookings = [];
  nextBookingId = 1;
}
