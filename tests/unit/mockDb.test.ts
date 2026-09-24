import {
  BookingConflictError,
  __resetMockDb,
  cancelBooking,
  createBooking,
  getRoom,
  listBookingsForRoom,
  listRooms,
} from '@/services/api/mock/db';
import { EMPTY_FILTERS } from '@/types';

const slot9 = { start: '2026-01-01T09:00:00Z', end: '2026-01-01T10:00:00Z' };
const slot930 = { start: '2026-01-01T09:30:00Z', end: '2026-01-01T10:30:00Z' };
const slot10 = { start: '2026-01-01T10:00:00Z', end: '2026-01-01T11:00:00Z' };
const book = (roomId: string, seatIds: number[], slot = slot9, userId = 'student-1') =>
  createBooking({ roomId, userId, slot, seatIds });
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

// room-1: 30 seats, available. room-2: seeded occupied.
beforeEach(() => {
  __resetMockDb();
});

describe('mock booking API — seat positions', () => {
  it('stores the exact seats booked', async () => {
    const b = await book('room-1', [4, 5]);
    expect(b.seatIds).toEqual([4, 5]);
    expect((await listBookingsForRoom('room-1'))[0].seatIds).toEqual([4, 5]);
  });

  it('deducts booked seats from the room total', async () => {
    await book('room-1', [0, 1, 2, 3, 4]);
    expect((await getRoom('room-1'))?.seatsLeft).toBe(25);
  });

  it('restores seats when a booking is cancelled', async () => {
    const b = await book('room-1', [0, 1, 2, 3, 4]);
    await cancelBooking(b.id);
    expect((await getRoom('room-1'))?.seatsLeft).toBe(30);
  });

  it('allows different seats in an overlapping slot', async () => {
    await book('room-1', [0, 1]);
    const second = await book('room-1', [2, 3], slot930, 'student-2');
    expect(second.status).toBe('confirmed');
  });

  it('rejects a seat already held in an overlapping slot', async () => {
    await book('room-1', [0, 1]);
    await expect(book('room-1', [1, 2], slot930, 'student-2')).rejects.toBeInstanceOf(
      BookingConflictError,
    );
  });

  it('allows the same seat in a non-overlapping slot', async () => {
    await book('room-1', [0]);
    const next = await book('room-1', [0], slot10, 'student-2');
    expect(next.status).toBe('confirmed');
  });

  it('rejects an empty, duplicated, or out-of-range seat selection', async () => {
    await expect(book('room-1', [])).rejects.toBeInstanceOf(BookingConflictError);
    await expect(book('room-1', [3, 3])).rejects.toBeInstanceOf(BookingConflictError);
    await expect(book('room-1', [30])).rejects.toBeInstanceOf(BookingConflictError);
    await expect(book('room-1', [-1])).rejects.toBeInstanceOf(BookingConflictError);
  });

  it('turns the room occupied once every seat is taken, and blocks further bookings', async () => {
    await book('room-1', range(30));
    expect((await getRoom('room-1'))?.status).toBe('occupied');
    await expect(book('room-1', [0], slot10, 'student-2')).rejects.toBeInstanceOf(
      BookingConflictError,
    );
  });

  it('rejects any booking on a room that is seeded as occupied', async () => {
    await expect(book('room-2', [0])).rejects.toBeInstanceOf(BookingConflictError);
  });

  it('keeps other rooms independent', async () => {
    await book('room-1', range(30));
    expect((await getRoom('room-3'))?.seatsLeft).toBe(25);
  });

  it('rejects one user booking two overlapping slots, even in different rooms', async () => {
    await book('room-1', [0]);
    await expect(book('room-3', [0], slot930)).rejects.toBeInstanceOf(BookingConflictError);
  });

  it('allows the same user to book back-to-back slots', async () => {
    await book('room-1', [0]);
    expect((await book('room-1', [0], slot10)).status).toBe('confirmed');
  });

  it('seeds a non-empty room list', async () => {
    expect((await listRooms(EMPTY_FILTERS)).length).toBeGreaterThan(0);
  });
});
