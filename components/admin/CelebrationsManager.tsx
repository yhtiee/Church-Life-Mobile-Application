import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dropdown } from '@/components/ui/Dropdown';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { useAllCelebrationsQuery } from '@/hooks/queries/useSupport';
import { useCelebrationMutations } from '@/hooks/mutations/useSupport';
import { useProfilesByParishQuery } from '@/hooks/queries/useProfiles';
import { AdsService } from '@/lib/supabase/services/ads';
import {
  CELEBRATION_KIND_LABELS,
  type CelebrationKind,
  type DatabaseCelebration,
} from '@/lib/supabase/entities/types';

const KIND_OPTIONS = (Object.keys(CELEBRATION_KIND_LABELS) as CelebrationKind[]).map((k) => ({
  label: CELEBRATION_KIND_LABELS[k],
  value: k,
}));

interface Draft {
  id?: string;
  memberId: string | null;
  celebrantName: string;
  kind: CelebrationKind;
  title: string;
  body: string;
  endsOn: string;
  isActive: boolean;
  imageUrl?: string | null;
}

const EMPTY: Draft = {
  memberId: null,
  celebrantName: '',
  kind: 'birthday',
  title: '',
  body: '',
  endsOn: '',
  isActive: true,
  imageUrl: null,
};

/**
 * Celebration posts, managed beside ads because both are slides on the same
 * home carousel and a parish admin thinks of them together.
 */
