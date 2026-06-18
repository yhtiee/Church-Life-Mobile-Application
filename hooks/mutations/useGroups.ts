import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { ComunityService } from '@/lib/supabase/services/community';
import { QUERY_KEYS } from '@/constants/query-keys';
import { DatabaseGroupRequest, Group } from '@/lib/supabase/entities/types';
import { ChatMessage } from '@/constants/mockData';

const communityService = new ComunityService();

interface JoinGroupParams {
  userId: string;
  groupId: string;
}

export function useJoinOpenGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, groupId }: JoinGroupParams) => {
      const res = await communityService.joinOpenGroup(userId, groupId);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userProfile(variables.userId) });
    },
  });
}

/**
 * Approves a pending group transition/join request (admin action).
 */
export function useApproveGroupRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: DatabaseGroupRequest) => {
      const res = await communityService.approveGroupRequest(request);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groupRequests() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allProfiles() });
      if (variables.user_id) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userProfile(variables.user_id) });
      }
    },
  });
}

/**
 * Rejects (deletes) a pending group transition/join request (admin action).
 */
export function useRejectGroupRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await communityService.rejectGroupRequest(requestId);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groupRequests() });
    },
  });
}

/**
 * Creates a new secured group (admin action).
 */
export function useCreateSecuredGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (groupData: {
      name: string;
      description?: string;
      parishId?: string;
    }) => {
      const res = await communityService.createSecuredGroup(groupData);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups() });
    },
  });
}

/**
 * Sends a message to a group (admin broadcasting).
 */
export function useSendGroupMessageMutation(groupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
      const res = await communityService.sendGroupMessage(groupId, message);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupMessages', groupId] });
    },
  });
}

/**
 * Fetches group messages with pagination.
 */
export function useGroupMessagesQuery(groupId: string, limit: number = 50, offset: number = 0) {
  return useQuery({
    queryKey: ['groupMessages', groupId, limit, offset],
    queryFn: async () => {
      const res = await communityService.fetchGroupMessagesWithPagination(groupId, limit, offset);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!groupId,
  });
}
