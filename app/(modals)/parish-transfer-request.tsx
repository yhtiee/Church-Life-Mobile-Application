import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { useParishesQuery, useMyParishTransfersQuery } from '@/hooks/queries/useParishes';
import { useRequestParishTransferMutation } from '@/hooks/mutations/useParishes';

export default function ParishTransferRequestScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { showAlert } = useAlert();

  const [targetParishId, setTargetParishId] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  const { data: parishes = [] } = useParishesQuery();
  const { data: myRequests = [] } = useMyParishTransfersQuery(user?.id);
  const { mutateAsync: requestTransfer, isPending } = useRequestParishTransferMutation(user?.id);

  const pending = myRequests.find((r) => r.status === 'pending');

  const options = useMemo(
    () =>
      parishes
        .filter((p) => p.id !== user?.parishId)
        .map((p) => ({ label: `${p.name} · ${p.diocese}`, value: p.id })),
    [parishes, user?.parishId]
  );

  const target = parishes.find((p) => p.id === targetParishId);

  const handleSubmit = async () => {
    if (!targetParishId) {
      showAlert({ title: 'Select a parish', message: 'Choose the parish you want to move to.', type: 'error' });
      return;
    }

    try {
      await requestTransfer({ targetParishId, reason: reason.trim() || undefined });
      showAlert({
        title: 'Request sent',
        message: 'Your current parish admin will review this and let you know.',
        type: 'success',
        onPress: () => router.back(),
      });
    } catch (err: any) {
      showAlert({
        title: 'Could not submit',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  return (
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Transfer Parish" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {pending ? (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Card elevation="sm" style={{ padding: 20, borderRadius: radius.lg }}>
              <View style={styles.pendingHeader}>
                <Ionicons name="time-outline" size={22} color={colors.primary} />
                <Text
                  style={{
                    fontSize: 16,
                    marginLeft: 8,
                    color: colors.text,
                    fontFamily: typography.fontFamily.bold,
                  }}
                >
                  Request awaiting review
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  lineHeight: 21,
                  marginTop: 10,
                }}
              >
                You asked to move to {pending.toParish?.name ?? 'another parish'}. The admin at{' '}
                {pending.fromParish?.name ?? 'your current parish'} needs to approve it before it
                takes effect. You can only have one request open at a time.
              </Text>
            </Card>
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.duration(400)}>
              <Card elevation="sm" style={{ padding: 20, borderRadius: radius.lg }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textMuted,
                    fontFamily: typography.fontFamily.regular,
                  }}
                >
                  Current parish
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    color: colors.text,
                    fontFamily: typography.fontFamily.bold,
                    marginTop: 4,
                  }}
                >
                  {user?.parishName ?? 'Unassigned'}
                </Text>
              </Card>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.block}>
              <Dropdown
                label="Move to"
                placeholder="Choose a parish"
                options={options}
                value={targetParishId}
                onChange={(value) => setTargetParishId(value)}
                searchable
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(160).duration(400)} style={styles.block}>
              <Label label="Reason" helperText="Optional" />
              <Input
                placeholder="Let your parish know why you are moving"
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={4}
                style={{ height: 100, textAlignVertical: 'top' }}
              />
            </Animated.View>

            {target && (
              <Animated.View entering={FadeInDown.delay(220).duration(400)} style={styles.block}>
                <Card elevation="sm" style={{ padding: 16, borderRadius: radius.lg }}>
                  <View style={styles.warnHeader}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                    <Text
                      style={{
                        fontSize: 14,
                        marginLeft: 8,
                        color: colors.text,
                        fontFamily: typography.fontFamily.semiBold,
                      }}
                    >
                      What changes if this is approved
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                      lineHeight: 20,
                      marginTop: 8,
                    }}
                  >
                    You will leave your parish groups and any duty title, and will need to join
                    groups again at {target.name}. Your giving history stays with the parish where
                    it happened.
                  </Text>
                </Card>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(280).duration(400)} style={styles.block}>
              <Button
                label="Submit request"
                onPress={handleSubmit}
                loading={isPending}
                disabled={!targetParishId || isPending}
                fullWidth
              />
            </Animated.View>
          </>
        )}

        {myRequests.filter((r) => r.status !== 'pending').length > 0 && (
          <Animated.View entering={FadeInDown.delay(340).duration(400)} style={styles.block}>
            <Text
              style={[
                styles.sectionTitle,
                { color: colors.textSecondary, fontFamily: typography.fontFamily.semiBold },
              ]}
            >
              Previous requests
            </Text>
            {myRequests
              .filter((r) => r.status !== 'pending')
              .map((r) => (
                <Card
                  key={r.id}
                  elevation="sm"
                  style={{ padding: 14, borderRadius: radius.lg, marginTop: 10 }}
                >
                  <View style={styles.historyRow}>
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 14,
                        color: colors.text,
                        fontFamily: typography.fontFamily.medium,
                      }}
                    >
                      {r.toParish?.name ?? 'Another parish'}
                    </Text>
                    <Badge
                      label={r.status === 'approved' ? 'Approved' : 'Declined'}
                      variant={r.status === 'approved' ? 'success' : 'warning'}
                      size="sm"
                    />
                  </View>
                  {r.decision_note ? (
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textMuted,
                        fontFamily: typography.fontFamily.regular,
                        marginTop: 6,
                      }}
                    >
                      {r.decision_note}
                    </Text>
                  ) : null}
                </Card>
              ))}
          </Animated.View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 60 },
  block: { marginTop: 18 },
  pendingHeader: { flexDirection: 'row', alignItems: 'center' },
  warnHeader: { flexDirection: 'row', alignItems: 'center' },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionTitle: {
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
});
