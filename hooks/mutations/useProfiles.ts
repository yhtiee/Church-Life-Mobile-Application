import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService } from '@/lib/supabase/services/auth';
import { QUERY_KEYS } from '@/constants/query-keys';
import { AuthUser } from '@/context/AuthContext';

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
