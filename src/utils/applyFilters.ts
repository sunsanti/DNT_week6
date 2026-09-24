import type { FilterState, Room } from '@/types';

export function applyFilters(rooms: Room[], filters: FilterState): Room[] {
  const query = filters.query.trim().toLowerCase();

  return rooms.filter((room) => {
    if (query && !room.name.toLowerCase().includes(query)) return false;
    if (filters.buildings.length > 0 && !filters.buildings.includes(room.building)) return false;
    if (filters.minCapacity !== undefined && room.capacity < filters.minCapacity) return false;
    if (filters.status && room.status !== filters.status) return false;
    if (filters.type && room.type !== filters.type) return false;
    return true;
  });
}
