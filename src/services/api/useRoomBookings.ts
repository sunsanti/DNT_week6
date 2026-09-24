import { useQuery } from '@tanstack/react-query';
import { listBookingsForRoom } from './mock/db';

export function useRoomBookings(roomId: string) {
  return useQuery({
    queryKey: ['roomBookings', roomId],
    queryFn: () => listBookingsForRoom(roomId),
  });
}
