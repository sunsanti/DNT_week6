import type { RoomStatus, RoomType } from './room';

export interface FilterState {
  query: string;
  buildings: string[];
  minCapacity?: number;
  status?: RoomStatus;
  type?: RoomType;
}

export const EMPTY_FILTERS: FilterState = {
  query: '',
  buildings: [],
};
