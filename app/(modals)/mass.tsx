import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useMassBookingsQuery } from '@/hooks/queries/useMass';
import { useCreateMassBookingMutation, useDeleteMassBookingMutation } from '@/hooks/mutations/useMass';
import { MASS_TIMES } from '@/constants/mockData';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { ActivityService } from '@/lib/supabase/services/activity';

interface MassBooking {
  id: string;
  bookerName: string;
  day: string;
  time: string;
  date: string;
  formattedDate: string;
  intentionType: string;
  intentionDetails: string;
  offertoryAmount: string;
  parishName: string;
  createdAt: string;
  refId: string;
}

const BOOKINGS_KEY = '@churchlife_mass_bookings';

// Helper to generate the next 4 upcoming occurrences of a weekday
function getUpcomingDates(dayName: string): { label: string; value: string }[] {
  const dates: { label: string; value: string }[] = [];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetDayIndex = daysOfWeek.findIndex((d) => d.toLowerCase() === dayName.toLowerCase());

  const current = new Date();
  
  if (targetDayIndex === -1) {
    // Handling Weekdays (representing Mon - Fri)
    let tempDate = new Date();
    while (dates.length < 4) {
      tempDate.setDate(tempDate.getDate() + 1);
      const day = tempDate.getDay();
      if (day >= 1 && day <= 5) {
        const label = tempDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        const value = tempDate.toISOString().split('T')[0];
        dates.push({ label, value });
      }
    }
    return dates;
  }

  // Find next occurrence of the specific weekday
  let diff = targetDayIndex - current.getDay();
  if (diff <= 0) {
    diff += 7; // Next week's occurrence
  }
  
  let tempDate = new Date();
  tempDate.setDate(current.getDate() + diff);

  for (let i = 0; i < 4; i++) {
    const label = tempDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    const value = tempDate.toISOString().split('T')[0];
    dates.push({ label, value });
    tempDate.setDate(tempDate.getDate() + 7); // Increment by one week
  }

  return dates;
}

