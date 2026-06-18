import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdsService, Ad } from '@/lib/supabase/services/ads';
import { QUERY_KEYS } from '@/constants/query-keys';

const adsService = new AdsService();

export function useAllAdsQuery() {
  return useQuery({
    queryKey: [QUERY_KEYS.ads('all')],
    queryFn: async () => {
      const res = await adsService.fetchAllAds();
      if (res.error) throw res.error;
      return res.data || [];
    },
    retry: 1,
  });
}

export function useAdByIdQuery(id: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.ad(id)],
    queryFn: async () => {
      const res = await adsService.getAdById(id);
      if (res.error) throw res.error;
      return res.data;
    },
    enabled: !!id,
  });
}

export function useCreateAdMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { ad: Omit<Ad, 'id' | 'created_at' | 'updated_at'>; imageFile?: any }) => {
      const res = await adsService.createAd(data.ad, data.imageFile);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ads('all')] });
    },
  });
}

export function useUpdateAdMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Ad>; imageFile?: any }) => {
      const res = await adsService.updateAd(data.id, data.updates, data.imageFile);
      if (res.error) throw res.error;
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ads('all')] });
    },
  });
}

export function useDeleteAdMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; imageUrl?: string }) => {
      const res = await adsService.deleteAd(data.id, data.imageUrl);
      if (res.error) throw res.error;
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ads('all')] });
    },
  });
}
