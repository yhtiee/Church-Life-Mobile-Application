import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FinanaceService } from '@/lib/supabase/services/finance';
import { QUERY_KEYS } from '@/constants/query-keys';
import { Donation, Pledge } from '@/constants/mockData';

const financeService = new FinanaceService();

export function useDonationsQuery(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.donations(userId),
    queryFn: async () => {
      const res = await financeService.fetchDonations(userId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!userId,
  });
}

export function usePledgesQuery(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.pledges(userId),
    queryFn: async () => {
      const res = await financeService.fetchPledges(userId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!userId,
  });
}

/**
 * Fetches every donation across the parish (admin view).
 */
export function useAllDonationsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.allDonations(),
    queryFn: async () => {
      const res = await financeService.fetchAllDonations();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

/**
 * Fetches donations filtered by parish (admin view for specific parish).
 */
export function useDonationsByParishQuery(parishId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.allDonations(), parishId],
    queryFn: async () => {
      const res = await financeService.fetchDonationsByParish(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}

/**
 * Fetches every pledge across the parish (admin view).
 */
export function useAllPledgesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.allPledges(),
    queryFn: async () => {
      const res = await financeService.fetchAllPledges();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

/**
 * Fetches pledges filtered by parish (admin view for specific parish).
 */
export function usePledgesByParishQuery(parishId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.allPledges(), parishId],
    queryFn: async () => {
      const res = await financeService.fetchPledgesByParish(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}

/**
 * Mutation to create a donation (admin logging finances).
 */
export function useCreateDonationMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, donation }: { userId: string; donation: Omit<Donation, 'id' | 'date'> }) => {
      const res = await financeService.createDonation(userId, donation);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allDonations() });
    },
  });
}

/**
 * Mutation to create a pledge (admin logging finances).
 */
export function useCreatePledgeMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, pledge }: { userId: string; pledge: Omit<Pledge, 'id' | 'isPaid' | 'paidDate' | 'paidAmount'> }) => {
      const res = await financeService.createPledge(userId, pledge);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allPledges() });
    },
  });
}