export default function MassScheduleScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  // Booking Form State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Sunday');
  const [selectedTime, setSelectedTime] = useState('8:30 AM');
  const [bookerName, setBookerName] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [intentionType, setIntentionType] = useState('Thanksgiving');
  const [intentionDetails, setIntentionDetails] = useState('');
  const [offertoryAmount, setOffertoryAmount] = useState('');
  const [upcomingDates, setUpcomingDates] = useState<{ label: string; value: string }[]>([]);

  // Receipt Slip Modal State
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [currentBookingReceipt, setCurrentBookingReceipt] = useState<MassBooking | null>(null);

  const { data: bookings = [], isLoading: loadingBookings, refetch } = useMassBookingsQuery(user?.id || '');
  const { mutateAsync: createMassBooking, isPending: submittingBooking } = useCreateMassBookingMutation(user?.id || '');
  const { mutateAsync: deleteMassBooking } = useDeleteMassBookingMutation(user?.id || '');

  // Synchronize unsynced offline bookings
  useEffect(() => {
    const syncBookings = async () => {
      if (!user?.id || loadingBookings) return;
      try {
        const stored = await AsyncStorage.getItem(BOOKINGS_KEY);
        let localBookings: MassBooking[] = stored ? JSON.parse(stored) : [];
        if (localBookings.length > 0) {
          const remoteRefIds = new Set(bookings.map((b) => b.refId));
          const unsynced = localBookings.filter((b) => !remoteRefIds.has(b.refId));

          if (unsynced.length > 0) {
            for (const b of unsynced) {
              await createMassBooking({
                user_id: user.id,
                bookerName: b.bookerName,
                day: b.day,
                time: b.time,
                date: b.date,
                formattedDate: b.formattedDate,
                intentionType: b.intentionType,
                intentionDetails: b.intentionDetails,
                offertoryAmount: b.offertoryAmount,
                parishName: b.parishName,
                refId: b.refId,
              });
            }
            refetch();
          }
        }
      } catch (err) {
        console.error('Error syncing local bookings:', err);
      }
    };
    syncBookings();
  }, [user?.id, loadingBookings]);

  // Keep AsyncStorage cache synced with dynamic bookings state
  useEffect(() => {
    if (bookings.length > 0) {
      AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings)).catch((err) => {
        console.error('Error saving bookings cache:', err);
      });
    }
  }, [bookings]);

  // Set default booker name when user profile loads
  useEffect(() => {
    if (user) {
      setBookerName(user.fullName);
    }
  }, [user]);

  // Compute upcoming dates when selectedDay changes
  useEffect(() => {
    if (selectedDay) {
      const dates = getUpcomingDates(selectedDay);
      setUpcomingDates(dates);
      // Auto-select first upcoming date by default
      if (dates.length > 0) {
        setSelectedDate(dates[0].value);
      }
    }
  }, [selectedDay]);

  // Click on a Mass time chip directly triggers booking
  const handleTimeChipPress = (day: string, time: string) => {
    setSelectedDay(day);
    setSelectedTime(time);
    setBookingModalVisible(true);
  };

  // General Booking button trigger
  const handleOpenGeneralForm = () => {
    setSelectedDay('Sunday');
    setSelectedTime('8:30 AM');
    setBookingModalVisible(true);
  };

  // Submit Mass Booking
  const handleBookMass = async () => {
    if (!bookerName.trim()) {
      showAlert({
        title: 'Missing Info',
        message: "Please enter the Booker's Name.",
        type: 'error',
      });
      return;
    }
    if (!selectedDate) {
      showAlert({
        title: 'Missing Info',
        message: 'Please select a Date for the Mass.',
        type: 'error',
      });
      return;
    }
    if (!intentionDetails.trim()) {
      showAlert({
        title: 'Missing Info',
        message: 'Please describe your prayer Intention.',
        type: 'error',
      });
      return;
    }

    const dateObj = new Date(selectedDate);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const refId = 'MS-' + Math.floor(100000 + Math.random() * 900000);
    const amountText = offertoryAmount.trim() 
      ? `₦${Number(offertoryAmount).toLocaleString()}` 
      : 'Free-will Offering';

    const tempId = `booking-${Date.now()}`;
    const newBooking: MassBooking = {
      id: tempId,
      bookerName: bookerName.trim(),
      day: selectedDay,
      time: selectedTime,
      date: selectedDate,
      formattedDate,
      intentionType,
      intentionDetails: intentionDetails.trim(),
      offertoryAmount: amountText,
      parishName: user?.parishName || 'St. Patrick\'s Parish',
      createdAt: new Date().toISOString(),
      refId,
    };

    let finalBooking = { ...newBooking };

    if (user?.id) {
      try {
        const data = await createMassBooking({
          user_id: user.id,
          bookerName: newBooking.bookerName,
          day: newBooking.day,
          time: newBooking.time,
          date: newBooking.date,
          formattedDate: newBooking.formattedDate,
          intentionType: newBooking.intentionType,
          intentionDetails: newBooking.intentionDetails,
          offertoryAmount: newBooking.offertoryAmount,
          parishName: newBooking.parishName,
          refId: newBooking.refId,
        });

        if (data) {
          finalBooking = {
            ...newBooking,
            id: data.id,
            createdAt: data.createdAt,
          };
        }
      } catch (error: any) {
        showAlert({
          title: 'Booking Failed',
          message: error.message || 'There was an error booking your Mass intention. Please try again.',
          type: 'error',
        });
        return;
      }
    } else {
      const stored = await AsyncStorage.getItem(BOOKINGS_KEY);
      let localBookings: MassBooking[] = stored ? JSON.parse(stored) : [];
      const updatedLocal = [finalBooking, ...localBookings];
      await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updatedLocal));
    }

    setBookingModalVisible(false);

    // Log mass booking activity
    if (user?.id && finalBooking.id) {
      try {
        const activityService = new ActivityService();
        await activityService.logMassBooking(
          user.id,
          finalBooking.id,
          formattedDate,
          selectedTime,
          intentionDetails.trim()
        );
      } catch (err) {
        console.error('Error logging mass booking activity:', err);
      }
    }

    // Show Custom Alert for Success
    showAlert({
      title: 'Booking Confirmed',
      message: `Your Mass Intention for ${newBooking.intentionType} has been successfully scheduled.`,
      type: 'success',
      buttonLabel: 'View Ticket',
      onPress: () => {
        setCurrentBookingReceipt(finalBooking);
        setSuccessModalVisible(true);
      },
    });

    // Reset Form Input
    setIntentionDetails('');
    setOffertoryAmount('');
  };

  // Cancel Booking
  const handleCancelBooking = (bookingId: string) => {
    showAlert({
      title: 'Cancel Intention?',
      message: 'Are you sure you want to cancel this mass booking intention?',
      type: 'error',
      buttonLabel: 'Yes, Cancel',
      onPress: async () => {
        try {
          const updated = bookings.filter((b) => b.id !== bookingId);
          await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
          
          if (!bookingId.startsWith('booking-') && user?.id) {
            await deleteMassBooking(bookingId);
          }
          showAlert({
            title: 'Cancelled',
            message: 'Mass intention booking has been cancelled.',
            type: 'success',
          });
        } catch (err: any) {
          showAlert({
            title: 'Cancel Failed',
            message: err.message || 'There was an error cancelling your Mass intention. Please try again.',
            type: 'error',
          });
        }
      },
      secondaryButtonLabel: 'No, Keep It',
      onSecondaryPress: () => {},
    });
  };

  // View Receipt from History
  const handleViewReceipt = (booking: MassBooking) => {
    setCurrentBookingReceipt(booking);
    setSuccessModalVisible(true);
  };

  // Dropdown options
  const dayOptions = [
    { label: 'Sunday', value: 'Sunday' },
    { label: 'Weekdays', value: 'Weekdays' },
    { label: 'Saturday', value: 'Saturday' },
  ];

  // Get available times for selected day
  const getTimesForSelectedDay = () => {
    const found = MASS_TIMES.find((m) => m.day.toLowerCase() === selectedDay.toLowerCase());
    return found ? found.times.map((t) => ({ label: t, value: t })) : [];
  };

  const intentionOptions = [
    { label: 'Thanksgiving / Gratitude', value: 'Thanksgiving' },
    { label: 'In Loving Memory (For the Dead)', value: 'In Loving Memory' },
    { label: 'Special Request Intention', value: 'Special Intention' },
    { label: 'Healing & Good Health', value: 'Healing' },
    { label: 'Birthday Celebration', value: 'Birthday Thanksgiving' },
    { label: 'Vocational & Business Success', value: 'Success' },
  ];

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Mass Schedule" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Intro Banner */}
        <Animated.View
          entering={FadeInDown.duration(400)}
          style={[
            styles.banner,
            {
              backgroundColor: colors.primaryLight,
              borderColor: colors.border,
              borderRadius: radius.lg,
            },
          ]}
        >
          <Ionicons name="time" size={32} color={colors.primary} />
          <View style={styles.bannerTextContainer}>
            <Text
              style={[
                styles.bannerTitle,
                { color: colors.text, fontFamily: typography.fontFamily.bold },
              ]}
            >
              Liturgical Services
            </Text>
            <Text
              style={[
                styles.bannerSubtitle,
                { color: colors.textSecondary, fontFamily: typography.fontFamily.medium },
              ]}
            >
              Join us for Holy Mass and encounter the peace of Christ. Tap any time to book an intention.
            </Text>
          </View>
        </Animated.View>

        {/* Mass Times Cards */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
            ]}
          >
            Weekly Schedules
          </Text>

          <View style={styles.cardsContainer}>
            {MASS_TIMES.map((item, index) => (
              <Animated.View
                key={item.day}
                entering={FadeInDown.delay(100 + index * 50).duration(400)}
                style={[
                  styles.scheduleCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderRadius: radius.md,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <Ionicons name="calendar-sharp" size={18} color={colors.primary} />
                  <Text
                    style={[
                      styles.dayText,
                      { color: colors.text, fontFamily: typography.fontFamily.bold },
                    ]}
                  >
                    {item.day}
                  </Text>
                </View>
                <View style={styles.timeChipsContainer}>
                  {item.times.map((time) => (
                    <TouchableOpacity
                      key={time}
                      activeOpacity={0.7}
                      onPress={() => handleTimeChipPress(item.day, time)}
                      style={[
                        styles.timeChip,
                        {
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.divider,
                        },
                      ]}
                    >
                      <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
                      <Text
                        style={[
                          styles.timeText,
                          { color: colors.text, fontFamily: typography.fontFamily.semiBold },
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Animated.View>
            ))}
          </View>

          <Button
            label="Book a Mass Intention"
            onPress={handleOpenGeneralForm}
            variant="primary"
            size="md"
            style={{ marginTop: 16 }}
            icon={<Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />}
          />
        </View>

        {/* My Bookings History List */}
        <Animated.View
          entering={FadeInDown.delay(250).duration(450)}
          style={styles.section}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
            ]}
          >
            My Booked Intentions
          </Text>

          {bookings.length === 0 ? (
            <View
              style={[
                styles.emptyBookingsCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                },
              ]}
            >
              <Ionicons name="calendar-outline" size={28} color={colors.textMuted} />
              <Text
                style={[
                  styles.emptyBookingsText,
                  { color: colors.textSecondary, fontFamily: typography.fontFamily.medium },
                ]}
              >
                No booked mass intentions yet. Select a weekly mass schedule above or tap the button to schedule one.
              </Text>
            </View>
          ) : (
            <View style={styles.bookingsListContainer}>
              {bookings.map((booking) => (
                <View
                  key={booking.id}
                  style={[
                    styles.bookingRowCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <View style={styles.bookingRowHeader}>
                    <View style={styles.bookingTitleRow}>
                      <Ionicons name="bookmark" size={16} color={colors.accent} />
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.bookingIntentionType,
                          { color: colors.text, fontFamily: typography.fontFamily.bold },
                        ]}
                      >
                        {booking.intentionType}
                      </Text>
                    </View>
                    <TouchableOpacity
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      onPress={() => handleCancelBooking(booking.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bookingRowMeta}>
                    <Text
                      style={[
                        styles.bookingMetaText,
                        { color: colors.textSecondary, fontFamily: typography.fontFamily.medium },
                      ]}
                    >
                      <Ionicons name="time-outline" size={12} /> {booking.formattedDate} · {booking.time}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.bookingMetaDetails,
                        { color: colors.textMuted, fontFamily: typography.fontFamily.regular },
                      ]}
                    >
                      {booking.intentionDetails}
                    </Text>
                  </View>

                  <View style={[styles.bookingRowDivider, { backgroundColor: colors.divider }]} />

                  <View style={styles.bookingRowActions}>
                    <View style={[styles.statusTag, { backgroundColor: colors.successBg }]}>
                      <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
                      <Text
                        style={[
                          styles.statusText,
                          { color: colors.success, fontFamily: typography.fontFamily.bold },
                        ]}
                      >
                        Scheduled
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleViewReceipt(booking)}
                      style={[
                        styles.viewTicketBtn,
                        { borderColor: colors.primary, borderRadius: radius.sm },
                      ]}
                    >
                      <Text
                        style={[
                          styles.viewTicketBtnText,
                          { color: colors.primary, fontFamily: typography.fontFamily.semiBold },
                        ]}
                      >
                        View Ticket
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Confession Times */}
        <Animated.View
          entering={FadeInDown.delay(300).duration(450)}
          style={styles.section}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
            ]}
          >
            Sacrament of Reconciliation
          </Text>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Ionicons name="heart-half-sharp" size={20} color={colors.accent} />
              <View style={styles.infoTextContainer}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: colors.text, fontFamily: typography.fontFamily.bold },
                  ]}
                >
                  Confession Times
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: colors.textSecondary, fontFamily: typography.fontFamily.regular },
                  ]}
                >
                  Every Saturday after the Morning Mass (approx. 7:45 AM) & before the Evening Mass (4:15 PM - 4:45 PM). Or by private appointment with the Parish Priest.
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Devotions Section */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(450)}
          style={[styles.section, { marginBottom: 32 }]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
            ]}
          >
            Parish Devotions
          </Text>

          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.md,
              },
            ]}
          >
            <View style={styles.infoRow}>
              <Ionicons name="flame-sharp" size={20} color={colors.primary} />
              <View style={styles.infoTextContainer}>
                <Text
                  style={[
                    styles.infoLabel,
                    { color: colors.text, fontFamily: typography.fontFamily.bold },
                  ]}
                >
                  Eucharistic Adoration
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    { color: colors.textSecondary, fontFamily: typography.fontFamily.regular },
                  ]}
                >
                  Every Thursday evening at 5:30 PM followed by Benediction. Come and spend quiet time in the presence of the Blessed Sacrament.
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* ─── BOOKING MODAL (BOTTOM SHEET STYLE) ─── */}
      <Modal
        visible={bookingModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <TouchableWithoutFeedback onPress={() => setBookingModalVisible(false)}>
          <View style={styles.modalBackdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.bottomSheetContainer}
        >
          <View
            style={[
              styles.bottomSheet,
              {
                backgroundColor: colors.surface,
                borderTopLeftRadius: radius['2xl'],
                borderTopRightRadius: radius['2xl'],
              },
            ]}
          >
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />

            <View style={styles.sheetHeaderContainer}>
              <Text
                style={[
                  styles.sheetTitle,
                  { color: colors.text, fontFamily: typography.fontFamily.bold },
                ]}
              >
                Book Mass Intention
              </Text>
              <TouchableOpacity
                onPress={() => setBookingModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.sheetScroll}
            >
              {/* Day & Time Selection */}
              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Dropdown
                    label="Liturgical Day"
                    options={dayOptions}
                    value={selectedDay}
                    onChange={(val) => setSelectedDay(val)}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Dropdown
                    label="Service Time"
                    options={getTimesForSelectedDay()}
                    value={selectedTime}
                    onChange={(val) => setSelectedTime(val)}
                  />
                </View>
              </View>

              {/* Booker Name */}
              <Input
                label="Booker Name"
                placeholder="e.g. Chidi Okonkwo"
                value={bookerName}
                onChangeText={setBookerName}
              />

              {/* Date Selection Options */}
              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.formLabel,
                    { color: colors.textSecondary, fontFamily: typography.fontFamily.bold },
                  ]}
                >
                  Select Date
                </Text>
                <View style={styles.dateChipsRow}>
                  {upcomingDates.map((item) => {
                    const isSelected = selectedDate === item.value;
                    return (
                      <TouchableOpacity
                        key={item.value}
                        onPress={() => setSelectedDate(item.value)}
                        style={[
                          styles.dateChip,
                          {
                            backgroundColor: isSelected ? colors.primary : colors.surfaceMuted,
                            borderColor: isSelected ? colors.primary : colors.border,
                            borderRadius: radius.md,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.dateChipText,
                            {
                              color: isSelected ? '#FFFFFF' : colors.text,
                              fontFamily: typography.fontFamily.semiBold,
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Intention Type */}
              <Dropdown
                label="Intention Category"
                options={intentionOptions}
                value={intentionType}
                onChange={(val) => setIntentionType(val)}
              />

              {/* Intention Details */}
              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.formLabel,
                    { color: colors.textSecondary, fontFamily: typography.fontFamily.bold },
                  ]}
                >
                  Intention Details
                </Text>
                <TextInput
                  placeholder="State the intention (e.g., Thanksgiving for successful graduation of my daughter...)"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  numberOfLines={4}
                  value={intentionDetails}
                  onChangeText={setIntentionDetails}
                  style={[
                    styles.textArea,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderRadius: radius.md,
                      fontFamily: typography.fontFamily.regular,
                    },
                  ]}
                />
              </View>

              {/* Offertory Stipend */}
              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.formLabel,
                    { color: colors.textSecondary, fontFamily: typography.fontFamily.bold },
                  ]}
                >
                  Free-will Mass Stipend (₦) - Optional
                </Text>
                <Input
                  placeholder="0.00"
                  keyboardType="numeric"
                  value={offertoryAmount}
                  onChangeText={setOffertoryAmount}
                  leftIcon="cash-outline"
                />
                <View style={styles.stipendPresetRow}>
                  {['1000', '2000', '5000'].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => setOffertoryAmount(amt)}
                      style={[
                        styles.stipendPresetChip,
                        {
                          backgroundColor: colors.surfaceMuted,
                          borderColor: colors.divider,
                          borderRadius: radius.full,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.stipendPresetText,
                          { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
                        ]}
                      >
                        + ₦{Number(amt).toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Submit Button */}
              <Button
                label="Book Mass Intention"
                onPress={handleBookMass}
                loading={submittingBooking}
                fullWidth
                size="lg"
                style={{ marginTop: 16, marginBottom: 24 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── TICKET RECEIPT SUCCESS MODAL ─── */}
      <Modal
        visible={successModalVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.receiptModalContainer}>
          <TouchableWithoutFeedback onPress={() => setSuccessModalVisible(false)}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.ticketCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radius.lg,
              },
            ]}
          >
            {/* Ticket Header */}
            <View style={styles.ticketHeader}>
              <Ionicons name="ribbon-sharp" size={32} color={colors.accent} />
              <Text
                style={[
                  styles.ticketParishName,
                  { color: colors.text, fontFamily: typography.fontFamily.bold },
                ]}
              >
                {currentBookingReceipt?.parishName}
              </Text>
              <Text
                style={[
                  styles.ticketTitle,
                  { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
                ]}
              >
                MASS INTENTION CONFIRMATION
              </Text>
            </View>

            {/* Ticket Punch Line Divider */}
            <View style={styles.punchDividerRow}>
              <View
                style={[
                  styles.punchCutout,
                  { left: -10, backgroundColor: colors.background, borderColor: colors.border },
                ]}
              />
              <View style={[styles.punchLine, { borderColor: colors.border }]} />
              <View
                style={[
                  styles.punchCutout,
                  { right: -10, backgroundColor: colors.background, borderColor: colors.border },
                ]}
              />
            </View>

            {/* Ticket Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.ticketBody}
            >
              {/* Receipt Details Grid */}
              <View style={styles.ticketGrid}>
                <View style={styles.ticketGridCol}>
                  <Text style={[styles.ticketLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    BOOKER
                  </Text>
                  <Text style={[styles.ticketVal, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                    {currentBookingReceipt?.bookerName}
                  </Text>
                </View>

                <View style={styles.ticketGridCol}>
                  <Text style={[styles.ticketLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    REF ID
                  </Text>
                  <Text style={[styles.ticketVal, { color: colors.accent, fontFamily: typography.fontFamily.bold }]}>
                    {currentBookingReceipt?.refId}
                  </Text>
                </View>
              </View>

              <View style={[styles.ticketSectionDivider, { backgroundColor: colors.divider }]} />

              <View style={styles.ticketGrid}>
                <View style={styles.ticketGridCol}>
                  <Text style={[styles.ticketLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    MASS SERVICE
                  </Text>
                  <Text style={[styles.ticketVal, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {currentBookingReceipt?.day} Mass ({currentBookingReceipt?.time})
                  </Text>
                </View>

                <View style={styles.ticketGridCol}>
                  <Text style={[styles.ticketLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    DATE
                  </Text>
                  <Text style={[styles.ticketVal, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {currentBookingReceipt?.formattedDate}
                  </Text>
                </View>
              </View>

              <View style={[styles.ticketSectionDivider, { backgroundColor: colors.divider }]} />

              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.ticketLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                  INTENTION CATEGORY
                </Text>
                <Text style={[styles.ticketVal, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                  {currentBookingReceipt?.intentionType}
                </Text>
              </View>

              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.ticketLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                  INTENTION DETAIL
                </Text>
                <Text style={[styles.ticketIntentionText, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
                  "{currentBookingReceipt?.intentionDetails}"
                </Text>
              </View>

              <View style={[styles.ticketSectionDivider, { backgroundColor: colors.divider }]} />

              <View style={styles.ticketGrid}>
                <View style={styles.ticketGridCol}>
                  <Text style={[styles.ticketLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    OFFERING
                  </Text>
                  <Text style={[styles.ticketVal, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                    {currentBookingReceipt?.offertoryAmount}
                  </Text>
                </View>

                <View style={styles.ticketGridCol}>
                  <Text style={[styles.ticketLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    STATUS
                  </Text>
                  <Text style={[styles.ticketVal, { color: colors.success, fontFamily: typography.fontFamily.bold }]}>
                    Scheduled
                  </Text>
                </View>
              </View>

              {/* Barcode representation */}
              <View style={styles.barcodeSection}>
                <View style={styles.barcodeLinesRow}>
                  {[2, 4, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 2, 1, 3].map((width, idx) => (
                    <View
                      key={idx}
                      style={{
                        width: width * 1.5,
                        height: 38,
                        backgroundColor: colors.text,
                        marginHorizontal: 1,
                      }}
                    />
                  ))}
                </View>
                <Text
                  style={[
                    styles.barcodeText,
                    { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
                  ]}
                >
                  {currentBookingReceipt?.refId}
                </Text>
              </View>

              <Button
                label="Dismiss"
                onPress={() => setSuccessModalVisible(false)}
                variant="secondary"
                fullWidth
                style={{ marginTop: 12 }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
      <GlobalLoader visible={loadingBookings} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  cardsContainer: {
    gap: 12,
  },
  scheduleCard: {
    padding: 16,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dayText: {
    fontSize: 15,
  },
  timeChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  timeText: {
    fontSize: 12,
  },
  infoCard: {
    padding: 16,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Empty Bookings Card
  emptyBookingsCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 12,
  },
  emptyBookingsText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Bookings List
  bookingsListContainer: {
    gap: 12,
  },
  bookingRowCard: {
    padding: 14,
    borderWidth: 1,
  },
  bookingRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookingIntentionType: {
    fontSize: 14,
  },
  bookingRowMeta: {
    gap: 4,
    marginBottom: 10,
  },
  bookingMetaText: {
    fontSize: 12,
  },
  bookingMetaDetails: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  bookingRowDivider: {
    height: 1,
    width: '100%',
    marginBottom: 10,
  },
  bookingRowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  viewTicketBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewTicketBtnText: {
    fontSize: 12,
  },

  // Modal Backdrop
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },

  // Bottom Sheet Form
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 10,
  },
  sheetHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 14,
  },
  sheetTitle: {
    fontSize: 18,
  },
  sheetScroll: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  dateChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  dateChipText: {
    fontSize: 12,
  },
  textArea: {
    borderWidth: 1,
    padding: 12,
    height: 90,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  stipendPresetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: -8,
    marginBottom: 4,
  },
  stipendPresetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  stipendPresetText: {
    fontSize: 11,
  },

  // Ticket Receipt Design
  receiptModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketCard: {
    width: '88%',
    maxHeight: '82%',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  ticketHeader: {
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  ticketParishName: {
    fontSize: 15,
    textAlign: 'center',
  },
  ticketTitle: {
    fontSize: 11,
    letterSpacing: 1,
    opacity: 0.7,
  },
  punchDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 20,
    width: '100%',
  },
  punchCutout: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    position: 'absolute',
  },
  punchLine: {
    width: '100%',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  ticketBody: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  ticketGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketGridCol: {
    flex: 1,
    gap: 2,
  },
  ticketLabel: {
    fontSize: 10,
    letterSpacing: 0.5,
  },
  ticketVal: {
    fontSize: 13,
  },
  ticketSectionDivider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  ticketIntentionText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 2,
  },
  barcodeSection: {
    marginTop: 20,
    alignItems: 'center',
    gap: 6,
  },
  barcodeLinesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barcodeText: {
    fontSize: 11,
    letterSpacing: 3,
  },
});

