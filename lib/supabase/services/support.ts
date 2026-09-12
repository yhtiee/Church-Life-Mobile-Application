import { supaBaseClient } from '../client';
import { notifyOnSuccess } from './notification';
import type {
  DatabaseBankAccount,
  DatabaseCelebration,
  DatabaseDonation,
  PaymentKind,
} from '../entities/types';

/**
 * Parish support: published bank accounts, celebration posts, and the
 * payments members report against them.
 *
 * Nothing is charged here. A member transfers money at their bank and then
 * records it in the app, and a parish admin verifies it against the account.
 */
export class SupportService {
  // ── Bank accounts ───────────────────────────────────────────

  async fetchBankAccounts(parishId: string, activeOnly = true) {
    try {
      let query = supaBaseClient
        .from('parish_bank_accounts')
        .select('*')
        .eq('parish_id', parishId);

      if (activeOnly) query = query.eq('is_active', true);

      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data as DatabaseBankAccount[], error: null };
    } catch (error: any) {
      console.error(`Error fetching bank accounts (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  async saveBankAccount(
    account: Partial<DatabaseBankAccount> & Pick<DatabaseBankAccount, 'parish_id'>
  ) {
    try {
      const query = account.id
        ? supaBaseClient.from('parish_bank_accounts').update(account).eq('id', account.id)
        : supaBaseClient.from('parish_bank_accounts').insert([account]);

      const { data, error } = await query.select().single();

      if (error) throw error;
      return { data: data as DatabaseBankAccount, error: null };
    } catch (error: any) {
      console.error('Error saving bank account:', error.message || error);
      return { data: null, error };
    }
  }

  async deleteBankAccount(id: string) {
    try {
      const { error } = await supaBaseClient
        .from('parish_bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: { id }, error: null };
    } catch (error: any) {
      console.error(`Error deleting bank account (${id}):`, error.message || error);
      return { data: null, error };
    }
  }

  // ── Celebrations ────────────────────────────────────────────

  /** Celebrations currently running, for the home carousel. */
  async fetchActiveCelebrations(parishId: string) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supaBaseClient
        .from('celebrations')
        .select('*')
        .eq('parish_id', parishId)
        .eq('is_active', true)
        .lte('starts_on', today)
        .or(`ends_on.is.null,ends_on.gte.${today}`)
        .order('starts_on', { ascending: false });

      if (error) throw error;
      return { data: data as DatabaseCelebration[], error: null };
    } catch (error: any) {
      console.error(`Error fetching celebrations (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /** Every celebration for the parish, including finished ones, for admins. */
  async fetchAllCelebrations(parishId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('celebrations')
        .select('*')
        .eq('parish_id', parishId)
        .order('starts_on', { ascending: false });

      if (error) throw error;
      return { data: data as DatabaseCelebration[], error: null };
    } catch (error: any) {
      console.error(`Error fetching all celebrations (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  async fetchCelebrationById(id: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('celebrations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as DatabaseCelebration, error: null };
    } catch (error: any) {
      console.error(`Error fetching celebration (${id}):`, error.message || error);
      return { data: null, error };
    }
  }

  async saveCelebration(
    celebration: Partial<DatabaseCelebration> & Pick<DatabaseCelebration, 'parish_id'>
  ) {
    try {
      const query = celebration.id
        ? supaBaseClient.from('celebrations').update(celebration).eq('id', celebration.id)
        : supaBaseClient.from('celebrations').insert([celebration]);

      const { data, error } = await query.select().single();

      if (error) throw error;
      return { data: data as DatabaseCelebration, error: null };
    } catch (error: any) {
      console.error('Error saving celebration:', error.message || error);
      return { data: null, error };
    }
  }

  async deleteCelebration(id: string) {
    try {
      const { error } = await supaBaseClient.from('celebrations').delete().eq('id', id);
      if (error) throw error;
      return { data: { id }, error: null };
    } catch (error: any) {
      console.error(`Error deleting celebration (${id}):`, error.message || error);
      return { data: null, error };
    }
  }

  // ── Reported payments ───────────────────────────────────────

  /**
   * Records a transfer the member says they have made. Always lands as
   * 'pending': it is a claim until a parish admin confirms it against the
   * account.
   */
  async reportPaymentRaw(
    userId: string,
    payment: {
      kind: PaymentKind;
      amount: number;
      category: string;
      description: string;
      currency?: string;
      bankAccountId?: string | null;
      celebrationId?: string | null;
      beneficiaryId?: string | null;
      prayerNote?: string | null;
    }
  ) {
    try {
      const { data: profile } = await supaBaseClient
        .from('profiles')
        .select('parishId')
        .eq('id', userId)
        .single();

      const { data, error } = await supaBaseClient
        .from('donations')
        .insert([
          {
            user_id: userId,
            parish_id: profile?.parishId ?? null,
            kind: payment.kind,
            amount: payment.amount,
            currency: payment.currency ?? '₦',
            category: payment.category,
            description: payment.description,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            bank_account_id: payment.bankAccountId ?? null,
            celebration_id: payment.celebrationId ?? null,
            beneficiary_id: payment.beneficiaryId ?? null,
            prayer_note: payment.prayerNote ?? null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data: data as DatabaseDonation, error: null };
    } catch (error: any) {
      console.error('Error reporting payment:', error.message || error);
      return { data: null, error };
    }
  }

  reportPayment = notifyOnSuccess(this.reportPaymentRaw.bind(this), (_result, _userId, payment) => ({
    title: 'Payment Recorded',
    body: `Your ${payment.currency ?? '₦'}${payment.amount.toLocaleString()} payment is awaiting verification by your parish admin.`,
    type: 'giving' as const,
  }));

  /** Everything awaiting verification for a parish, newest first. */
  async fetchPendingPayments(parishId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .select('*, payer:user_id(fullName), beneficiary:beneficiary_id(fullName)')
        .eq('parish_id', parishId)
        .eq('status', 'pending')
        .order('date', { ascending: false });

      if (error) throw error;
      return { data: data as DatabaseDonation[], error: null };
    } catch (error: any) {
      console.error(`Error fetching pending payments (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /** Support already recorded against one celebration. */
  async fetchCelebrationSupport(celebrationId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .select('*, payer:user_id(fullName)')
        .eq('celebration_id', celebrationId)
        .order('date', { ascending: false });

      if (error) throw error;
      return { data: data as DatabaseDonation[], error: null };
    } catch (error: any) {
      console.error(`Error fetching celebration support (${celebrationId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Marks a reported payment verified or rejected.
   *
   * Goes through `verify_payment` rather than a direct update: the function
   * records the decision without letting the amount a member reported be
   * rewritten after the fact.
   */
  async verifyPaymentRaw(
    donationId: string,
    approve: boolean,
    note?: string,
    confirmedAmount?: number
  ) {
    try {
      const { data, error } = await supaBaseClient.rpc('verify_payment', {
        donation_id: donationId,
        approve,
        note: note ?? null,
        confirmed_amount: confirmedAmount ?? null,
      });

      if (error) throw error;
      return { data: data as DatabaseDonation, error: null };
    } catch (error: any) {
      console.error(`Error verifying payment (${donationId}):`, error.message || error);
      return { data: null, error };
    }
  }

  verifyPayment = notifyOnSuccess(this.verifyPaymentRaw.bind(this), (result) => ({
    title: result.data?.status === 'fulfilled' ? 'Payment Verified' : 'Payment Rejected',
    body:
      result.data?.status === 'fulfilled'
        ? 'The payment has been confirmed and recorded.'
        : 'The payment could not be confirmed.',
    type: 'giving' as const,
  }));
}
