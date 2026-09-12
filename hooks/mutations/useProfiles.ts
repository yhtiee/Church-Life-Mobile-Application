import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/lib/supabase/services/auth';
import { QUERY_KEYS } from '@/constants/query-keys';
import { AuthUser } from '@/context/AuthContext';
import type { DutyRole, UserRole } from '@/lib/supabase/entities/types';

const authService = new AuthService();

export function useUpdateUserProfileMutation(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<AuthUser>) => {
      const res = await authService.updateUserProfile(userId, updates);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userProfile(userId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allProfiles() });
    },
  });
}

/**
 * Assigns a member's access role and/or duty title. Parish admins only —
 * the database function rejects the call otherwise.
 */
export function useAssignMemberRolesMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      targetUserId,
      role,
      dutyRole,
    }: {
      targetUserId: string;
      role?: UserRole;
      dutyRole?: DutyRole | null;
    }) => {
      const res = await authService.assignMemberRoles(targetUserId, { role, dutyRole });
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userProfile(variables.targetUserId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allProfiles() });
    },
  });
}
