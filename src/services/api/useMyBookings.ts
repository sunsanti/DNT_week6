import { useQuery } from '@tanstack/react-query';
import { listMyBookings } from './mock/db';

export function useMyBookings(userId: string) {
  return useQuery({
    queryKey: ['myBookings', userId],
    queryFn: () => listMyBookings(userId),
  });
}
