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

// ============ ADMIN APPROVAL WORKFLOW HOOKS ============

/**
 * Fetches all pending donations (admin view).
 */
export function usePendingDonationsQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.pendingDonations(),
    queryFn: async () => {
      const res = await financeService.getPendingDonations();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

/**
 * Fetches all pending pledges (admin view).
 */
export function usePendingPledgesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.pendingPledges(),
    queryFn: async () => {
      const res = await financeService.getPendingPledges();
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

/**
 * Mutation to approve a donation.
 */
export function useApproveDonationMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ donationId, approvedBy }: { donationId: string; approvedBy: string }) => {
      const res = await financeService.approveDonation(donationId, approvedBy);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingDonations() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allDonations() });
    },
  });
}

/**
 * Mutation to reject a donation.
 */
export function useRejectDonationMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ donationId, reason, rejectedBy }: { donationId: string; reason: string; rejectedBy: string }) => {
      const res = await financeService.rejectDonation(donationId, reason, rejectedBy);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingDonations() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allDonations() });
    },
  });
}

/**
 * Mutation to fulfill (record actual amount) a donation.
 */
export function useFulfillDonationMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ donationId, fulfilledAmount, approvedBy, adminNotes }: { donationId: string; fulfilledAmount: number; approvedBy: string; adminNotes?: string }) => {
      const res = await financeService.fulfillDonation(donationId, fulfilledAmount, approvedBy, adminNotes);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingDonations() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allDonations() });
    },
  });
}

/**
 * Mutation to approve a pledge.
 */
export function useApprovePledgeMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ pledgeId, approvedBy }: { pledgeId: string; approvedBy: string }) => {
      const res = await financeService.approvePledge(pledgeId, approvedBy);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingPledges() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allPledges() });
    },
  });
}

/**
 * Mutation to reject a pledge.
 */
export function useRejectPledgeMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ pledgeId, reason, rejectedBy }: { pledgeId: string; reason: string; rejectedBy: string }) => {
      const res = await financeService.rejectPledge(pledgeId, reason, rejectedBy);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingPledges() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allPledges() });
    },
  });
}

/**
 * Mutation to fulfill (record actual amount) a pledge.
 */
export function useFulfillPledgeMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ pledgeId, fulfilledAmount, approvedBy, adminNotes }: { pledgeId: string; fulfilledAmount: number; approvedBy: string; adminNotes?: string }) => {
      const res = await financeService.fulfillPledge(pledgeId, fulfilledAmount, approvedBy, adminNotes);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingPledges() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allPledges() });
    },
  });
}
