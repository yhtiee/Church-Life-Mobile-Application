import { supaBaseClient } from '../client';
import { Parish } from '@/constants/parishes';
import type { DatabaseParishTransferRequest } from '../entities/types';
import { notifyOnSuccess } from './notification';

export class ParishServices {

  /**
   * Fetches all approved Catholic parishes from the 'parishes' table.
   */
  async fetchParishes() {
    try {
      const { data, error } = await supaBaseClient
        .from('parishes')
        .select('*')
        .order('name', { ascending: true });
  
      if (error) throw error;
      return { data: data as Parish[], error: null };
    } catch (error: any) {
      console.error('Error fetching parishes:', error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Fetches a single parish details by its ID.
   */
  async fetchParishById(parishId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('parishes')
        .select('*')
        .eq('id', parishId)
        .single();
  
      if (error) throw error;
      return { data: data as Parish, error: null };
    } catch (error: any) {
      console.error(`Error fetching parish details (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Updates a parish's details (e.g. history, patron, priest, bishop).
   */
  async updateParishDetails(parishId: string, updates: Partial<Parish>) {
    try {
      const { data, error } = await supaBaseClient
        .from('parishes')
        .update(updates)
        .eq('id', parishId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Parish, error: null };
    } catch (error: any) {
      console.error(`Error updating parish details (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Asks to move to another parish. The admin of the member's CURRENT parish
   * decides, so the request is visible to the parish being left.
   */
  async requestTransferRaw(targetParishId: string, reason?: string) {
    try {
      const { data, error } = await supaBaseClient.rpc('request_parish_transfer', {
        target_parish_id: targetParishId,
        reason: reason ?? null,
      });

      if (error) throw error;
      return { data: data as DatabaseParishTransferRequest, error: null };
    } catch (error: any) {
      console.error('Error requesting parish transfer:', error.message || error);
      return { data: null, error };
    }
  }

  requestTransfer = notifyOnSuccess(
    this.requestTransferRaw.bind(this),
    (_result) => ({
      title: 'Transfer Requested',
      body: 'Your parish transfer request has been sent for approval.',
      type: 'system' as const,
    })
  );

  /**
   * Pending transfers out of a parish, for that parish's admin queue.
   */
  async fetchTransferRequestsByParish(parishId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('parish_transfer_requests')
        .select('*, fromParish:from_parish_id(name), toParish:to_parish_id(name)')
        .eq('from_parish_id', parishId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return { data: data as DatabaseParishTransferRequest[], error: null };
    } catch (error: any) {
      console.error(`Error fetching transfer requests (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /** A member's own transfer requests, newest first. */
  async fetchMyTransferRequests(userId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('parish_transfer_requests')
        .select('*, fromParish:from_parish_id(name), toParish:to_parish_id(name)')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return { data: data as DatabaseParishTransferRequest[], error: null };
    } catch (error: any) {
      console.error(`Error fetching own transfer requests (${userId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Approves or rejects a transfer. Approval moves the member's parish, drops
   * their group memberships and clears any duty title, all in one transaction.
   */
  async decideTransferRaw(requestId: string, approve: boolean, note?: string) {
    try {
      const { data, error } = await supaBaseClient.rpc('decide_parish_transfer', {
        request_id: requestId,
        approve,
        note: note ?? null,
      });

      if (error) throw error;
      return { data: data as DatabaseParishTransferRequest, error: null };
    } catch (error: any) {
      console.error(`Error deciding parish transfer (${requestId}):`, error.message || error);
      return { data: null, error };
    }
  }

  decideTransfer = notifyOnSuccess(
    this.decideTransferRaw.bind(this),
    (result) => ({
      title: result.data?.status === 'approved' ? 'Transfer Approved' : 'Transfer Declined',
      body:
        result.data?.status === 'approved'
          ? `${result.data?.userName ?? 'A member'} has been transferred out of the parish.`
          : `${result.data?.userName ?? 'A member'}'s transfer request was declined.`,
      type: 'system' as const,
    })
  );
}

