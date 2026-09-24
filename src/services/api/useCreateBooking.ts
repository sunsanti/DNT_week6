import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CreateBookingInput } from './mock/db';
import { createBooking } from './mock/db';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => createBooking(input),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['roomBookings', booking.roomId] });
      queryClient.invalidateQueries({ queryKey: ['myBookings', booking.userId] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });
}
