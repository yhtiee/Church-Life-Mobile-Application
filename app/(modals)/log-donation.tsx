import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/FeedbackContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { useProfilesByParishQuery } from '@/hooks/queries/useProfiles';
import { useCreateDonationMutation, useCreatePledgeMutation } from '@/hooks/queries/useFinance';
import { Donation, Pledge } from '@/constants/mockData';

type FinanceType = 'donation' | 'pledge';

const DONATION_CATEGORIES = ['Tithe', 'Offering', 'Building Fund', 'Charity', 'Other'];
const PLEDGE_CATEGORIES = ['Building Fund', 'Event', 'Ministry', 'Other'];

export default function LogDonationModal() {
  const { colors, typography, radius } = useTheme();
  const { showAlert } = useAlert();
  const { user } = useAuth();

  const [financeType, setFinanceType] = useState<FinanceType>('donation');
  const [search, setSearch] = useState('');
  const [selectedParishionerId, setSelectedParishionerId] = useState<string | null>(null);
  const [showParishionerDropdown, setShowParishionerDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields for donation
  const [donationAmount, setDonationAmount] = useState('');
  const [donationCategory, setDonationCategory] = useState('Tithe');
  const [donationNotes, setDonationNotes] = useState('');

  // Form fields for pledge
  const [pledgeTitle, setPledgeTitle] = useState('');
  const [pledgeTargetAmount, setPledgeTargetAmount] = useState('');
  const [pledgeDueDate, setPledgeDueDate] = useState('');
  const [pledgeDueDateObj, setPledgeDueDateObj] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pledgeCategory, setPledgeCategory] = useState('Building Fund');
  const [pledgeNotes, setPledgeNotes] = useState('');

  // Fetch parishioners from admin's parish
  const { data: parishioners = [], isLoading: parishionersLoading } = useProfilesByParishQuery(user?.parishId as string);

  // Filter parishioners based on search
  const filteredParishioners = useMemo(() => {
    if (!search) return parishioners;
    return parishioners.filter((p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      (p.email?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
  }, [parishioners, search]);

  const selectedParishioner = parishioners.find((p) => p.id === selectedParishionerId);

  // Mutations
  const createDonationMutation = useCreateDonationMutation();
  const createPledgeMutation = useCreatePledgeMutation();

  // Handle date change from picker
  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setPledgeDueDateObj(selectedDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setPledgeDueDate(formattedDate);
    }
  };

  // Reset form
  const resetForm = () => {
    setDonationAmount('');
    setDonationCategory('Tithe');
    setDonationNotes('');
    setPledgeTitle('');
    setPledgeTargetAmount('');
    setPledgeDueDate('');
    setPledgeDueDateObj(new Date());
    setPledgeCategory('Building Fund');
    setPledgeNotes('');
    setSelectedParishionerId(null);
    setSearch('');
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!selectedParishionerId) {
      showAlert({ title: 'Error', message: 'Please select a parishioner', type: 'error' });
      return false;
    }

    if (financeType === 'donation') {
      if (!donationAmount.trim()) {
        showAlert({ title: 'Error', message: 'Please enter an amount', type: 'error' });
        return false;
      }
      if (isNaN(Number(donationAmount)) || Number(donationAmount) <= 0) {
        showAlert({ title: 'Error', message: 'Please enter a valid amount', type: 'error' });
        return false;
      }
    } else {
      if (!pledgeTitle.trim()) {
        showAlert({ title: 'Error', message: 'Please enter a pledge title', type: 'error' });
        return false;
      }
      if (!pledgeTargetAmount.trim()) {
        showAlert({ title: 'Error', message: 'Please enter a target amount', type: 'error' });
        return false;
      }
      if (isNaN(Number(pledgeTargetAmount)) || Number(pledgeTargetAmount) <= 0) {
        showAlert({ title: 'Error', message: 'Please enter a valid amount', type: 'error' });
        return false;
      }
      if (!pledgeDueDate.trim()) {
        showAlert({ title: 'Error', message: 'Please enter a due date', type: 'error' });
        return false;
      }
    }
    return true;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateForm() || !selectedParishionerId) return;

    setIsSubmitting(true);
    try {
      if (financeType === 'donation') {
        const donationData: Omit<Donation, 'id' | 'date'> = {
          amount: Number(donationAmount),
          category: donationCategory,
          currency: "NGN",
          description: donationNotes
        };
        await createDonationMutation.mutateAsync({
          userId: selectedParishionerId,
          donation: donationData,
        });
        showAlert({
          title: 'Success',
          message: `Donation of ₦${Number(donationAmount).toLocaleString()} logged successfully!`,
          type: 'success',
        });
      } else {
        const pledgeData: Omit<Pledge, 'id' | 'isPaid' | 'paidDate' | 'paidAmount'> = {
          title: pledgeTitle,
          targetAmount: Number(pledgeTargetAmount),
          dueDate: pledgeDueDate,
          currency: "NGN"
          // category: pledgeCategory,
          // notes: pledgeNotes,
        };
        await createPledgeMutation.mutateAsync({
          userId: selectedParishionerId,
          pledge: pledgeData,
        });
        showAlert({
          title: 'Success',
          message: `Pledge of ₦${Number(pledgeTargetAmount).toLocaleString()} created successfully!`,
          type: 'success',
        });
      }
      resetForm();
    } catch (err: any) {
      showAlert({
        title: 'Failed',
        message: err?.message || 'An error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Log Donation/Pledge" />
      <GlobalLoader visible={isSubmitting || parishionersLoading} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* ── Type Selector ── */}
        <Animated.View entering={FadeInDown.delay(60).duration(400)} style={styles.section}>
          <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Record Type
          </Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor: financeType === 'donation' ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setFinanceType('donation')}
            >
              <Ionicons
                name="gift"
                size={18}
                color={financeType === 'donation' ? '#fff' : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color: financeType === 'donation' ? '#fff' : colors.text,
                    fontFamily: typography.fontFamily.bold,
                  },
                ]}
              >
                Donation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                {
                  backgroundColor: financeType === 'pledge' ? colors.primary : colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setFinanceType('pledge')}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={financeType === 'pledge' ? '#fff' : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  {
                    color: financeType === 'pledge' ? '#fff' : colors.text,
                    fontFamily: typography.fontFamily.bold,
                  },
                ]}
              >
                Pledge
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* ── Parishioner Dropdown ── */}
        <Animated.View entering={FadeInDown.delay(120).duration(400)} style={styles.section}>
          <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Parishioner
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
            onPress={() => setShowParishionerDropdown(!showParishionerDropdown)}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.dropdownButtonText,
                  {
                    color: selectedParishioner ? colors.text : colors.textMuted,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                {selectedParishioner ? selectedParishioner.fullName : 'Select a parishioner...'}
              </Text>
            </View>
            <Ionicons
              name={showParishionerDropdown ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.textMuted}
            />
          </TouchableOpacity>

          {/* Dropdown Menu */}
          {showParishionerDropdown && (
            <Card elevation="sm" style={[styles.dropdownMenu, { borderColor: colors.border }]}>
              <TextInput
                style={[
                  styles.searchInput,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
                placeholder="Search parishioners..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              <FlatList
                data={filteredParishioners}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      {
                        backgroundColor: selectedParishionerId === item.id ? colors.primaryLight : 'transparent',
                      },
                    ]}
                    onPress={() => {
                      setSelectedParishionerId(item.id);
                      setShowParishionerDropdown(false);
                      setSearch('');
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        {
                          color: colors.text,
                          fontFamily: typography.fontFamily.medium,
                        },
                      ]}
                    >
                      {item.fullName}
                    </Text>
                    <Text
                      style={[
                        styles.dropdownItemSubtext,
                        {
                          color: colors.textMuted,
                          fontFamily: typography.fontFamily.regular,
                        },
                      ]}
                    >
                      {item.email}
                    </Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyDropdown}>
                    <Text style={[{ color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                      No parishioners found
                    </Text>
                  </View>
                }
              />
            </Card>
          )}
        </Animated.View>

        {/* ── Donation Form ── */}
        {financeType === 'donation' && (
          <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Donation Details
            </Text>

            <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Amount
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
              placeholder="Enter amount"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={donationAmount}
              onChangeText={setDonationAmount}
            />

            {/* <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {DONATION_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: donationCategory === cat ? colors.primary : colors.surface,
                      borderColor: donationCategory === cat ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setDonationCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: donationCategory === cat ? '#fff' : colors.text,
                        fontFamily: typography.fontFamily.bold,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView> */}

            <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Notes (optional)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
              placeholder="Add any notes..."
              placeholderTextColor={colors.textMuted}
              value={donationNotes}
              onChangeText={setDonationNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Animated.View>
        )}

        {/* ── Pledge Form ── */}
        {financeType === 'pledge' && (
          <Animated.View entering={FadeInDown.delay(180).duration(400)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Pledge Details
            </Text>

            <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Title
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
              placeholder="e.g., Building Renovation"
              placeholderTextColor={colors.textMuted}
              value={pledgeTitle}
              onChangeText={setPledgeTitle}
            />

            <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Target Amount
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
              placeholder="Enter target amount"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
              value={pledgeTargetAmount}
              onChangeText={setPledgeTargetAmount}
            />

            <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Due Date
            </Text>
            <TouchableOpacity
              style={[
                styles.datePickerButton,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.datePickerButtonText,
                    {
                      color: pledgeDueDate ? colors.text : colors.textMuted,
                      fontFamily: typography.fontFamily.regular,
                    },
                  ]}
                >
                  {pledgeDueDate || 'Select a date...'}
                </Text>
              </View>
              <Ionicons name="calendar" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={pledgeDueDateObj}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                textColor={colors.text}
                themeVariant={colors.background === '#000' ? 'dark' : 'light'}
              />
            )}

            {Platform.OS === 'ios' && showDatePicker && (
              <View style={{ marginBottom: 16, gap: 8, flexDirection: 'row' }}>
                <TouchableOpacity
                  style={[
                    styles.datePickerAction,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={[{ color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {PLEDGE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: pledgeCategory === cat ? colors.primary : colors.surface,
                      borderColor: pledgeCategory === cat ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setPledgeCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      {
                        color: pledgeCategory === cat ? '#fff' : colors.text,
                        fontFamily: typography.fontFamily.bold,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView> */}

            <Text style={[styles.label, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Notes (optional)
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
              placeholder="Add any notes..."
              placeholderTextColor={colors.textMuted}
              value={pledgeNotes}
              onChangeText={setPledgeNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </Animated.View>
        )}

        {/* ── Submit Button ── */}
        <Animated.View entering={FadeInDown.delay(240).duration(400)} style={styles.section}>
          <Button
            label={isSubmitting ? 'Saving...' : 'Log ' + (financeType === 'donation' ? 'Donation' : 'Pledge')}
            onPress={handleSubmit}
            variant="primary"
            disabled={isSubmitting}
            style={{ width: '100%' }}
          />
        </Animated.View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 14,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
  },
  dropdownMenu: {
    marginTop: 8,
    borderWidth: 1,
    maxHeight: 300,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 14,
  },
  dropdownItemSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyDropdown: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    gap: 8,
  },
  datePickerButtonText: {
    fontSize: 14,
  },
  datePickerAction: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
