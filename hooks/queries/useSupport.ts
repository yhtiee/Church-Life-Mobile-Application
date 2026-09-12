import { useQuery } from '@tanstack/react-query';
import { SupportService } from '@/lib/supabase/services/support';
import { QUERY_KEYS } from '@/constants/query-keys';

const supportService = new SupportService();

/** Bank accounts a parish has published for transfers. */
export function useBankAccountsQuery(parishId?: string, activeOnly = true) {
  return useQuery({
    queryKey: QUERY_KEYS.bankAccounts(parishId ?? '', activeOnly),
    queryFn: async () => {
      if (!parishId) return [];
      const res = await supportService.fetchBankAccounts(parishId, activeOnly);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}

/** Celebrations currently running, for the home carousel. */
export function useActiveCelebrationsQuery(parishId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.celebrations(parishId ?? '', 'active'),
    queryFn: async () => {
      if (!parishId) return [];
      const res = await supportService.fetchActiveCelebrations(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}

/** Every celebration, including finished ones, for the admin list. */
export function useAllCelebrationsQuery(parishId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.celebrations(parishId ?? '', 'all'),
    queryFn: async () => {
      if (!parishId) return [];
      const res = await supportService.fetchAllCelebrations(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}

export function useCelebrationQuery(id?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.celebration(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const res = await supportService.fetchCelebrationById(id);
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!id,
  });
}

/** Every payment awaiting verification for a parish, whatever its kind. */
export function usePendingPaymentsQuery(parishId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.pendingPayments(parishId ?? ''),
    queryFn: async () => {
      if (!parishId) return [];
      const res = await supportService.fetchPendingPayments(parishId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}

/** Support already recorded against one celebration. */
export function useCelebrationSupportQuery(celebrationId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.celebrationSupport(celebrationId ?? ''),
    queryFn: async () => {
      if (!celebrationId) return [];
      const res = await supportService.fetchCelebrationSupport(celebrationId);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!celebrationId,
  });
}
