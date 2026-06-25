import { supaBaseClient } from '../client';
import { GroupUpdate, GroupRequest, ChatMessage } from '@/constants/mockData';
import { Group, DatabaseGroupRequest } from '../entities/types';
import { notifyOnSuccess } from './notification';

export class ComunityService {

  /**
   * Fetches recent updates posted within a specific church group.
   */
  async fetchGroupUpdates(groupId: string) {
    try {
      const { data: { session } } = await supaBaseClient.auth.getSession();
      const userId = session?.user?.id;
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
        .from('group_updates')
        .select('*')
        .eq('groupId', groupId)
        .eq('parish_id', parishId)
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
      const { data: { session } } = await supaBaseClient.auth.getSession();
      const userId = session?.user?.id;
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
        .from('group_updates')
        .insert([
          {
            ...update,
            groupId,
            parish_id: parishId,
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
      const { data: { session } } = await supaBaseClient.auth.getSession();
      const userId = session?.user?.id;
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
        .from('group_requests')
        .insert([
          {
            userName,
            targetGroupId,
            currentGroupId,
            user_id: userId,
            parish_id: parishId,
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
   * Fetches all pending group transition/join requests across the parish (admin view).
   */
  async fetchAllGroupRequests() {
    try {
      const { data, error } = await supaBaseClient
        .from('group_requests')
        .select('*, targetGroup:targetGroupId(name), currentGroup:currentGroupId(name)')
        .order('requestDate', { ascending: false });

      if (error) throw error;
      return {
        data: data as (DatabaseGroupRequest & {
          targetGroup: { name: string } | null;
          currentGroup: { name: string } | null;
        })[],
        error: null,
      };
    } catch (error: any) {
      console.error('Error fetching all group requests:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Fetches pending group requests filtered by parish (admin view for specific parish).
   */
  async fetchGroupRequestsByParish(parishId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('group_requests')
        .select('*, targetGroup:targetGroupId(name), currentGroup:currentGroupId(name)')
        .eq('parish_id', parishId)
        .order('requestDate', { ascending: false });

      if (error) throw error;
      return {
        data: data as (DatabaseGroupRequest & {
          targetGroup: { name: string } | null;
          currentGroup: { name: string } | null;
        })[],
        error: null,
      };
    } catch (error: any) {
      console.error(`Error fetching group requests for parish (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Fetches recent group updates/bulletins across all groups (admin feed).
   */
  async fetchAllGroupUpdates() {
    try {
      const { data, error } = await supaBaseClient
        .from('group_updates')
        .select('*, group:groupId(name)')
        .order('date', { ascending: false });

      if (error) throw error;
      return {
        data: data as (GroupUpdate & { group: { name: string } | null })[],
        error: null,
      };
    } catch (error: any) {
      console.error('Error fetching all group updates:', error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Fetches group updates filtered by parish (admin view for specific parish).
   */
  async fetchGroupUpdatesByParish(parishId: string) {
    try {
      const { data, error } = await supaBaseClient
        .from('group_updates')
        .select('*, group:groupId(name)')
        .eq('parish_id', parishId)
        .order('date', { ascending: false });

      if (error) throw error;
      return {
        data: data as (GroupUpdate & { group: { name: string } | null })[],
        error: null,
      };
    } catch (error: any) {
      console.error(`Error fetching group updates for parish (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Approves a group transition/join request: moves the user into the target
   * group's membership, removes them from their previous group (if any),
   * updates their profile, and clears the request (raw implementation).
   */
  async approveGroupRequestRaw(request: DatabaseGroupRequest) {
    try {
      const { data: targetGroup, error: targetError } = await supaBaseClient
        .from('groups')
        .select('name, member_ids')
        .eq('id', request.targetGroupId)
        .single();

      if (targetError) throw targetError;

      if (request.user_id) {
        const targetMembers: string[] = targetGroup.member_ids || [];
        if (!targetMembers.includes(request.user_id)) {
          const { error: addError } = await supaBaseClient
            .from('groups')
            .update({ member_ids: [...targetMembers, request.user_id] })
            .eq('id', request.targetGroupId);
          if (addError) throw addError;
        }

        if (request.currentGroupId) {
          const { data: currentGroup, error: currentError } = await supaBaseClient
            .from('groups')
            .select('member_ids')
            .eq('id', request.currentGroupId)
            .single();

          if (!currentError && currentGroup) {
            const currentMembers: string[] = currentGroup.member_ids || [];
            const updatedMembers = currentMembers.filter((id) => id !== request.user_id);
            if (updatedMembers.length !== currentMembers.length) {
              await supaBaseClient
                .from('groups')
                .update({ member_ids: updatedMembers })
                .eq('id', request.currentGroupId);
            }
          }
        }

        const { error: profileError } = await supaBaseClient
          .from('profiles')
          .update({ groupId: request.targetGroupId, groupName: targetGroup.name })
          .eq('id', request.user_id);

        if (profileError) throw profileError;
      }

      const { error: deleteError } = await supaBaseClient
        .from('group_requests')
        .delete()
        .eq('id', request.id);

      if (deleteError) throw deleteError;

      return { data: { groupName: targetGroup.name, userName: request.userName }, error: null };
    } catch (error: any) {
      console.error(`Error approving group request (${request.id}):`, error.message || error);
      return { data: null, error };
    }
  }

  approveGroupRequest = notifyOnSuccess(
    this.approveGroupRequestRaw.bind(this),
    (result) => ({
      title: 'Group Request Approved',
      body: `${result.data?.userName ?? 'A member'} has been added to ${result.data?.groupName ?? 'the group'}.`,
      type: 'group',
    })
  );

  /**
   * Rejects (deletes) a pending group transition/join request.
   */
  async rejectGroupRequest(requestId: string) {
    try {
      const { error } = await supaBaseClient
        .from('group_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      return { data: { id: requestId }, error: null };
    } catch (error: any) {
      console.error(`Error rejecting group request (${requestId}):`, error.message || error);
      return { data: null, error };
    }
  }

  /**
   * Fetches chat messages for a specific group channel.
   */
  async fetchChatMessages(groupId: string, limit: number = 50) {
    try {
      const { data: { session } } = await supaBaseClient.auth.getSession();
      const userId = session?.user?.id;
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
        .from('group_messages')
        .select('*, profiles!sender(fullName)')
        .eq('groupId', groupId)
        .eq('parish_id', parishId)
        .order('timestamp', { ascending: true })
        .limit(limit);
  
      if (error) throw error;
      
      const mapped = (data || []).map((msg: any) => ({
        id: msg.id,
        groupId: msg.groupId,
        sender: msg.profiles?.fullName || 'Unknown User',
        senderRole: msg.senderRole,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      return { data: mapped as ChatMessage[], error: null };
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
      const { data: { session } } = await supaBaseClient.auth.getSession();
      const userId = session?.user?.id;
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
        .from('group_messages')
        .insert([
          {
            groupId,
            sender: userId, // Write UUID instead of string name
            senderRole: message.senderRole,
            content: message.content,
            parish_id: parishId,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ])
        .select('*, profiles!sender(fullName)')
        .single();
  
      if (error) throw error;

      const mapped: ChatMessage = {
        id: data.id,
        groupId: data.groupId,
        sender: data.profiles?.fullName || 'Unknown User',
        senderRole: data.senderRole as any,
        content: data.content,
        timestamp: data.timestamp,
      };

      return { data: mapped, error: null };
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
    let parishId: string | null = null;
    try {
      const { data: { session } } = await supaBaseClient.auth.getSession();
      const userId = session?.user?.id;
      if (userId) {
        const { data: profile } = await supaBaseClient
          .from('profiles')
          .select('parishId')
          .eq('id', userId)
          .single();
        parishId = profile?.parishId;
      }
    } catch (err) {
      console.error('Failed to get session for chat subscription:', err);
    }

    const channel = supaBaseClient
      .channel(`group-chat:${groupId}:${parishId || 'global'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `groupId=eq.${groupId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          if (!parishId || newMsg.parish_id === parishId) {
            let senderName = 'Unknown User';
            try {
              const { data: profile } = await supaBaseClient
                .from('profiles')
                .select('fullName')
                .eq('id', newMsg.sender)
                .single();
              if (profile) senderName = profile.fullName;
            } catch (err) {
              console.error('Failed to fetch sender profile for real-time msg:', err);
            }

            onMessageReceived({
              id: newMsg.id,
              groupId: newMsg.groupId,
              sender: senderName,
              senderRole: newMsg.senderRole,
              content: newMsg.content,
              timestamp: newMsg.timestamp,
            });
          }
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
      console.log(data, "data")
      return { data: data as Group[], error: null };
    }catch(error: any){
      console.error('Error fetching open groups:', error.message || error);
      return { data: null, error };
    }
  }

  async getAllGroups(){
    try{
      const { data: { session } } = await supaBaseClient.auth.getSession();
      const userId = session?.user?.id;
      let parishId: string | null = null;
      if (userId) {
        const { data: profile } = await supaBaseClient
          .from('profiles')
          .select('parishId')
          .eq('id', userId)
          .single();
        parishId = profile?.parishId;
      }

      // Fetch all groups (global ones where parish_id is null, and parish-specific secure groups)
      const { data: groups, error: groupError } = await supaBaseClient
        .from('groups')
        .select('*');

      if (groupError) throw groupError;

      // Filter groups: either global groups (parish_id is null) or specific parish groups
      const filteredGroups = (groups || []).filter(g => g.parish_id === null || g.parish_id === parishId);

      if (!parishId) {
        return { data: filteredGroups as Group[], error: null };
      }

      // Fetch all profiles in this parish who have joined a group
      const { data: profiles, error: profileError } = await supaBaseClient
        .from('profiles')
        .select('id, groupId')
        .eq('parishId', parishId)
        .not('groupId', 'is', null);

      if (profileError) throw profileError;

      // Map group memberships dynamically by parish
      const mappedGroups = filteredGroups.map((group) => {
        if (!group.is_secure) {
          // Open groups: filter members belonging to this parish
          const groupMembers = profiles
            ?.filter((p) => p.groupId === group.id)
            .map((p) => p.id) || [];
          return {
            ...group,
            member_ids: groupMembers,
          };
        }
        return group;
      });

      return { data: mappedGroups as Group[], error: null };
    }catch(error: any){
      console.error('Error fetching all groups:', error.message || error);
      return { data: null, error };
    }
  }
 
  /**
   * Fetches groups filtered by parish (admin view for specific parish).
   * This assumes groups have members from a specific parish.
   */
  async getGroupsByParish(parishId: string) {
    try {
      // Fetch all groups where parish_id is null (global) or matches parishId
      const { data: groups, error: groupError } = await supaBaseClient
        .from('groups')
        .select('*')
        .or(`parish_id.is.null,parish_id.eq.${parishId}`)
        .order('created_at', { ascending: false });

      if (groupError) throw groupError;

      // Fetch all profiles in this parish who have joined a group
      const { data: profiles, error: profileError } = await supaBaseClient
        .from('profiles')
        .select('id, groupId')
        .eq('parishId', parishId)
        .not('groupId', 'is', null);

      if (profileError) throw profileError;

      // Map group memberships dynamically by parish
      const mappedGroups = (groups || []).map((group) => {
        if (!group.is_secure) {
          // Open groups: filter members belonging to this parish
          const groupMembers = profiles
            ?.filter((p) => p.groupId === group.id)
            .map((p) => p.id) || [];
          return {
            ...group,
            member_ids: groupMembers,
          };
        }
        return group;
      });

      return { data: mappedGroups as Group[], error: null };
    } catch (error: any) {
      console.error(`Error fetching groups for parish (${parishId}):`, error.message || error);
      return { data: null, error };
    }
  }

  async joinOpenGroupRaw(userId: string, groupId: string) {
    try {
      const { data: group, error: fetchError } = await supaBaseClient
        .from('groups')
        .select('name')
        .eq('id', groupId)
        .single();

      if (fetchError) throw fetchError;

      const { error: profileError } = await supaBaseClient
        .from('profiles')
        .update({ groupId: groupId, groupName: group.name })
        .eq('id', userId);

      if (profileError) throw profileError;

      return { data: { groupId, groupName: group.name }, error: null };
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

  /**
   * Creates a new secured group (admin only).
   */
  async createSecuredGroupRaw(groupData: {
    name: string;
    description?: string;
    parishId?: string;
  }) {
    try {
      const { data, error } = await supaBaseClient
        .from('groups')
        .insert([
          {
            name: groupData.name,
            description: groupData.description || '',
            parish_id: groupData.parishId,
            is_secure: true,
            member_ids: [],
            created_at: new Date().toISOString(),
            update_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Group, error: null };
    } catch (error: any) {
      console.error('Error creating secured group:', error.message || error);
      return { data: null, error };
    }
  }

  createSecuredGroup = notifyOnSuccess(
    this.createSecuredGroupRaw.bind(this),
    (result) => ({
      title: 'Group Created',
      body: `The secured group "${result.data?.name || 'group'}" has been created successfully.`,
      type: 'group',
    })
  );

  /**
   * Sends a chat message to a group (admin broadcasting).
   */
  async sendGroupMessageRaw(groupId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) {
    try {
      const { data: { session } } = await supaBaseClient.auth.getSession();
      const userId = session?.user?.id;
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
        .from('group_messages')
        .insert([
          {
            groupId,
            sender: userId, // Write UUID instead of string name
            senderRole: message.senderRole,
            content: message.content,
            parish_id: parishId,
            timestamp: new Date().toISOString(),
          },
        ])
        .select('*, profiles!sender(fullName)')
        .single();
  
      if (error) throw error;
      
      const mapped: ChatMessage = {
        id: data.id,
        groupId: data.groupId,
        sender: data.profiles?.fullName || 'Unknown User',
        senderRole: data.senderRole as any,
        content: data.content,
        timestamp: data.timestamp,
      };

      return { data: mapped, error: null };
    } catch (error: any) {
      console.error('Error sending group message:', error.message || error);
      return { data: null, error };
    }
  }
  
  sendGroupMessage = notifyOnSuccess(
    this.sendGroupMessageRaw.bind(this),
    (result) => ({
      title: 'Message Sent',
      body: 'Your message has been posted to the group.',
      type: 'group',
    })
  );
 
  /**
   * Fetches all messages for a group with pagination.
   */
  async fetchGroupMessagesWithPagination(groupId: string, limit: number = 50, offset: number = 0) {
    try {
      const { data: { session } } = await supaBaseClient.auth.getSession();
      const userId = session?.user?.id;
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
        .from('group_messages')
        .select('*, profiles!sender(fullName)')
        .eq('groupId', groupId)
        .eq('parish_id', parishId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      
      const mapped = (data || []).map((msg: any) => ({
        id: msg.id,
        groupId: msg.groupId,
        sender: msg.profiles?.fullName || 'Unknown User',
        senderRole: msg.senderRole,
        content: msg.content,
        timestamp: msg.timestamp,
      }));

      return { data: mapped as ChatMessage[], error: null };
    } catch (error: any) {
      console.error(`Error fetching group messages for (${groupId}):`, error.message || error);
      return { data: null, error };
    }
  }

}
