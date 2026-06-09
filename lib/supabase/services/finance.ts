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
   */
  async createDonationRaw(userId: string, donation: Omit<Donation, 'id' | 'date'>) {
    try {
      const { data, error } = await supaBaseClient
        .from('donations')
        .insert([
          {
            ...donation,
            user_id: userId,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
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
      title: 'Donation Confirmed',
      body: `Your donation of ₦${donation.amount.toLocaleString()} for ${donation.category} has been received.`,
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
   */
  async createPledgeRaw(userId: string, pledge: Omit<Pledge, 'id' | 'isPaid' | 'paidDate' | 'paidAmount'>) {
    try {
      const { data, error } = await supaBaseClient
        .from('pledges')
        .insert([
          {
            ...pledge,
            user_id: userId,
            isPaid: false,
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
      title: 'Pledge Created',
      body: `You have successfully created a pledge of ₦${pledge.targetAmount.toLocaleString()} for "${pledge.title}".`,
      type: 'giving',
    })
  );
  
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
}

