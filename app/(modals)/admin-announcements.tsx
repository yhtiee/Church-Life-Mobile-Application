import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, TextInput, Dimensions,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AdminSearchBar } from '@/components/admin/AdminSearchBar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAnnouncementsByParishQuery } from '@/hooks/queries/useAnnouncements';
import { AnnoucementService } from '@/lib/supabase/services/announcements';
import { Announcement } from '@/constants/mockData';
import { useAuth } from '@/context/AuthContext';

const CATEGORY_COLORS: Record<string, string> = {
  Liturgy: '#2A6FDB',
  Events: 'white',
  Finance: '#D97706',
  Groups: '#059669',
  Education: '#DC2626',
};

const CATEGORIES = ['All', 'Liturgy', 'Events', 'Finance', 'Groups', 'Education'];

type FormMode = 'create' | 'edit';

export default function AdminAnnouncementsModal() {
  const { colors, typography, radius, isDark } = useTheme();
  const { showAlert } = useAlert();
  const { user } = useAuth();
  const { data: announcements = [], isLoading, refetch } = useAnnouncementsByParishQuery(user?.parishId as string);

  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form fields
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formCategory, setFormCategory] = useState('Events');
  const [formImportant, setFormImportant] = useState(false);

  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.body.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === 'All' || a.category === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [announcements, search, activeFilter]);

  // Handle opening create form
  const handleCreateAnnouncement = () => {
    setFormMode('create');
    setFormTitle('');
    setFormBody('');
    setFormCategory('Events');
    setFormImportant(false);
    setSelectedAnnouncement(null);
    setFormModalVisible(true);
  };

  // Handle opening edit form
  const handleEditAnnouncement = (announcement: Announcement) => {
    setFormMode('edit');
    setFormTitle(announcement.title);
    setFormBody(announcement.body);
    setFormCategory(announcement.category);
    setFormImportant(announcement.important);
    setSelectedAnnouncement(announcement);
    setFormModalVisible(true);
  };

  // Handle form submission
  const handleSubmitForm = async () => {
    if (!formTitle.trim()) {
      showAlert({ title: 'Error', message: 'Please enter a title', type: 'error' });
      return;
    }
    if (!formBody.trim()) {
      showAlert({ title: 'Error', message: 'Please enter announcement content', type: 'error' });
      return;
    }

    setFormSubmitting(true);
    try {
      const announcementService = new AnnoucementService();

      if (formMode === 'create') {
        const { data, error } = await announcementService.createAnnouncement({
          title: formTitle,
          body: formBody,
          category: formCategory,
          important: formImportant,
          author: user?.fullName ?? "admin"
        });

        if (error) {
          showAlert({ title: 'Failed', message: 'Failed to create announcement. Please try again.', type: 'error' });
          return;
        }

        showAlert({ title: 'Success', message: 'Announcement created successfully!', type: 'success' });
      } else if (formMode === 'edit' && selectedAnnouncement) {
        const { error } = await announcementService.updateAnnouncement(selectedAnnouncement.id, {
          title: formTitle,
          body: formBody,
          category: formCategory,
          important: formImportant,
        });

        if (error) {
          showAlert({ title: 'Failed', message: 'Failed to update announcement. Please try again.', type: 'error' });
          return;
        }

        showAlert({ title: 'Success', message: 'Announcement updated successfully!', type: 'success' });
      }

      setFormModalVisible(false);
      refetch();
    } catch (err) {
      showAlert({ title: 'Error', message: 'An unexpected error occurred. Please try again.', type: 'error' });
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteAnnouncement = (announcement: Announcement) => {
    Alert.alert(
      'Delete Announcement',
      `Are you sure you want to delete "${announcement.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const announcementService = new AnnoucementService();
              const { error } = await announcementService.deleteAnnouncement(announcement.id);

              if (error) {
                showAlert({ title: 'Failed', message: 'Failed to delete announcement. Please try again.', type: 'error' });
                return;
              }

              showAlert({ title: 'Success', message: 'Announcement deleted successfully!', type: 'success' });
              refetch();
            } catch (err) {
              showAlert({ title: 'Error', message: 'An unexpected error occurred. Please try again.', type: 'error' });
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Manage Announcements" />
      <GlobalLoader visible={isLoading} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ── Search Bar ── */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)}>
          <AdminSearchBar
            value={search}
            onChangeText={setSearch}
            placeholder="Search announcements..."
            onFilterPress={handleCreateAnnouncement}
          />
        </Animated.View>

        {/* ── Category Filter ── */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
            Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterScroll}
          >
            {CATEGORIES.map((category) => {
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
          <Button
            label="+ Create Announcement"
            onPress={handleCreateAnnouncement}
            variant="primary"
            style={{ width: '100%' }}
          />
        </Animated.View>

        {/* ── Announcements List ── */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.listSection}>
          {filteredAnnouncements.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="megaphone-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                {search || activeFilter !== 'All' ? 'No announcements match your search' : 'No announcements yet'}
              </Text>
            </View>
          ) : (
            <View>
              {filteredAnnouncements.map((announcement, index) => (
                <Animated.View
                  key={announcement.id}
                  entering={FadeInDown.delay(280 + index * 50).duration(450)}
                >
                  <Card
                    elevation="sm"
                    style={[styles.announcementCard, { borderColor: colors.border }]}
                  >
                    {/* Category Accent Bar */}
                    <View
                      style={[
                        styles.categoryAccent,
                        { backgroundColor: CATEGORY_COLORS[announcement.category] },
                      ]}
                    />

                    <View style={styles.cardContent}>
                      {/* Header with Title & Important Badge */}
                      <View style={styles.cardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.announcementTitle,
                              { color: colors.text, fontFamily: typography.fontFamily.bold },
                            ]}
                            numberOfLines={2}
                          >
                            {announcement.title}
                          </Text>
                          {/* Date with Icon */}
                          <View style={styles.dateContainer}>
                            <Ionicons name="calendar-outline" size={12} color={colors.accent} />
                            <Text
                              style={[
                                styles.announcementDate,
                                { color: colors.textMuted, fontFamily: typography.fontFamily.regular },
                              ]}
                            >
                              {new Date(announcement.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </Text>
                          </View>
                        </View>
                        {announcement.important && (
                          <View style={[styles.importantBadge, { backgroundColor: '#FEE2E2' }]}>
                            <Ionicons name="star-sharp" size={12} color="#DC2626" />
                          </View>
                        )}
                      </View>

                      {/* Category Badge */}
                      <View style={styles.categoryBadgeContainer}>
                        <Badge
                          label={announcement.category}
                          variant="primary"
                          style={{
                            backgroundColor: CATEGORY_COLORS[announcement.category],
                          }}
                        />
                      </View>

                      {/* Body Preview */}
                      <Text
                        style={[
                          styles.announcementBody,
                          { color: colors.text, fontFamily: typography.fontFamily.regular },
                        ]}
                        numberOfLines={2}
                      >
                        {announcement.body}
                      </Text>

                      {/* Footer Actions */}
                      <View style={styles.cardFooter}>
                        <TouchableOpacity
                          style={[styles.iconButton, { backgroundColor: colors.primaryLight }]}
                          onPress={() => handleEditAnnouncement(announcement)}
                        >
                          <Ionicons name="pencil" size={16} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.iconButton, { backgroundColor: '#FFE8E8' }]}
                          onPress={() => handleDeleteAnnouncement(announcement)}
                        >
                          <Ionicons name="trash" size={16} color="#DC2626" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.viewMoreButton, { borderColor: colors.primary }]}
                          onPress={() => handleEditAnnouncement(announcement)}
                        >
                          <Text
                            style={[
                              styles.viewMoreText,
                              { color: colors.primary, fontFamily: typography.fontFamily.medium },
                            ]}
                          >
                            View More
                          </Text>
                          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
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
            <Text
              style={[
                styles.modalTitle,
                { color: colors.text, fontFamily: typography.fontFamily.bold },
              ]}
            >
              {formMode === 'create' ? 'Create Announcement' : 'Edit Announcement'}
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
            {/* ── Form Fields ── */}
            <View style={styles.formSection}>
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
                placeholder="Enter title"
                placeholderTextColor={colors.textMuted}
                value={formTitle}
                onChangeText={setFormTitle}
              />

              <Text style={[styles.formLabel, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                Content
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
                placeholder="Enter announcement content"
                placeholderTextColor={colors.textMuted}
                value={formBody}
                onChangeText={setFormBody}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />

              <Text style={[styles.formLabel, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                Category
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                {CATEGORIES.filter((c) => c !== 'All').map((category) => {
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

              <TouchableOpacity
                style={[
                  styles.importantToggle,
                  { backgroundColor: formImportant ? colors.primaryLight : colors.surface, borderColor: colors.border },
                ]}
                onPress={() => setFormImportant(!formImportant)}
              >
                <Ionicons
                  name={formImportant ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={20}
                  color={formImportant ? colors.primary : colors.textMuted}
                />
                <Text
                  style={[
                    styles.importantToggleText,
                    {
                      color: formImportant ? colors.primary : colors.text,
                      fontFamily: typography.fontFamily.medium,
                    },
                  ]}
                >
                  Mark as Important
                </Text>
              </TouchableOpacity>

              {/* ── Submit & Cancel Buttons ── */}
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
  announcementCard: {
    marginBottom: 12,
    padding: 0,
    overflow: 'hidden',
  },
  categoryAccent: {
    height: 4,
    width: '100%',
  },
  cardContent: {
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 12,
  },
  announcementTitle: {
    fontSize: 15,
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  announcementDate: {
    fontSize: 11,
  },
  importantBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeContainer: {
    marginBottom: 10,
  },
  announcementBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtons: {
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
  viewMoreButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  viewMoreText: {
    fontSize: 12,
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
  importantToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    gap: 10,
  },
  importantToggleText: {
    fontSize: 14,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
});
