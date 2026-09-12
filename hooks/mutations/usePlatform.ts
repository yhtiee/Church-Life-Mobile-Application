import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PlatformService } from '@/lib/supabase/services/platform';
import { QUERY_KEYS } from '@/constants/query-keys';

const platformService = new PlatformService();

/**
 * Everything a platform administrator can change.
 *
 * Grouped into one hook because every action invalidates the same few
 * queries, and the screens tend to need more than one of them.
 */
export function usePlatformMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parishOverview() });
    queryClient.invalidateQueries({ queryKey: ['platformProfiles'] });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auditLog() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.parishes() });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.allProfiles() });
  };

  const saveParish = useMutation({
    mutationFn: async (parish: {
      id?: string | null;
      name: string;
      diocese: string;
      state: string;
      country: string;
    }) => {
      const res = await platformService.saveParish(parish);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const setParishAdmin = useMutation({
    mutationFn: async ({
      targetUserId,
      makeAdmin,
    }: {
      targetUserId: string;
      makeAdmin: boolean;
    }) => {
      const res = await platformService.setParishAdmin(targetUserId, makeAdmin);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const setMemberParish = useMutation({
    mutationFn: async ({
      targetUserId,
      parishId,
    }: {
      targetUserId: string;
      parishId: string;
    }) => {
      const res = await platformService.setMemberParish(targetUserId, parishId);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const setSuperAdmin = useMutation({
    mutationFn: async ({
      targetUserId,
      grantAccess,
    }: {
      targetUserId: string;
      grantAccess: boolean;
    }) => {
      const res = await platformService.setSuperAdmin(targetUserId, grantAccess);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: invalidate,
  });

  const saveGlobalGroup = useMutation({
    mutationFn: async (group: {
      id?: string | null;
      name: string;
      description: string;
      isSecure: boolean;
    }) => {
      const res = await platformService.saveGlobalGroup(group);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.groups() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.openGroups() });
    },
  });

  return { saveParish, setParishAdmin, setMemberParish, setSuperAdmin, saveGlobalGroup };
}
