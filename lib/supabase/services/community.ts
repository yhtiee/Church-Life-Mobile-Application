import { supaBaseClient } from '../client';
import { GroupUpdate, GroupRequest, ChatMessage } from '@/constants/mockData';
import { Group } from '../entities/types';
import { notifyOnSuccess } from './notification';

export class ComunityService {

  /**
   * Fetches recent updates posted within a specific church group.
   */
  async fetchGroupUpdates(groupId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('group_updates')
        .select('*')
        .eq('groupId', groupId)
        .order('date', { ascending: false });
  
      if (error) throw error;
      return { data: data as GroupUpdate[], error: null };
    } catch (error: any) {
      console.error(`Error fetching updates for group (${groupId}):`, error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Posts a new update/bulletin for a specific church group.
   */
  async createGroupUpdate(groupId: string, update: Omit<GroupUpdate, 'id' | 'date'>) {
    try {
      const { data, error } = await supaBaseClient
        .from('group_updates')
        .insert([
          {
            ...update,
            groupId,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
          },
        ])
        .select()
        .single();
  
      if (error) throw error;
      return { data: data as GroupUpdate, error: null };
    } catch (error: any) {
      console.error('Error creating group update:', error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Submits a request for a user to join or transition to a target church group.
   */
  async submitGroupRequest(userName: string, targetGroupId: string, currentGroupId?: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('group_requests')
        .insert([
          {
            userName,
            targetGroupId,
            currentGroupId,
            requestDate: new Date().toISOString(),
          },
        ])
        .select()
        .single();
  
      if (error) throw error;
      return { data: data as GroupRequest, error: null };
    } catch (error: any) {
      console.error('Error submitting group request:', error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Fetches pending group requests for a specific group (usually called by group/parish admins).
   */
  async fetchGroupRequests(groupId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('group_requests')
        .select('*')
        .eq('targetGroupId', groupId)
        .order('requestDate', { ascending: false });
  
      if (error) throw error;
      return { data: data as GroupRequest[], error: null };
    } catch (error: any) {
      console.error(`Error fetching group requests for (${groupId}):`, error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Fetches chat messages for a specific group channel.
   */
  async fetchChatMessages(groupId: string, limit: number = 50) {
    try {
      const { data, error } = await supaBaseClient
        .from('group_messages')
        .select('*')
        .eq('groupId', groupId)
        .order('timestamp', { ascending: true })
        .limit(limit);
  
      if (error) throw error;
      return { data: data as ChatMessage[], error: null };
    } catch (error: any) {
      console.error(`Error fetching chat messages for (${groupId}):`, error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Sends a message in a group's chat room.
   */
  async sendChatMessage(groupId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    try {
      const { data, error } = await supaBaseClient
        .from('group_messages')
        .insert([
          {
            ...message,
            groupId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
        .select()
        .single();
  
      if (error) throw error;
      return { data: data as ChatMessage, error: null };
    } catch (error: any) {
      console.error('Error sending chat message:', error.message || error);
      return { data: null, error };
    }
  }
  
  /**
   * Subscribes to real-time chat messages for a group.
   * Returns the unsubscribe function.
   */
  async subscribeToGroupChats(groupId: string, onMessageReceived: (message: ChatMessage) => void) {
    const channel = supaBaseClient
      .channel(`group-chat:${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `groupId=eq.${groupId}`,
        },
        (payload) => {
          onMessageReceived(payload.new as ChatMessage);
        }
      )
      .subscribe();
  
    return () => {
      supaBaseClient.removeChannel(channel);
    };
  }

  async getOpenGroups(){
    try{
      const { data, error } = await supaBaseClient
        .from('groups')
        .select('*')
        .eq('is_secure', false);

      if (error) throw error;
      return { data: data as Group[], error: null };
    }catch(error: any){
      console.error('Error fetching open groups:', error.message || error);
      return { data: null, error };
    }
  }

  async getAllGroups(){
    try{
      const { data, error } = await supaBaseClient
        .from('groups')
        .select('*');

      if (error) throw error;
      return { data: data as Group[], error: null };
    }catch(error: any){
      console.error('Error fetching open groups:', error.message || error);
      return { data: null, error };
    }
  }

  async joinOpenGroupRaw(userId: string, groupId: string) {
    try {
      const { data: newGroup, error: newGroupFetchError } = await supaBaseClient
        .from('groups')
        .select('name, member_ids')
        .eq('id', groupId)
        .single();

      if (newGroupFetchError) throw newGroupFetchError;

      const currentMembers = newGroup.member_ids || [];
      if (!currentMembers.includes(userId)) {
        const updatedMembers = [...currentMembers, userId];
        const { error: newGroupUpdateError } = await supaBaseClient
          .from('groups')
          .update({ member_ids: updatedMembers })
          .eq('id', groupId);

        if (newGroupUpdateError) throw newGroupUpdateError;
      }
      return { data: { groupId, groupName: newGroup.name }, error: null };
    } catch (error: any) {
      console.error('Error joining open group:', error.message || error);
      return { data: null, error };
    }
  }

  joinOpenGroup = notifyOnSuccess(
    this.joinOpenGroupRaw.bind(this),
    (result) => ({
      title: 'Group Joined',
      body: `You have successfully joined the ${result.data?.groupName || 'group'}.`,
      type: 'group',
    })
  );

}