export function CelebrationsManager() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const parishId = user?.parishId ?? undefined;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formImage, setFormImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string>('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const { data: celebrations = [], isLoading } = useAllCelebrationsQuery(parishId);
  const { data: members = [] } = useProfilesByParishQuery(parishId);
  const { save, remove } = useCelebrationMutations(parishId);
  const busy = save.isPending || remove.isPending || isUploadingImage;

  const memberOptions = useMemo(
    () => members.map((m) => ({ label: m.fullName, value: m.id })),
    [members]
  );

  const openNew = () => {
    setFormImage(null);
    setFormImagePreview('');
    setDraft({ ...EMPTY });
  };

  const openEdit = (c: DatabaseCelebration) => {
    setFormImage(null);
    setFormImagePreview(c.image_url ?? '');
    setDraft({
        id: c.id,
        memberId: c.member_id ?? null,
        celebrantName: c.celebrant_name,
        kind: c.kind,
        title: c.title,
        body: c.body ?? '',
        endsOn: c.ends_on ?? '',
        isActive: c.is_active,
      imageUrl: c.image_url ?? null,
    });
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || `celebration-${Date.now()}.jpg`;
        const fileType = asset.mimeType || 'image/jpeg';
        setFormImage({ uri: asset.uri, name: fileName, type: fileType });
        setFormImagePreview(asset.uri);
      }
    } catch (err) {
      console.error('Error picking image for celebration:', err);
      showAlert({ title: 'Error', message: 'Failed to pick image', type: 'error' });
    }
  };

  const pickMember = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    setDraft((d) =>
      d
        ? {
            ...d,
            memberId,
            // Keep the name in step with the pick, but leave it editable so a
            // parish can post for someone with no account.
            celebrantName: member?.fullName ?? d.celebrantName,
            title: d.title || `${CELEBRATION_KIND_LABELS[d.kind]} — ${member?.fullName ?? ''}`.trim(),
          }
        : d
    );
  };

  const handleSave = async () => {
    if (!draft || !parishId) return;

    if (!draft.celebrantName.trim()) {
      showAlert({
        title: 'Who is it for?',
        message: 'Choose a member or type the name of the person being celebrated.',
        type: 'error',
      });
      return;
    }
    if (!draft.title.trim()) {
      showAlert({ title: 'Title required', message: 'Add a title for the slide.', type: 'error' });
      return;
    }

    try {
      let finalImageUrl = draft.imageUrl ?? null;
      if (formImage) {
        setIsUploadingImage(true);
        // Stored in the same media bucket as ad images.
        const { url, error: uploadErr } = await new AdsService().uploadAdImage(formImage, draft.id);
        if (uploadErr) {
          showAlert({
            title: 'Upload failed',
            message: 'The celebration photo could not be uploaded. Please try again.',
            type: 'error',
          });
          return;
        }
        finalImageUrl = url;
      }

      await save.mutateAsync({
        ...(draft.id ? { id: draft.id } : {}),
        parish_id: parishId,
        member_id: draft.memberId,
        celebrant_name: draft.celebrantName.trim(),
        kind: draft.kind,
        title: draft.title.trim(),
        body: draft.body.trim() || null,
        ends_on: draft.endsOn.trim() || null,
        is_active: draft.isActive,
        created_by: user?.id,
        image_url: finalImageUrl,
      });
      setDraft(null);
      setFormImage(null);
      setFormImagePreview('');
    } catch (err: any) {
      showAlert({
        title: 'Could not save',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    } finally {
      // Also runs after the early return above, so the form never stays stuck busy.
      setIsUploadingImage(false);
    }
  };

  const confirmDelete = (c: DatabaseCelebration) => {
    showAlert({
      title: `Remove ${c.celebrant_name}'s celebration?`,
      message: 'It disappears from the slides. Support already recorded is kept.',
      type: 'error',
      buttonLabel: 'Remove',
      onPress: async () => {
        try {
          await remove.mutateAsync(c.id);
        } catch (err: any) {
          showAlert({
            title: 'Could not remove',
            message: err?.message || 'Please try again.',
            type: 'error',
          });
        }
      },
      secondaryButtonLabel: 'Cancel',
    });
  };

  return (
    <View style={styles.scroll}>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            fontFamily: typography.fontFamily.regular,
            lineHeight: 20,
            marginBottom: 16,
          }}
        >
          Posted celebrations appear on the home slides, where members can send their support and a
          prayer.
        </Text>

        {celebrations.map((c, index) => (
          <Animated.View key={c.id} entering={FadeInDown.delay(index * 50).duration(350)}>
            <Card
              elevation="sm"
              // Card pads its content itself; zero lets the photo reach the edges.
              padding={0}
              style={[styles.celebrationCard, { borderRadius: radius.lg }]}
            >
              {c.image_url ? (
                <Image source={{ uri: c.image_url }} style={styles.celebrationImagePreview} contentFit="cover" />
              ) : null}
              <View style={styles.cardInnerPadding}>
                <View style={styles.rowTop}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.labelRow}>
                      <Badge label={CELEBRATION_KIND_LABELS[c.kind]} variant="primary" size="sm" />
                      {!c.is_active && <Badge label="Hidden" variant="warning" size="sm" />}
                    </View>
                    <Text
                      style={{
                        fontSize: 15,
                        color: colors.text,
                        fontFamily: typography.fontFamily.bold,
                        marginTop: 8,
                      }}
                    >
                      {c.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        fontFamily: typography.fontFamily.regular,
                        marginTop: 2,
                      }}
                    >
                      For {c.celebrant_name}
                    </Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openEdit(c)} disabled={busy} hitSlop={8}>
                      <Ionicons name="create-outline" size={20} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(c)} disabled={busy} hitSlop={8}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}

        {celebrations.length === 0 && !isLoading && (
          <Text
            style={{
              fontSize: 14,
              color: colors.textMuted,
              fontFamily: typography.fontFamily.regular,
              textAlign: 'center',
              marginTop: 30,
            }}
          >
            Nothing posted yet.
          </Text>
        )}

        <Button
          label="Post a celebration"
          onPress={openNew}
          variant="secondary"
          fullWidth
          style={{ marginTop: 18 }}
        />
      <Modal
        visible={!!draft}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => !busy && setDraft(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.backdrop}
        >
          <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
            <View
              style={[
                styles.sheet,
                { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
              ]}
            >
              <Text
                style={{
                  fontSize: 17,
                  color: colors.text,
                  fontFamily: typography.fontFamily.bold,
                  marginBottom: 16,
                }}
              >
                {draft?.id ? 'Edit celebration' : 'New celebration'}
              </Text>

              <View style={styles.photoField}>
                <Label label="Photo" helperText="Optional banner photo for the slide" />
                <TouchableOpacity
                  style={[
                    styles.imageUploadBox,
                    { borderColor: colors.border, backgroundColor: colors.surfaceMuted, borderRadius: radius.md },
                  ]}
                  onPress={handlePickImage}
                  disabled={busy}
                >
                  {formImagePreview ? (
                    <View style={styles.imagePreviewWrap}>
                      <Image
                        source={{ uri: formImagePreview }}
                        style={[styles.imagePreview, { borderRadius: radius.md }]}
                        contentFit="cover"
                      />
                      <TouchableOpacity
                        onPress={() => {
                          setFormImage(null);
                          setFormImagePreview('');
                          setDraft((d) => (d ? { ...d, imageUrl: null } : d));
                        }}
                        style={styles.removeImageBtn}
                        disabled={busy}
                        accessibilityLabel="Remove photo"
                      >
                        <Ionicons name="trash" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Ionicons name="cloud-upload-outline" size={32} color={colors.primary} />
                      <Text
                        style={{
                          color: colors.textMuted,
                          fontFamily: typography.fontFamily.medium,
                          marginTop: 8,
                          fontSize: 13,
                        }}
                      >
                        Tap to upload a photo
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              <Dropdown
                label="Occasion"
                options={KIND_OPTIONS}
                value={draft?.kind ?? null}
                onChange={(v) => setDraft((d) => (d ? { ...d, kind: v as CelebrationKind } : d))}
              />

              <View style={styles.field}>
                <Dropdown
                  label="Member"
                  placeholder="Choose a parishioner"
                  options={memberOptions}
                  value={draft?.memberId ?? null}
                  onChange={pickMember}
                  searchable
                />
              </View>

              <View style={styles.field}>
                <Label label="Name shown" helperText="Edit if the person has no account" />
                <Input
                  placeholder="Mary Okafor"
                  value={draft?.celebrantName ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, celebrantName: v } : d))}
                />
              </View>

              <View style={styles.field}>
                <Label label="Title" />
                <Input
                  placeholder="Birthday — Mary Okafor"
                  value={draft?.title ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, title: v } : d))}
                />
              </View>

              <View style={styles.field}>
                <Label label="Message" helperText="Optional" />
                <Input
                  placeholder="Join us in celebrating and supporting her"
                  value={draft?.body ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, body: v } : d))}
                  multiline
                  numberOfLines={3}
                  style={{ height: 80, textAlignVertical: 'top' }}
                />
              </View>

              <View style={styles.field}>
                <Label label="Show until" helperText="Optional, as YYYY-MM-DD" />
                <Input
                  placeholder="2026-09-30"
                  value={draft?.endsOn ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, endsOn: v } : d))}
                />
              </View>

              <TouchableOpacity
                onPress={() => setDraft((d) => (d ? { ...d, isActive: !d.isActive } : d))}
                style={styles.toggleRow}
              >
                <Ionicons
                  name={draft?.isActive ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={colors.primary}
                />
                <Text
                  style={{
                    fontSize: 14,
                    marginLeft: 10,
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                  }}
                >
                  Show on the home slides
                </Text>
              </TouchableOpacity>

              <View style={styles.sheetActions}>
                <Button
                  label="Cancel"
                  onPress={() => setDraft(null)}
                  variant="secondary"
                  disabled={busy}
                  style={{ flex: 1 }}
                />
                <Button
                  label={isUploadingImage ? 'Uploading...' : 'Save'}
                  onPress={handleSave}
                  loading={busy}
                  disabled={busy}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <GlobalLoader visible={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 60 },
  celebrationCard: { marginBottom: 12, overflow: 'hidden' },
  celebrationImagePreview: { width: '100%', height: 140 },
  cardInnerPadding: { padding: 16 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  actions: { flexDirection: 'row', gap: 16, paddingTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { padding: 22, paddingBottom: 36 },
  field: { marginTop: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 22 },
  photoField: { marginBottom: 16 },
  imageUploadBox: {
    width: '100%',
    height: 160,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 6,
  },
  imagePreviewWrap: { width: '100%', height: 160 },
  imagePreview: { width: '100%', height: 160 },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
