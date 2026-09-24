export type RoomType = 'study_room' | 'lab';
export type RoomStatus = 'available' | 'occupied';

export interface Room {
  id: string;
  name: string;
  building: string;
  location: string;
  capacity: number;
  floor: number;
  amenities: string[];
  photoUrl: string | null;
  status: RoomStatus;
  type: RoomType;
  /** Derived: capacity minus seats held by confirmed bookings. */
  seatsLeft: number;
}

export type BaseRoom = Omit<Room, 'seatsLeft'>;
