import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelBooking } from './mock/db';

export function useCancelBooking(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myBookings', userId] });
      queryClient.invalidateQueries({ queryKey: ['roomBookings'] });
    },
  });
}
