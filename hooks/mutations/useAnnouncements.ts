import { useMutation, useQueryClient } from '@tanstack/react-query';
   import { AnnoucementService } from '@/lib/supabase/services/announcements';
   import { QUERY_KEYS } from '@/constants/query-keys';
   import { Announcement } from '@/constants/mockData';

   const announcementService = new AnnoucementService();

   export function useCreateAnnouncementMutation() {
     const queryClient = useQueryClient();
     return useMutation({
       mutationFn: async (announcement: Omit<Announcement, 'id' | 'date'>) => {
         const res = await announcementService.createAnnouncement(announcement);
         if (res.error) throw res.error;
         return res.data;
       },
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: QUERY_KEYS.announcements() });
       },
     });
   }
