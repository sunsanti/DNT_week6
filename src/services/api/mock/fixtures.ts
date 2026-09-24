import type { BaseRoom } from '@/types';

const BASE_ROOMS: BaseRoom[] = [
  {
    id: 'room-1',
    floor: 1,
    amenities: ['Projector', 'Wi-Fi', 'Air conditioning'],
    name: 'Lab A3-101',
    building: 'Building A3',
    location: 'Building A3',
    capacity: 30,
    photoUrl: null,
    status: 'available',
    type: 'lab',
  },
  {
    id: 'room-2',
    floor: 2,
    amenities: ['Whiteboard', 'Wi-Fi', 'Quiet zone'],
    name: 'Library Zone B',
    building: 'Main Library',
    location: 'Main Library',
    capacity: 50,
    photoUrl: null,
    status: 'occupied',
    type: 'study_room',
  },
  {
    id: 'room-3',
    floor: 1,
    amenities: ['Projector', 'Wi-Fi', 'Air conditioning'],
    name: 'Lab A3-102',
    building: 'Building A3',
    location: 'Building A3',
    capacity: 25,
    photoUrl: null,
    status: 'available',
    type: 'lab',
  },
  {
    id: 'room-4',
    floor: 3,
    amenities: ['Whiteboard', 'Wi-Fi', 'Power outlets'],
    name: 'Library Zone C',
    building: 'Main Library',
    location: 'Main Library',
    capacity: 12,
    photoUrl: null,
    status: 'available',
    type: 'study_room',
  },
  {
    id: 'room-5',
    floor: 2,
    amenities: ['Projector', 'Wi-Fi', 'Air conditioning'],
    name: 'Lab B1-201',
    building: 'Building B1',
    location: 'Building B1',
    capacity: 40,
    photoUrl: null,
    status: 'occupied',
    type: 'lab',
  },
  {
    id: 'room-6',
    floor: 4,
    amenities: ['Whiteboard', 'Wi-Fi', 'TV screen'],
    name: 'Study Room D4',
    building: 'Building D4',
    location: 'Building D4',
    capacity: 8,
    photoUrl: null,
    status: 'available',
    type: 'study_room',
  },
];

function expandForPerfTesting(base: BaseRoom[], targetCount: number): BaseRoom[] {
  const rooms: BaseRoom[] = [...base];
  let i = 0;
  while (rooms.length < targetCount) {
    const source = base[i % base.length];
    const copyIndex = Math.floor(i / base.length) + 2;
    rooms.push({
      ...source,
      id: `${source.id}-copy-${copyIndex}`,
      name: `${source.name} (${copyIndex})`,
      status: i % 3 === 0 ? 'occupied' : 'available',
    });
    i += 1;
  }
  return rooms;
}

// 60+ rooms so the Browse Rooms feed has enough cards to verify 60fps scrolling.
export const SEED_ROOMS: BaseRoom[] = expandForPerfTesting(BASE_ROOMS, 60);

export const SEED_BUILDINGS: string[] = Array.from(new Set(BASE_ROOMS.map((r) => r.building)));
