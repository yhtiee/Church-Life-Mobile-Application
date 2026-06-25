import { useQuery } from '@tanstack/react-query';
import { AnnoucementService } from '@/lib/supabase/services/announcements';
import { QUERY_KEYS } from '@/constants/query-keys';

const announcementService = new AnnoucementService();

export function useAnnouncementsQuery(parishId?: string | null, importantOnly: boolean = false) {
  return useQuery({
    queryKey: [...QUERY_KEYS.announcements(importantOnly), parishId],
    queryFn: async () => {
      const res = await announcementService.fetchAnnouncements(parishId, importantOnly);
      if (res.error) throw res.error;
      return res.data || [];
    },
  });
}

export function useAnnouncementsByParishQuery(parishId: string, importantOnly: boolean = false) {
  return useQuery({
    queryKey: [QUERY_KEYS.announcements(importantOnly), parishId],
    queryFn: async () => {
      const res = await announcementService.fetchAnnouncementsByParish(parishId, importantOnly);
      if (res.error) throw res.error;
      return res.data || [];
    },
    enabled: !!parishId,
  });
}

export function useAnnouncementQuery(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.announcement(id),
    queryFn: async () => {
      const res = await announcementService.fetchAnnouncementById(id);
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!id,
  });
}
