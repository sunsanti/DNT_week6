import { applyFilters } from '@/utils/applyFilters';
import { EMPTY_FILTERS } from '@/types';
import type { Room } from '@/types';

const rooms: Room[] = [
  {
    id: '1',
    name: 'Lab A3-101',
    building: 'Building A3',
    location: 'Building A3',
    capacity: 30,
    seatsLeft: 30,
    floor: 1,
    amenities: [],
    photoUrl: null,
    status: 'available',
    type: 'lab',
  },
  {
    id: '2',
    name: 'Library Zone B',
    building: 'Main Library',
    location: 'Main Library',
    capacity: 50,
    seatsLeft: 50,
    floor: 1,
    amenities: [],
    photoUrl: null,
    status: 'occupied',
    type: 'study_room',
  },
  {
    id: '3',
    name: 'Study Room D4',
    building: 'Building D4',
    location: 'Building D4',
    capacity: 8,
    seatsLeft: 8,
    floor: 1,
    amenities: [],
    photoUrl: null,
    status: 'available',
    type: 'study_room',
  },
];

describe('applyFilters', () => {
  it('returns all rooms when no filters are set', () => {
    expect(applyFilters(rooms, EMPTY_FILTERS)).toHaveLength(3);
  });

  it('filters by search query (case-insensitive, matches name)', () => {
    const result = applyFilters(rooms, { ...EMPTY_FILTERS, query: 'lab' });
    expect(result.map((r) => r.id)).toEqual(['1']);
  });

  it('filters by one or more buildings', () => {
    const result = applyFilters(rooms, {
      ...EMPTY_FILTERS,
      buildings: ['Building A3', 'Building D4'],
    });
    expect(result.map((r) => r.id).sort()).toEqual(['1', '3']);
  });

  it('filters by minimum capacity', () => {
    const result = applyFilters(rooms, { ...EMPTY_FILTERS, minCapacity: 20 });
    expect(result.map((r) => r.id).sort()).toEqual(['1', '2']);
  });

  it('filters by status', () => {
    const result = applyFilters(rooms, { ...EMPTY_FILTERS, status: 'occupied' });
    expect(result.map((r) => r.id)).toEqual(['2']);
  });

  it('filters by room type', () => {
    const result = applyFilters(rooms, { ...EMPTY_FILTERS, type: 'study_room' });
    expect(result.map((r) => r.id).sort()).toEqual(['2', '3']);
  });

  it('combines multiple filters with AND semantics', () => {
    const result = applyFilters(rooms, {
      ...EMPTY_FILTERS,
      status: 'available',
      type: 'study_room',
    });
    expect(result.map((r) => r.id)).toEqual(['3']);
  });
});
