import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useMassBookingsByParishQuery } from '@/hooks/queries/useMass';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { DatabaseMassBooking } from '@/lib/supabase/entities/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const INTENTION_TYPES = ['All', 'Thanksgiving', 'Healing', 'Intercession', 'Memorial', 'Other'];

export default function AdminMassBookingsScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { data: allBookings = [], isLoading } = useMassBookingsByParishQuery(user?.parishId as string);

  const [searchText, setSearchText] = useState('');
  const [selectedIntention, setSelectedIntention] = useState('All');
  const [selectedDetailBooking, setSelectedDetailBooking] = useState<DatabaseMassBooking | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    return allBookings.filter((booking) => {
      const matchesSearch = booking.bookerName.toLowerCase().includes(searchText.toLowerCase()) ||
                           booking.parishName.toLowerCase().includes(searchText.toLowerCase()) ||
                           booking.refId.toLowerCase().includes(searchText.toLowerCase());
      
      const matchesIntention = selectedIntention === 'All' || booking.intentionType === selectedIntention;
      
      return matchesSearch && matchesIntention;
    });
  }, [allBookings, searchText, selectedIntention]);

  const handleViewDetails = (booking: DatabaseMassBooking) => {
    setSelectedDetailBooking(booking);
    setDetailsModalVisible(true);
  };

  const stats = useMemo(() => {
    return {
      total: allBookings.length,
      today: allBookings.filter((b) => {
        const today = new Date().toISOString().split('T')[0];
        return b.date === today;
      }).length,
      thisWeek: allBookings.filter((b) => {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return new Date(b.date) >= weekAgo;
      }).length,
    };
  }, [allBookings]);

  const statsData = [
    { id: 'total', label: 'Total Bookings', value: stats.total, icon: 'calendar-outline', color: colors.primary, delay: 100 },
    { id: 'today', label: 'Today', value: stats.today, icon: 'today-outline', color: colors.success, delay: 150 },
    { id: 'week', label: 'This Week', value: stats.thisWeek, icon: 'trending-up-outline', color: colors.accent, delay: 200 },
  ];

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* ── Header ── */}
        <ScreenHeader title="Mass Bookings" />

        {/* ── Stats Cards (Same Row) ── */}
        {/* <View style={styles.statsRow}>
          {statsData.map((stat) => (
            <Animated.View 
              key={stat.id} 
              entering={FadeInDown.delay(stat.delay).duration(450)}
              style={styles.statItemContainer}
            >
              <Card elevation="sm" style={[styles.statCard, { borderColor: colors.border }]}>
                <View style={styles.statCardInner}>
                  <Ionicons name={stat.icon as any} size={28} color={stat.color} />
                  <Text style={[styles.statValue, { color: colors.text, fontFamily: typography.fontFamily.bold, marginTop: 8 }]}>
                    {stat.value}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium, marginTop: 4 }]}>
                    {stat.label}
                  </Text>
                </View>
              </Card>
            </Animated.View>
          ))}
        </View> */}

        {/* ── Search Bar ── */}
        <Animated.View entering={FadeInDown.delay(250).duration(450)} style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.infoBg, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={18} color={colors.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: colors.text, fontFamily: typography.fontFamily.regular }]}
              placeholder="Search by name, parish, or ref ID..."
              placeholderTextColor={colors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* ── Intention Filter ── */}
        <Animated.View entering={FadeInDown.delay(300).duration(450)} style={styles.filterSection}>
          <Text style={[styles.filterTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Intention Type
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {INTENTION_TYPES.map((intention) => (
              <TouchableOpacity
                key={intention}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedIntention === intention ? colors.primary : colors.infoBg,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedIntention(intention)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    {
                      color: selectedIntention === intention ? '#FFF' : colors.text,
                      fontFamily: typography.fontFamily.medium,
                      fontSize: 12,
                    },
                  ]}
                >
                  {intention}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── Bookings List ── */}
        <Animated.View entering={FadeInDown.delay(350).duration(450)} style={styles.listSection}>
          {filteredBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="alert-circle-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                {searchText || selectedIntention !== 'All' ? 'No bookings match your search' : 'No mass bookings yet'}
              </Text>
            </View>
          ) : (
            <View>
              {filteredBookings.map((booking, index) => (
                <Animated.View
                  key={booking.id}
                  entering={FadeInDown.delay(400 + index * 50).duration(450)}
                >
                  <TouchableOpacity onPress={() => handleViewDetails(booking)}>
                    <Card elevation="sm" style={[styles.bookingCard, { borderColor: colors.border }]}>
                      <View style={styles.bookingHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.bookerName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                            {booking.bookerName}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="calendar-outline" size={14} color={colors.primary} style={{ marginRight: 6 }} />
                            <Text style={[styles.bookingDate, { color: colors.textMuted, fontFamily: typography.fontFamily.regular }]}>
                              {new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {booking.time}
                            </Text>
                          </View>
                        </View>
                        <Badge label={booking.intentionType} variant="primary" />
                        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={{ marginLeft: 8 }} />
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* ── Details Modal ── */}
      {selectedDetailBooking && (
        <Modal visible={detailsModalVisible} animationType="slide" onRequestClose={() => setDetailsModalVisible(false)}>
          <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Ionicons name="close" size={28} color={colors.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                Booking Details
              </Text>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Ref ID & Intention */}
              <Card elevation="sm" style={[styles.detailCard, { borderColor: colors.border }]}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    Reference ID
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                    {selectedDetailBooking.refId}
                  </Text>
                </View>

                <View style={[styles.detailRow, { borderTopColor: colors.divider, borderTopWidth: 1, paddingTop: 12, marginTop: 12 }]}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    Intention Type
                  </Text>
                  <Badge label={selectedDetailBooking.intentionType} variant="primary" />
                </View>
              </Card>

              {/* Booker Info */}
              <Card elevation="sm" style={[styles.detailCard, { borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="person-outline" size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold, marginLeft: 8 }]}>
                    Booker Information
                  </Text>
                </View>

                <View style={[styles.detailRow, { marginTop: 12 }]}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    Name
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {selectedDetailBooking.bookerName}
                  </Text>
                </View>

                <View style={[styles.detailRow, { borderTopColor: colors.divider, borderTopWidth: 1, paddingTop: 12, marginTop: 12 }]}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    Parish
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {selectedDetailBooking.parishName}
                  </Text>
                </View>
              </Card>

              {/* Mass Details */}
              <Card elevation="sm" style={[styles.detailCard, { borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="calendar-outline" size={18} color={colors.success} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold, marginLeft: 8 }]}>
                    Mass Details
                  </Text>
                </View>

                <View style={[styles.detailRow, { marginTop: 12 }]}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    Date
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {selectedDetailBooking.formattedDate}
                  </Text>
                </View>

                <View style={[styles.detailRow, { borderTopColor: colors.divider, borderTopWidth: 1, paddingTop: 12, marginTop: 12 }]}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    Time
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {selectedDetailBooking.time}
                  </Text>
                </View>

                <View style={[styles.detailRow, { borderTopColor: colors.divider, borderTopWidth: 1, paddingTop: 12, marginTop: 12 }]}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    Day
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {selectedDetailBooking.day}
                  </Text>
                </View>
              </Card>

              {/* Intention & Offering */}
              <Card elevation="sm" style={[styles.detailCard, { borderColor: colors.border }]}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="heart-outline" size={18} color={colors.danger} />
                  <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold, marginLeft: 8 }]}>
                    Prayer Intention
                  </Text>
                </View>

                <Text style={[styles.intentionText, { color: colors.text, fontFamily: typography.fontFamily.regular, marginTop: 12 }]}>
                  {selectedDetailBooking.intentionDetails}
                </Text>

                <View style={[styles.detailRow, { borderTopColor: colors.divider, borderTopWidth: 1, paddingTop: 12, marginTop: 16 }]}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    Offertory
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.success, fontFamily: typography.fontFamily.bold }]}>
                    {selectedDetailBooking.offertoryAmount}
                  </Text>
                </View>
              </Card>

              {/* Booking Date */}
              <Card elevation="sm" style={[styles.detailCard, { borderColor: colors.border }]}>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: colors.textMuted, fontFamily: typography.fontFamily.medium }]}>
                    Booked On
                  </Text>
                  <Text style={[styles.detailValue, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
                    {new Date(selectedDetailBooking.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
              </Card>

              <Button
                label="Close"
                onPress={() => setDetailsModalVisible(false)}
                style={styles.closeButton}
              />
            </ScrollView>
          </ScreenWrapper>
        </Modal>
      )}

      <GlobalLoader visible={isLoading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  statItemContainer: {
    flex: 1,
    minWidth: 0,
  },
  statCard: {
    padding: 14,
  },
  statCardInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 28,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterSection: {
    marginTop: 16,
    paddingHorizontal: 20,
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
  bookingCard: {
    marginBottom: 8,
    padding: 0,
    overflow: 'hidden',
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  bookerName: {
    fontSize: 14,
  },
  bookingDate: {
    fontSize: 12,
    marginTop: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  detailCard: {
    marginBottom: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
  },
  intentionText: {
    fontSize: 13,
    lineHeight: 20,
  },
  closeButton: {
    marginTop: 20,
    marginBottom: 20,
  },
});
