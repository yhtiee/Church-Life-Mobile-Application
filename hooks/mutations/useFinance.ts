import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FinanaceService } from '@/lib/supabase/services/finance';
import { QUERY_KEYS } from '@/constants/query-keys';
import { Donation, Pledge } from '@/constants/mockData';

const financeService = new FinanaceService();

export function useCreateDonationMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (donation: Omit<Donation, 'id' | 'date'>) => {
      const res = await financeService.createDonation(userId, donation);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.donations(userId) });
    },
  });
}

export function useCreatePledgeMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pledge: Omit<Pledge, 'id' | 'isPaid' | 'paidDate' | 'paidAmount'>) => {
      const res = await financeService.createPledge(userId, pledge);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pledges(userId) });
    },
  });
}

export function useUpdatePledgeStatusMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ pledgeId, updates }: { pledgeId: string; updates: Partial<Pledge> }) => {
      const res = await financeService.updatePledgeStatus(pledgeId, updates);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pledges(userId) });
    },
  });
}
