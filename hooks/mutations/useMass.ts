import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MassService } from '@/lib/supabase/services/mass';
import { QUERY_KEYS } from '@/constants/query-keys';
import { DatabaseMassBooking } from '@/lib/supabase/entities/types';

const massService = new MassService();

export function useCreateMassBookingMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (booking: Omit<DatabaseMassBooking, 'id' | 'createdAt'>) => {
      const res = await massService.createMassBooking(booking);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.massBookings(userId) });
    },
  });
}

export function useDeleteMassBookingMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const res = await massService.deleteMassBooking(bookingId);
      if (res.error) throw res.error;
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.massBookings(userId) });
    },
  });
}
