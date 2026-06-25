import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, TextInput, Image,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/FeedbackContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { useAllAdsQuery, useCreateAdMutation, useUpdateAdMutation, useDeleteAdMutation } from '@/hooks/queries/useAds';
import { Ad, AdsService } from '@/lib/supabase/services/ads';

const AD_CATEGORIES = ['All', 'Promotion', 'Events', 'Classes', 'Fundraiser', 'Other'];

const CATEGORY_COLORS: Record<string, string> = {
  Promotion: '#2A6FDB',
  Events: '#7C3AED',
  Classes: '#D97706',
  Fundraiser: '#059669',
  Other: '#6B7280',
};

type FormMode = 'create' | 'edit';

export default function AdminAdsModal() {
  const { colors, typography, radius } = useTheme();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const { data: ads = [], isLoading, refetch } = useAllAdsQuery();

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCategory, setFormCategory] = useState('Promotion');
  const [formCtaText, setFormCtaText] = useState('Learn More');
  const [formCtaUrl, setFormCtaUrl] = useState('');
  const [formImage, setFormImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState(true);

  const createAdMutation = useCreateAdMutation();
  const updateAdMutation = useUpdateAdMutation();
  const deleteAdMutation = useDeleteAdMutation();

  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      const matchesSearch =
        ad.title.toLowerCase().includes(search.toLowerCase()) ||
        ad.body.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === 'All' || ad.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [ads, search, activeFilter]);

  // Handle image picker
  const handlePickImage = async () => {
    setPickingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'] as any,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || `image-${Date.now()}.jpg`;
        const fileType = asset.type === 'image' ? 'image/jpeg' : asset.mimeType || 'image/jpeg';

        setFormImage({
          uri: asset.uri,
          name: fileName,
          type: fileType,
        });
        setFormImagePreview(asset.uri);
      }
    } catch (err) {
        console.log(err);
      showAlert({ title: 'Error', message: 'Failed to pick image', type: 'error' });
    } finally {
      setPickingImage(false);
    }
  };

  // Handle opening create form
  const handleCreateAd = () => {
    setFormMode('create');
    setFormTitle('');
    setFormBody('');
    setFormCategory('Promotion');
    setFormCtaText('Learn More');
    setFormCtaUrl('');
    setFormImage(null);
    setFormImagePreview('');
    setFormIsActive(true);
    setSelectedAd(null);
    setFormModalVisible(true);
  };

  // Handle opening edit form
  const handleEditAd = (ad: Ad) => {
    setFormMode('edit');
    setFormTitle(ad.title);
    setFormBody(ad.body);
    setFormCategory(ad.category);
    setFormCtaText(ad.cta_text || 'Learn More');
    setFormCtaUrl(ad.cta_url || '');
    setFormImage(null);
    setFormImagePreview(ad.image_url);
    setFormIsActive(ad.is_active);
    setSelectedAd(ad);
    setFormModalVisible(true);
  };

  // Handle form submission
  const handleSubmitForm = async () => {
    if (!formTitle.trim()) {
      showAlert({ title: 'Error', message: 'Please enter a title', type: 'error' });
      return;
    }
    if (!formBody.trim()) {
      showAlert({ title: 'Error', message: 'Please enter ad content', type: 'error' });
      return;
    }
    if (!formImagePreview && formMode === 'create') {
      showAlert({ title: 'Error', message: 'Please select an image', type: 'error' });
      return;
    }

    setFormSubmitting(true);
    try {
      const adService = new AdsService();

      if (formMode === 'create') {
        const result = await createAdMutation.mutateAsync({
          ad: {
            title: formTitle,
            body: formBody,
            category: formCategory,
            cta_text: formCtaText,
            cta_url: formCtaUrl,
            image_url: formImagePreview,
            is_active: formIsActive,
            start_date: new Date().toISOString(),
            created_by: user?.id || '', // Use authenticated user ID
          },
          imageFile: formImage,
        });

        showAlert({ title: 'Success', message: 'Ad created successfully!', type: 'success' });
      } else if (formMode === 'edit' && selectedAd) {
        await updateAdMutation.mutateAsync({
          id: selectedAd.id,
          updates: {
            title: formTitle,
            body: formBody,
            category: formCategory,
            cta_text: formCtaText,
            cta_url: formCtaUrl,
            is_active: formIsActive,
          },
          imageFile: formImage,
        });

        showAlert({ title: 'Success', message: 'Ad updated successfully!', type: 'success' });
      }

      setFormModalVisible(false);
    } catch (err: any) {
      showAlert({
        title: 'Failed',
        message: err?.message || 'An error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteAd = (ad: Ad) => {
    Alert.alert(
      'Delete Ad',
      `Are you sure you want to delete "${ad.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdMutation.mutateAsync({
                id: ad.id,
                imageUrl: ad.image_url,
              });

              showAlert({ title: 'Success', message: 'Ad deleted successfully!', type: 'success' });
            } catch (err: any) {
              showAlert({
                title: 'Failed',
                message: err?.message || 'Failed to delete ad. Please try again.',
                type: 'error',
              });
            }
          },
        },
      ]
    );
  };

  // Handle toggle active status
  const handleToggleStatus = async (ad: Ad) => {
    try {
      await updateAdMutation.mutateAsync({
        id: ad.id,
        updates: { is_active: !ad.is_active },
      });

      showAlert({
        title: 'Success',
        message: `Ad ${!ad.is_active ? 'activated' : 'deactivated'} successfully!`,
        type: 'success',
      });
    } catch (err: any) {
      showAlert({
        title: 'Failed',
        message: err?.message || 'Failed to update ad status.',
        type: 'error',
      });
    }
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Manage Ads" />
      <GlobalLoader visible={isLoading || formSubmitting || pickingImage} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── Search Bar ── */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)}>
          <AdminSearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search ads..."
            onFilterPress={handleCreateAd}
          />
        </Animated.View>

        {/* ── Category Filter ── */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
            Category
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {AD_CATEGORIES.map((category) => {
              const isActive = activeFilter === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    {
                      borderColor: isActive ? colors.primary : colors.border,
                      backgroundColor: isActive ? colors.primaryLight : colors.surface,
                    },
                  ]}
                  onPress={() => setActiveFilter(category)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      {
                        color: isActive ? colors.primary : colors.textMuted,
                        fontFamily: isActive ? typography.fontFamily.bold : typography.fontFamily.medium,
                      },
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* ── Create Button ── */}
        <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.createButtonSection}>
          <Button label="+ Create Ad" onPress={handleCreateAd} variant="primary" style={{ width: '100%' }} />
        </Animated.View>

        {/* ── Ads List ── */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.listSection}>
          {filteredAds.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="image-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                {search || activeFilter !== 'All' ? 'No ads match your search' : 'No ads yet'}
              </Text>
            </View>
          ) : (
            <View>
              {filteredAds.map((ad, index) => (
                <Animated.View
                  key={ad.id}
                  entering={FadeInDown.delay(280 + index * 50).duration(450)}
                >
                  <Card elevation="sm" style={[styles.adCard, { borderColor: colors.border }]}>
                    {/* Image Preview */}
                    {ad.image_url && (
                      <Image source={{ uri: ad.image_url }} style={styles.adImage} />
                    )}

                    {/* Content */}
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.adTitle,
                              { color: colors.text, fontFamily: typography.fontFamily.bold },
                            ]}
                            numberOfLines={2}
                          >
                            {ad.title}
                          </Text>
                          <Badge
                            label={ad.category}
                            variant="primary"
                            style={{ backgroundColor: CATEGORY_COLORS[ad.category], marginTop: 8 }}
                          />
                        </View>
                        {/* Status Toggle */}
                        <TouchableOpacity
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: ad.is_active ? '#D1FAE5' : '#FFE8E8',
                            },
                          ]}
                          onPress={() => handleToggleStatus(ad)}
                        >
                          <Ionicons
                            name={ad.is_active ? 'eye' : 'eye-off'}
                            size={14}
                            color={ad.is_active ? '#059669' : '#DC2626'}
                          />
                        </TouchableOpacity>
                      </View>

                      {/* Body Preview */}
                      <Text
                        style={[
                          styles.adBody,
                          { color: colors.text, fontFamily: typography.fontFamily.regular },
                        ]}
                        numberOfLines={2}
                      >
                        {ad.body}
                      </Text>

                      {/* Footer */}
                      <View style={styles.cardFooter}>
                        <TouchableOpacity
                          style={[styles.iconButton, { backgroundColor: colors.primaryLight }]}
                          onPress={() => handleEditAd(ad)}
                        >
                          <Ionicons name="pencil" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.iconButton, { backgroundColor: '#FFE8E8' }]}
                          onPress={() => handleDeleteAd(ad)}
                        >
                          <Ionicons name="trash" size={16} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </Card>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Form Modal ── */}
      <Modal visible={formModalVisible} animationType="slide" onRequestClose={() => setFormModalVisible(false)}>
        <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setFormModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {formMode === 'create' ? 'Create Ad' : 'Edit Ad'}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            style={{ flex: 1 }}
          >
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              contentContainerStyle={{ paddingBottom: 40 }}
              automaticallyAdjustKeyboardInsets={true}
              keyboardShouldPersistTaps="handled"
            >
            <View style={styles.formSection}>
              {/* Image Upload */}
              <Text style={[styles.formLabel, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                Image
              </Text>
              <TouchableOpacity
                style={[
                  styles.imageUploadBox,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                onPress={handlePickImage}
              >
                {formImagePreview ? (
                  <Image source={{ uri: formImagePreview }} style={styles.imagePreview} />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="cloud-upload-outline" size={32} color={colors.textMuted} />
                    <Text style={[{ color: colors.textMuted, fontFamily: typography.fontFamily.medium, marginTop: 8 }]}>
                      Tap to upload image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Title */}
              <Text style={[styles.formLabel, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                Title
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
                placeholder="Enter ad title"
                placeholderTextColor={colors.textMuted}
                value={formTitle}
                onChangeText={setFormTitle}
              />

              {/* Body */}
              <Text style={[styles.formLabel, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                Description
              </Text>
              <TextInput
                style={[
                  styles.formTextArea,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
                placeholder="Enter ad description"
                placeholderTextColor={colors.textMuted}
                value={formBody}
                onChangeText={setFormBody}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Category */}
              <Text style={[styles.formLabel, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {AD_CATEGORIES.filter((c) => c !== 'All').map((category) => {
                  const isSelected = formCategory === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryChip,
                        {
                          borderColor: isSelected ? colors.primary : colors.border,
                          backgroundColor: isSelected ? colors.primaryLight : colors.surface,
                        },
                      ]}
                      onPress={() => setFormCategory(category)}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          {
                            color: isSelected ? colors.primary : colors.text,
                            fontFamily: isSelected ? typography.fontFamily.bold : typography.fontFamily.medium,
                          },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* CTA Text & URL */}
              <Text style={[styles.formLabel, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                Call to Action Text
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
                placeholder="e.g., Learn More, Register Now"
                placeholderTextColor={colors.textMuted}
                value={formCtaText}
                onChangeText={setFormCtaText}
              />

              <Text style={[styles.formLabel, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                CTA Link (optional)
              </Text>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
                placeholder="https://example.com"
                placeholderTextColor={colors.textMuted}
                value={formCtaUrl}
                onChangeText={setFormCtaUrl}
              />

              {/* Active Toggle */}
              <TouchableOpacity
                style={[
                  styles.activeToggle,
                  {
                    backgroundColor: formIsActive ? colors.primaryLight : colors.surface,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setFormIsActive(!formIsActive)}
              >
                <Ionicons
                  name={formIsActive ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={20}
                  color={formIsActive ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.activeToggleText,
                    {
                      color: formIsActive ? colors.primary : colors.text,
                      fontFamily: typography.fontFamily.medium,
                    },
                  ]}
                >
                  Active
                </Text>
              </TouchableOpacity>

              {/* Buttons */}
              <View style={styles.formButtons}>
                <Button
                  label="Cancel"
                  onPress={() => setFormModalVisible(false)}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
                <Button
                  label={formSubmitting ? 'Saving...' : 'Save'}
                  onPress={handleSubmitForm}
                  variant="primary"
                  style={{ flex: 1 }}
                  disabled={formSubmitting}
                />
              </View>
            </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </ScreenWrapper>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  filterSection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  filterTitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  createButtonSection: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  listSection: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  adCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  adImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  adTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 16,
  },
  formSection: {
    paddingHorizontal: 20,
  },
  formLabel: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  imageUploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    alignItems: 'center',
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  formTextArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    gap: 10,
  },
  activeToggleText: {
    fontSize: 14,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
});
