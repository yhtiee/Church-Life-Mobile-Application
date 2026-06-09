import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ComunityService } from '@/lib/supabase/services/community';
import { QUERY_KEYS } from '@/constants/query-keys';

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
