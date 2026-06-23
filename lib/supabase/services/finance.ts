import { supaBaseClient } from '../client';
import { Donation, Pledge } from '@/constants/mockData';
import { notifyOnSuccess } from './notification';

export class FinanaceService {

  /**
   * Fetches donations made by a user.
   */
  async fetchDonations(userId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
  
      if (error) throw error;
      return { data: data as Donation[], error: null };
    } catch (error: any) {
      console.error(`Error fetching donations for user (${userId}):`, error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Records a new donation made by a user (raw implementation).
   * Creates with pending status for admin approval workflow.
   */
  async createDonationRaw(userId: string, donation: Omit<Donation, 'id' | 'date' | 'status' | 'fulfilled_amount' | 'approved_at' | 'approved_by' | 'admin_notes'>) {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .insert([
          {
            ...donation,
            user_id: userId,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            status: 'pending', // Default to pending for admin approval
          },
        ])
        .select()
        .single();
  
      if (error) throw error;
      return { data: data as Donation, error: null };
    } catch (error: any) {
      console.error('Error creating donation:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Records a new donation made by a user (wrapped with notification).
   */
  createDonation = notifyOnSuccess(
    this.createDonationRaw.bind(this),
    (result, userId, donation) => ({
      title: 'Donation Submitted',
      body: `Your donation of ₦${donation.amount.toLocaleString()} for ${donation.category} has been submitted and is pending admin review.`,
      type: 'giving',
    })
  );
  
  /**
   * Fetches pledges created by a user.
   */
  async fetchPledges(userId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('pledges')
        .select('*')
        .eq('user_id', userId)
        .order('dueDate', { ascending: true });
  
      if (error) throw error;

      return { data: data as Pledge[], error: null };
    } catch (error: any) {
      console.error(`Error fetching pledges for user (${userId}):`, error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Creates a new pledge for a user (raw implementation).
   * Creates with pending status for admin approval workflow.
   */
  async createPledgeRaw(userId: string, pledge: Omit<Pledge, 'id' | 'isPaid' | 'paidDate' | 'paidAmount' | 'status' | 'fulfilled_amount' | 'approved_at' | 'approved_by' | 'admin_notes'>) {
    try {
      const { data, error } = await supaBaseClient
        .from('pledges')
        .insert([
          {
            ...pledge,
            user_id: userId,
            isPaid: false,
            status: 'pending', // Default to pending for admin approval
          },
        ])
        .select()
        .single();
  
      if (error) throw error;
      return { data: data as Pledge, error: null };
    } catch (error: any) {
      console.error('Error creating pledge:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Creates a new pledge for a user (wrapped with notification).
   */
  createPledge = notifyOnSuccess(
    this.createPledgeRaw.bind(this),
    (result, userId, pledge) => ({
      title: 'Pledge Submitted',
      body: `Your pledge of ₦${pledge.targetAmount.toLocaleString()} for "${pledge.title}" has been submitted and is pending admin review.`,
      type: 'giving',
    })
  );
  
  /**
   * Fetches all donations across the parish (admin view), with the donor's name attached.
   */
  async fetchAllDonations() {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .select('*, profiles:user_id(fullName)')
        .order('date', { ascending: false });

      if (error) throw error;
      return { data: data as (Donation & { user_id: string; profiles: { fullName: string } | null })[], error: null };
    } catch (error: any) {
      console.error('Error fetching all donations:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Fetches all donations filtered by parish (admin view for specific parish).
   */
  async fetchDonationsByParish(parishId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .select('*, profiles:user_id(id, fullName, parishId)')
        .eq('profiles.parishId', parishId)
        .order('date', { ascending: false });

      if (error) throw error;
      return { data: data as (Donation & { user_id: string; profiles: { fullName: string } | null })[], error: null };
    } catch (error: any) {
      console.error(`Error fetching donations for parish (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Fetches all pledges across the parish (admin view), with the pledger's name attached.
   */
  async fetchAllPledges() {
    try {
      const { data, error } = await supaBaseClient
        .from('pledges')
        .select('*, profiles:user_id(fullName)')
        .order('dueDate', { ascending: true });

      if (error) throw error;
      return { data: data as (Pledge & { user_id: string; profiles: { fullName: string } | null })[], error: null };
    } catch (error: any) {
      console.error('Error fetching all pledges:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Fetches all pledges filtered by parish (admin view for specific parish).
   */
  async fetchPledgesByParish(parishId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('pledges')
        .select('*, profiles:user_id(id, fullName, parishId)')
        .eq('profiles.parishId', parishId)
        .order('dueDate', { ascending: true });

      if (error) throw error;
      return { data: data as (Pledge & { user_id: string; profiles: { fullName: string } | null })[], error: null };
    } catch (error: any) {
      console.error(`Error fetching pledges for parish (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Updates a pledge (e.g. paying towards it, updating status).
   */
  async updatePledgeStatus(pledgeId: string, updates: Partial<Pledge>) {
    try {
      const { data, error } = await supaBaseClient
        .from('pledges')
        .update(updates)
        .eq('id', pledgeId)
        .select()
        .single();
  
      if (error) throw error;
      return { data: data as Pledge, error: null };
    } catch (error: any) {
      console.error(`Error updating pledge (${pledgeId}):`, error.message || error);
      return { data: null, error };
    }
  }

  // ============ ADMIN APPROVAL WORKFLOW METHODS ============

  /**
   * Fetches all pending donations across the parish (admin view).
   */
  async getPendingDonations() {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .select('*, profiles:user_id(id, fullName, email)')
        .eq('status', 'pending')
        .order('date', { ascending: false });

      if (error) throw error;
      return { data: data as (Donation & { profiles: { id: string; fullName: string; email: string } | null })[], error: null };
    } catch (error: any) {
      console.error('Error fetching pending donations:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Fetches all pending pledges across the parish (admin view).
   */
  async getPendingPledges() {
    try {
      const { data, error } = await supaBaseClient
        .from('pledges')
        .select('*, profiles:user_id(id, fullName, email)')
        .eq('status', 'pending')
        .order('dueDate', { ascending: true });

      if (error) throw error;
      return { data: data as (Pledge & { profiles: { id: string; fullName: string; email: string } | null })[], error: null };
    } catch (error: any) {
      console.error('Error fetching pending pledges:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Admin approves a donation (changes status to approved).
   */
  async approveDonation(donationId: string, approvedBy: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
        })
        .eq('id', donationId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Donation, error: null };
    } catch (error: any) {
      console.error(`Error approving donation (${donationId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Admin rejects a donation with a reason.
   */
  async rejectDonation(donationId: string, reason: string, rejectedBy: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .update({
          status: 'rejected',
          admin_notes: reason,
          approved_by: rejectedBy,
          approved_at: new Date().toISOString(),
        })
        .eq('id', donationId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Donation, error: null };
    } catch (error: any) {
      console.error(`Error rejecting donation (${donationId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Admin fulfills (records actual amount) a donation.
   */
  async fulfillDonation(donationId: string, fulfilledAmount: number, approvedBy: string, adminNotes?: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .update({
          status: 'fulfilled',
          fulfilled_amount: fulfilledAmount,
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          admin_notes: adminNotes,
        })
        .eq('id', donationId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Donation, error: null };
    } catch (error: any) {
      console.error(`Error fulfilling donation (${donationId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Admin approves a pledge (changes status to approved).
   */
  async approvePledge(pledgeId: string, approvedBy: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('pledges')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
        })
        .eq('id', pledgeId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Pledge, error: null };
    } catch (error: any) {
      console.error(`Error approving pledge (${pledgeId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Admin rejects a pledge with a reason.
   */
  async rejectPledge(pledgeId: string, reason: string, rejectedBy: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('pledges')
        .update({
          status: 'rejected',
          admin_notes: reason,
          approved_by: rejectedBy,
          approved_at: new Date().toISOString(),
        })
        .eq('id', pledgeId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Pledge, error: null };
    } catch (error: any) {
      console.error(`Error rejecting pledge (${pledgeId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Admin fulfills (records actual amount) a pledge.
   */
  async fulfillPledge(pledgeId: string, fulfilledAmount: number, approvedBy: string, adminNotes?: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('pledges')
        .update({
          status: 'fulfilled',
          fulfilled_amount: fulfilledAmount,
          approved_at: new Date().toISOString(),
          approved_by: approvedBy,
          admin_notes: adminNotes,
        })
        .eq('id', pledgeId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Pledge, error: null };
    } catch (error: any) {
      console.error(`Error fulfilling pledge (${pledgeId}):`, error.message || error);
      return { data: null, error };
    }
  }
}

