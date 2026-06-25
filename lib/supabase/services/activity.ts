import { supaBaseClient } from '../client';

export interface Activity {
  id: string;
  user_id: string;
  activity_type: 'group_join_request' | 'group_transition_request' | 'donation' | 'booking_request';
  reference_type?: string;
  reference_id?: string;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export class ActivityService {
  /**
   * Log a group join request activity
   */
  async logGroupJoinRequest(
    userId: string,
    groupId: string,
    groupName: string
  ): Promise<{ data?: Activity; error?: any }> {
    try {
      let parishId: string | null = null;
      if (userId) {
        const { data: profile } = await supaBaseClient
          .from('profiles')
          .select('parishId')
          .eq('id', userId)
          .single();
        parishId = profile?.parishId;
      }

      const { data, error } = await supaBaseClient
        .from('activities')
        .insert({
          user_id: userId,
          parish_id: parishId,
          activity_type: 'group_join_request',
          reference_type: 'group',
          reference_id: groupId,
          title: `Requested to join ${groupName}`,
          description: `User requested to join the group: ${groupName}`,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging group join request:', error);
        return { error };
      }

      console.log('Group join request logged:', data);
      return { data };
    } catch (err) {
      console.error('Exception in logGroupJoinRequest:', err);
      return { error: err };
    }
  }

  /**
   * Log a group transition request activity
   */
  async logGroupTransitionRequest(
    userId: string,
    fromGroupId: string,
    toGroupId: string,
    fromGroupName?: string,
    toGroupName?: string
  ): Promise<{ data?: Activity; error?: any }> {
    try {
      let parishId: string | null = null;
      if (userId) {
        const { data: profile } = await supaBaseClient
          .from('profiles')
          .select('parishId')
          .eq('id', userId)
          .single();
        parishId = profile?.parishId;
      }

      const { data, error } = await supaBaseClient
        .from('activities')
        .insert({
          user_id: userId,
          parish_id: parishId,
          activity_type: 'group_transition_request',
          reference_type: 'group',
          reference_id: toGroupId,
          title: `Requested to transition from ${fromGroupName || 'a group'} to ${toGroupName || 'a group'}`,
          description: `User requested to transition from group (${fromGroupId}) to group (${toGroupId})`,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging group transition request:', error);
        return { error };
      }

      console.log('Group transition request logged:', data);
      return { data };
    } catch (err) {
      console.error('Exception in logGroupTransitionRequest:', err);
      return { error: err };
    }
  }

  /**
   * Log a mass booking activity (NEW requirement)
   */
  async logMassBooking(
    userId: string,
    massBookingId: string,
    massDate: string,
    massTime: string,
    intention: string
  ): Promise<{ data?: Activity; error?: any }> {
    try {
      let parishId: string | null = null;
      if (userId) {
        const { data: profile } = await supaBaseClient
          .from('profiles')
          .select('parishId')
          .eq('id', userId)
          .single();
        parishId = profile?.parishId;
      }

      const { data, error } = await supaBaseClient
        .from('activities')
        .insert({
          user_id: userId,
          parish_id: parishId,
          activity_type: 'booking_request',
          reference_type: 'mass',
          reference_id: massBookingId,
          title: `Booked mass on ${massDate} at ${massTime}`,
          description: `Booked mass on ${massDate} at ${massTime} for: ${intention}`,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging mass booking:', error);
        return { error };
      }

      console.log('Mass booking logged:', data);
      return { data };
    } catch (err) {
      console.error('Exception in logMassBooking:', err);
      return { error: err };
    }
  }

  /**
   * Log a donation activity (logged by user or admin)
   */
  async logDonation(
    userId: string,
    donationId: string,
    amount: number,
    category: string
  ): Promise<{ data?: Activity; error?: any }> {
    try {
      let parishId: string | null = null;
      if (userId) {
        const { data: profile } = await supaBaseClient
          .from('profiles')
          .select('parishId')
          .eq('id', userId)
          .single();
        parishId = profile?.parishId;
      }

      const { data, error } = await supaBaseClient
        .from('activities')
        .insert({
          user_id: userId,
          parish_id: parishId,
          activity_type: 'donation',
          reference_type: 'donation',
          reference_id: donationId,
          title: `Donated ₦${amount.toLocaleString()} for ${category}`,
          description: `Donation of ₦${amount.toLocaleString()} for ${category}`,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        console.error('Error logging donation:', error);
        return { error };
      }

      console.log('Donation logged:', data);
      return { data };
    } catch (err) {
      console.error('Exception in logDonation:', err);
      return { error: err };
    }
  }

  /**
   * Fetch user's own activities (respects RLS)
   */
  async getActivities(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: Activity[]; error?: any }> {
    try {
      const { data, error } = await supaBaseClient
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching activities:', error);
        return { data: [], error };
      }

      return { data: data || [] };
    } catch (err) {
      console.error('Exception in getActivities:', err);
      return { data: [], error: err };
    }
  }

  /**
   * Fetch all activities (admin only, respects RLS)
   */
  async getAllActivities(
    limit: number = 50,
    offset: number = 0
  ): Promise<{ data: Activity[]; error?: any }> {
    try {
      const { data, error } = await supaBaseClient
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching all activities:', error);
        return { data: [], error };
      }

      console.log("activity fetched", data)

      return { data: data || [] };
    } catch (err) {
      console.error('Exception in getAllActivities:', err);
      return { data: [], error: err };
    }
  }

  /**
   * Update activity status (admin only)
   */
  async updateActivityStatus(
    id: string,
    status: 'approved' | 'rejected'
  ): Promise<{ data?: Activity; error?: any }> {
    try {
      const { data, error } = await supaBaseClient
        .from('activities')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating activity status:', error);
        return { error };
      }

      console.log('Activity status updated:', data);
      return { data };
    } catch (err) {
      console.error('Exception in updateActivityStatus:', err);
      return { error: err };
    }
  }
}
