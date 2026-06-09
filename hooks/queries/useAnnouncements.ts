import { useQuery } from '@tanstack/react-query';
import { AnnoucementService } from '@/lib/supabase/services/announcements';
import { QUERY_KEYS } from '@/constants/query-keys';

const announcementService = new AnnoucementService();

export function useAnnouncementsQuery(importantOnly: boolean = false) {
  return useQuery({
    queryKey: QUERY_KEYS.announcements(importantOnly),
    queryFn: async () => {
      const res = await announcementService.fetchAnnouncements(importantOnly);
      if (res.error) throw res.error;
      return res.data || [];
    },
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
