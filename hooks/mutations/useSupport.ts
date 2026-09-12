import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportService } from '@/lib/supabase/services/support';
import { QUERY_KEYS } from '@/constants/query-keys';
import type {
  DatabaseBankAccount,
  DatabaseCelebration,
  PaymentKind,
} from '@/lib/supabase/entities/types';

const supportService = new SupportService();

/** Create, update and remove a parish's published bank accounts. */
export function useBankAccountMutations(parishId?: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['bankAccounts', parishId ?? ''] });

  const save = useMutation({
    mutationFn: async (
      account: Partial<DatabaseBankAccount> & Pick<DatabaseBankAccount, 'parish_id'>
    ) => {
      const res = await supportService.saveBankAccount(account);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await supportService.deleteBankAccount(id);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}

/** Create, update and remove celebration posts. */
export function useCelebrationMutations(parishId?: string) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['celebrations', parishId ?? ''] });

  const save = useMutation({
    mutationFn: async (
      celebration: Partial<DatabaseCelebration> & Pick<DatabaseCelebration, 'parish_id'>
    ) => {
      const res = await supportService.saveCelebration(celebration);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await supportService.deleteCelebration(id);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  return { save, remove };
}

interface ReportPaymentInput {
  kind: PaymentKind;
  amount: number;
  category: string;
  description: string;
  bankAccountId?: string | null;
  celebrationId?: string | null;
  beneficiaryId?: string | null;
  prayerNote?: string | null;
  isAnonymous?: boolean;
}

/**
 * Records a transfer the member says they have made. It lands as pending
 * until a parish admin confirms it against the account.
 */
export function useReportPaymentMutation(userId?: string, parishId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: ReportPaymentInput) => {
      if (!userId) throw new Error('You need to be signed in to record a payment.');
      const res = await supportService.reportPayment(userId, payment);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.donations(userId ?? '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingPayments(parishId ?? '') });
      if (variables.celebrationId) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.celebrationSupport(variables.celebrationId),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.celebrationWishes(variables.celebrationId),
        });
      }
    },
  });
}

/** Marks a reported payment verified or rejected. Parish admins only. */
export function useVerifyPaymentMutation(parishId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      donationId,
      approve,
      note,
      confirmedAmount,
    }: {
      donationId: string;
      approve: boolean;
      note?: string;
      confirmedAmount?: number;
    }) => {
      const res = await supportService.verifyPayment(donationId, approve, note, confirmedAmount);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingPayments(parishId ?? '') });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingDonations() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allDonations() });
    },
  });
}
