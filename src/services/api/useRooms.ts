import { useQuery } from '@tanstack/react-query';
import type { FilterState } from '@/types';
import { listRooms } from './mock/db';

export function useRooms(filters: FilterState) {
  return useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => listRooms(filters),
  });
}
