import { supaBaseClient } from '../client';
import * as FileSystem from 'expo-file-system/legacy';

const BUCKET_NAME = 'media';
const ADS_FOLDER = 'ads';

export interface Ad {
  id: string;
  title: string;
  body: string;
  image_url: string;
  cta_text?: string;
  cta_url?: string;
  category: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  parish_id?: string | null;
}

export class AdsService {
  /**
   * Upload an image to Supabase storage
   * @param file - Image file to upload from expo-image-picker
   * @param adId - Ad ID (optional, generates one if not provided)
   * @returns URL of uploaded image
   */
  async uploadAdImage(
    file: { uri: string; name: string; type: string },
    adId?: string
  ): Promise<{ url: string | null; error: any }> {
    try {
      const fileName = adId || `${Date.now()}`;
      const filePath = `${ADS_FOLDER}/${fileName}-${file.name}`;

      // For expo-image-picker files, read as base64 using expo-file-system legacy API
      const base64Data = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 string to binary array for upload
      const binaryStr = atob(base64Data);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const { data, error } = await supaBaseClient.storage
        .from(BUCKET_NAME)
        .upload(filePath, bytes, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error('Error uploading image:', error);
        return { url: null, error };
      }

      // Get public URL
      const { data: publicData } = supaBaseClient.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return { url: publicData.publicUrl, error: null };
    } catch (err) {
      console.error('Exception uploading image:', err);
      return { url: null, error: err };
    }
  }

  /**
   * Delete an image from Supabase storage
   */
  async deleteAdImage(imageUrl: string): Promise<{ error: any }> {
    try {
      // Extract file path from URL
      const filePath = imageUrl.split(`${BUCKET_NAME}/`)[1];
      if (!filePath) {
        return { error: 'Invalid image URL' };
      }

      const { error } = await supaBaseClient.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Error deleting image:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Exception deleting image:', err);
      return { error: err };
    }
  }

  async fetchActiveAds(): Promise<{ data: Ad[] | null; error: any }> {
    try {
      const { data, error } = await supaBaseClient
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching ads:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception fetching ads:', err);
      return { data: null, error: err };
    }
  }

  /**
   * Fetch all ads for admin view (no date filtering)
   */
  async fetchAllAds(): Promise<{ data: Ad[] | null; error: any }> {
    try {
      const { data, error } = await supaBaseClient
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching all ads:', error);
        return { data: null, error };
      }

      return { data: data || [], error: null };
    } catch (err) {
      console.error('Exception fetching all ads:', err);
      return { data: null, error: err };
    }
  }

  async createAd(
    ad: Omit<Ad, 'id' | 'created_at' | 'updated_at'>,
    imageFile?: { uri: string; name: string; type: string }
  ): Promise<{ data: Ad | null; error: any }> {
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

      let imageUrl = ad.image_url;

      // Upload image if provided
      if (imageFile) {
        const { url, error: uploadError } = await this.uploadAdImage(imageFile);
        if (uploadError) {
          return { data: null, error: uploadError };
        }
        imageUrl = url || ad.image_url;
      }

      const adData = {
        ...ad,
        image_url: imageUrl,
        parish_id: parishId,
      };

      const { data, error } = await supaBaseClient
        .from('ads')
        .insert([adData])
        .select()
        .single();

      if (error) {
        console.error('Error creating ad:', error);
        // Delete uploaded image if ad creation failed
        if (imageFile && imageUrl) {
          await this.deleteAdImage(imageUrl);
        }
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception creating ad:', err);
      return { data: null, error: err };
    }
  }

  async updateAd(
    id: string,
    updates: Partial<Ad>,
    imageFile?: { uri: string; name: string; type: string }
  ): Promise<{ data: Ad | null; error: any }> {
    try {
      let updateData = { ...updates };

      // Upload new image if provided
      if (imageFile) {
        const { url, error: uploadError } = await this.uploadAdImage(imageFile, id);
        if (uploadError) {
          return { data: null, error: uploadError };
        }

        // Delete old image if exists
        if (updates.image_url) {
          await this.deleteAdImage(updates.image_url);
        }

        updateData.image_url = url || updates.image_url;
      }

      const { data, error } = await supaBaseClient
        .from('ads')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating ad:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception updating ad:', err);
      return { data: null, error: err };
    }
  }

  async deleteAd(id: string, imageUrl?: string): Promise<{ error: any }> {
    try {
      // Delete image from storage if URL provided
      if (imageUrl) {
        await this.deleteAdImage(imageUrl);
      }

      const { error } = await supaBaseClient
        .from('ads')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting ad:', error);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Exception deleting ad:', err);
      return { error: err };
    }
  }

  async getAdById(id: string): Promise<{ data: Ad | null; error: any }> {
    try {
      const { data, error } = await supaBaseClient
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching ad:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Exception fetching ad:', err);
      return { data: null, error: err };
    }
  }
}
