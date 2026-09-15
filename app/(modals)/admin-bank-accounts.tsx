import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useAlert } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import GlobalLoader from '@/components/ui/GlobalLoader';
import { useBankAccountsQuery } from '@/hooks/queries/useSupport';
import { useBankAccountMutations } from '@/hooks/mutations/useSupport';
import type { DatabaseBankAccount } from '@/lib/supabase/entities/types';

interface Draft {
  id?: string;
  label: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  instructions: string;
  is_active: boolean;
}

const EMPTY: Draft = {
  label: '',
  bank_name: '',
  account_name: '',
  account_number: '',
  instructions: '',
  is_active: true,
};

export default function AdminBankAccountsScreen() {
  const { colors, typography, radius } = useTheme();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const parishId = user?.parishId ?? undefined;
  const [draft, setDraft] = useState<Draft | null>(null);

  // Inactive accounts are included so an admin can see and re-enable them.
  const { data: accounts = [], isLoading } = useBankAccountsQuery(parishId, false);
  const { save, remove } = useBankAccountMutations(parishId);
  const busy = save.isPending || remove.isPending;

  const openEdit = (account: DatabaseBankAccount) =>
    setDraft({
      id: account.id,
      label: account.label,
      bank_name: account.bank_name,
      account_name: account.account_name,
      account_number: account.account_number,
      instructions: account.instructions ?? '',
      is_active: account.is_active,
    });

  const handleSave = async () => {
    if (!draft || !parishId) return;

    const required: [keyof Draft, string][] = [
      ['label', 'a name for this account'],
      ['bank_name', 'the bank name'],
      ['account_name', 'the account name'],
      ['account_number', 'the account number'],
    ];
    const missing = required.find(([key]) => !String(draft[key]).trim());
    if (missing) {
      showAlert({ title: 'Missing detail', message: `Please add ${missing[1]}.`, type: 'error' });
      return;
    }

    try {
      await save.mutateAsync({
        ...(draft.id ? { id: draft.id } : {}),
        parish_id: parishId,
        label: draft.label.trim(),
        bank_name: draft.bank_name.trim(),
        account_name: draft.account_name.trim(),
        // Members copy this straight into a banking app, so strip any spaces
        // or dashes that crept in while typing.
        account_number: draft.account_number.replace(/[^0-9]/g, ''),
        instructions: draft.instructions.trim() || null,
        is_active: draft.is_active,
        sort_order: draft.id ? undefined : accounts.length,
      } as any);
      setDraft(null);
    } catch (err: any) {
      showAlert({
        title: 'Could not save',
        message: err?.message || 'Something went wrong. Please try again.',
        type: 'error',
      });
    }
  };

  const confirmDelete = (account: DatabaseBankAccount) => {
    showAlert({
      title: `Remove ${account.label}?`,
      message: 'Members will no longer see this account when recording a payment.',
      type: 'error',
      buttonLabel: 'Remove',
      onPress: async () => {
        try {
          await remove.mutateAsync(account.id);
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
    <ScreenWrapper edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader title="Parish Accounts" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text
          style={{
            fontSize: 13,
            color: colors.textMuted,
            fontFamily: typography.fontFamily.regular,
            lineHeight: 20,
            marginBottom: 16,
          }}
        >
          These are shown to members when they support the parish or a celebration. Add more than
          one if you keep separate accounts, for example offerings and a building fund.
        </Text>

        {accounts.map((account, index) => (
          <Animated.View key={account.id} entering={FadeInDown.delay(index * 50).duration(350)}>
            <Card elevation="sm" style={{ padding: 16, borderRadius: radius.lg, marginBottom: 12 }}>
              <View style={styles.rowTop}>
                <View style={{ flex: 1 }}>
                  <View style={styles.labelRow}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.text,
                        fontFamily: typography.fontFamily.bold,
                      }}
                    >
                      {account.label}
                    </Text>
                    {!account.is_active && <Badge label="Hidden" variant="warning" size="sm" />}
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      color: colors.text,
                      fontFamily: typography.fontFamily.bold,
                      letterSpacing: 1.2,
                      marginTop: 6,
                    }}
                  >
                    {account.account_number}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                      marginTop: 2,
                    }}
                  >
                    {account.account_name} · {account.bank_name}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => openEdit(account)} disabled={busy} hitSlop={8}>
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(account)}
                    disabled={busy}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            </Card>
          </Animated.View>
        ))}

        {accounts.length === 0 && !isLoading && (
          <Text
            style={{
              fontSize: 14,
              color: colors.textMuted,
              fontFamily: typography.fontFamily.regular,
              textAlign: 'center',
              marginTop: 30,
            }}
          >
            No accounts yet. Members cannot record payments until you add one.
          </Text>
        )}

        <Button
          label="Add an account"
          onPress={() => setDraft({ ...EMPTY })}
          variant="secondary"
          fullWidth
          style={{ marginTop: 18 }}
        />
      </ScrollView>

      <Modal visible={!!draft} transparent animationType="fade" statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.backdrop}
        >
          <ScrollView
            contentContainerStyle={styles.sheetScroll}
            keyboardShouldPersistTaps="handled"
          >
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
                {draft?.id ? 'Edit account' : 'New account'}
              </Text>

              <Label label="Name" helperText="What members will see, e.g. General Offerings" />
              <Input
                placeholder="General Offerings"
                value={draft?.label ?? ''}
                onChangeText={(v) => setDraft((d) => (d ? { ...d, label: v } : d))}
              />

              <View style={styles.field}>
                <Label label="Bank" />
                <Input
                  placeholder="First Bank"
                  value={draft?.bank_name ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, bank_name: v } : d))}
                />
              </View>

              <View style={styles.field}>
                <Label label="Account name" />
                <Input
                  placeholder="St. Patrick's Catholic Church"
                  value={draft?.account_name ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, account_name: v } : d))}
                />
              </View>

              <View style={styles.field}>
                <Label label="Account number" />
                <Input
                  placeholder="0123456789"
                  value={draft?.account_number ?? ''}
                  onChangeText={(v) =>
                    setDraft((d) => (d ? { ...d, account_number: v.replace(/[^0-9]/g, '') } : d))
                  }
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.field}>
                <Label label="Notes" helperText="Optional, e.g. what to use as the reference" />
                <Input
                  placeholder="Use your full name as the transfer reference"
                  value={draft?.instructions ?? ''}
                  onChangeText={(v) => setDraft((d) => (d ? { ...d, instructions: v } : d))}
                  multiline
                  numberOfLines={3}
                  style={{ height: 80, textAlignVertical: 'top' }}
                />
              </View>

              <TouchableOpacity
                onPress={() => setDraft((d) => (d ? { ...d, is_active: !d.is_active } : d))}
                style={styles.toggleRow}
              >
                <Ionicons
                  name={draft?.is_active ? 'checkbox' : 'square-outline'}
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
                  Show this account to members
                </Text>
              </TouchableOpacity>

              <View style={styles.sheetActions}>
                <Button
                  label="Cancel"
                  onPress={() => setDraft(null)}
                  variant="secondary"
                  style={{ flex: 1 }}
                />
                <Button label="Save" onPress={handleSave} loading={busy} style={{ flex: 1 }} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <GlobalLoader visible={isLoading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 60 },
  rowTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actions: { flexDirection: 'row', gap: 16, paddingTop: 2 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheetScroll: { flexGrow: 1, justifyContent: 'flex-end' },
  sheet: { padding: 22, paddingBottom: 36 },
  field: { marginTop: 12 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 22 },
});
