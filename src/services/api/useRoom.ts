import { useQuery } from '@tanstack/react-query';
import { getRoom } from './mock/db';

export function useRoom(roomId: string) {
  return useQuery({
    queryKey: ['room', roomId],
    queryFn: () => getRoom(roomId),
  });
}
