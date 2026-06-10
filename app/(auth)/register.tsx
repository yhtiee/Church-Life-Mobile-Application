import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth, Sex, BirthdayMonth, RegisterPayload } from '@/context/AuthContext';
import { useToast } from '@/context/FeedbackContext';
import { ScreenWrapper } from '@/components/ui/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dropdown } from '@/components/ui/Dropdown';
import { PARISHES } from '@/constants/parishes';
import { getGroupMetadata } from '@/constants/groups';
import { useOpenGroupsQuery } from '@/hooks/queries/useGroups';
import { useParishesQuery } from '@/hooks/queries/useParishes';
import { supaBaseClient } from '@/lib/supabase/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MONTHS: BirthdayMonth[] = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const STEP_LABELS = ['Personal Info', 'Parish & Group'];

export default function RegisterScreen() {
  const { colors, typography, radius } = useTheme();
  const { register } = useAuth();
  const router = useRouter();
  const showToast = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Clear any stale local auth session on register mount
    supaBaseClient.auth.signOut().catch((err) => {
      console.log('Error clearing session on register mount:', err);
    });
  }, []);

  const { data: openGroups = [], isLoading: loadingGroups } = useOpenGroupsQuery();
  const { data: parishes = [], isLoading: loadingParishes } = useParishesQuery()

  const progressAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: step / (STEP_LABELS.length - 1),
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [step]);

  // Step 1
  const [fullName, setFullName] = useState('');
  const [baptismalName, setBaptismalName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sex, setSex] = useState<Sex | null>(null);
  const [birthdayMonth, setBirthdayMonth] = useState<BirthdayMonth | null>(null);

  // Step 2
  const [parishId, setParishId] = useState<string | null>(null);
  const [parishName, setParishName] = useState<string | null>(null);
  const [noParish, setNoParish] = useState(false);
  const [groupId, setGroupId] = useState<string | null>(null);

  const parishOptions = parishes.map((p) => ({
    label: p.name, value: p.id, subtitle: `${p.diocese} Diocese · ${p.country}`,
  }));

  const monthOptions = MONTHS.map((m) => ({ label: m, value: m }));

  const validateStep1 = () => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!email.trim() || !email.includes('@')) return 'Please enter a valid email.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    if (!sex) return 'Please select your sex.';
    if (!birthdayMonth) return 'Please select your birthday month.';
    return null;
  };

  const handleNext = () => {
    setError('');
    const err = validateStep1();
    if (err) {
      setError(err);
      showToast(err, 'error');
      return;
    }
    setStep(1);
  };

  const handleSubmit = async () => {
    setError('');
    if (!noParish && !parishId) {
      setError('Please select your parish or tick "I don\'t see my parish".');
      showToast('Please select your parish or tick "I don\'t see my parish".', 'error');
      return;
    }
    if (!groupId) {
      setError('Please select your church group.');
      showToast('Please select your church group.', 'error');
      return;
    }
    setLoading(true);
    const payload: RegisterPayload = {
      fullName, baptismalName: baptismalName || undefined,
      email, password, sex: sex!, birthdayMonth: birthdayMonth!,
      parishId: noParish ? null : parishId,
      parishName: noParish ? null : parishName,
      groupId: groupId!,
    };
    const result = await register(payload);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Registration failed.');
      showToast(result.error ?? 'Registration failed.', 'error');
    } else {
      showToast('Account created successfully!', 'success');
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1], outputRange: ['0%', '100%'],
  });

  return (
    <ScreenWrapper edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Header bar */}
        <View style={[styles.headerBar, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => step > 0 ? setStep(0) : router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={{ fontFamily: typography.fontFamily.bold, fontSize: 17, color: colors.text }}>
            Create Account
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.surfaceMuted }]}>
          <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: colors.primary }]} />
        </View>

        {/* Step labels */}
        <View style={[styles.stepLabels, { paddingHorizontal: 24 }]}>
          {STEP_LABELS.map((label, i) => (
            <Text key={label} style={{
              fontSize: 11,
              fontFamily: i === step ? typography.fontFamily.semiBold : typography.fontFamily.regular,
              color: i === step ? colors.primary : i < step ? colors.textSecondary : colors.textMuted,
              letterSpacing: 0.3,
            }}>
              {i + 1}. {label}
            </Text>
          ))}
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Error banner */}
          {/* {!!error && (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerBg, borderRadius: radius.sm }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.danger} />
              <Text style={{ color: colors.danger, fontSize: 13, fontFamily: typography.fontFamily.regular, flex: 1, marginLeft: 8 }}>
                {error}
              </Text>
            </View>
          )} */}

          {/* ── STEP 1 ── */}
          {step === 0 && (
            <View>
              <LinearGradient
                colors={['#0A1929', '#1D3557']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.stepHeader, { borderRadius: radius.lg }]}
              >
                <View style={styles.stepHeaderIcon}>
                  <Image 
                    source={require('@/assets/images/cross-dove-background.png')} 
                    style={{ width: 34, height: 34 }}
                    contentFit="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.fontFamily.bold, fontSize: 17, color: '#FFFFFF' }}>
                    Personal Information
                  </Text>
                  <Text style={{ fontFamily: typography.fontFamily.regular, fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                    Tell us a bit about yourself
                  </Text>
                </View>
              </LinearGradient>

              <Input label="Full Name *" placeholder="As it appears on your ID" value={fullName} onChangeText={setFullName} leftIcon="person-outline" />
              <Input label="Baptismal Name (Optional)" placeholder="Your baptismal / confirmation name" value={baptismalName} onChangeText={setBaptismalName} leftIcon="water-outline" />
              <Input label="Email Address *" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" leftIcon="mail-outline" />
              <Input label="Password *" placeholder="At least 6 characters" value={password} onChangeText={setPassword} isPassword leftIcon="lock-closed-outline" />
              <Input label="Confirm Password *" placeholder="Re-enter your password" value={confirmPassword} onChangeText={setConfirmPassword} isPassword leftIcon="lock-closed-outline" />
              <Dropdown label="Birthday Month *" placeholder="Select month" options={monthOptions} value={birthdayMonth} onChange={(val) => setBirthdayMonth(val as BirthdayMonth)} />

              {/* Sex cards */}
              <Text style={[styles.fieldLabel, { fontFamily: typography.fontFamily.medium, color: colors.textSecondary }]}>
                Sex *
              </Text>
              <View style={styles.sexRow}>
                {(['Male', 'Female'] as Sex[]).map((s) => {
                  const selected = sex === s;
                  const icon = s === 'Male' ? 'man-outline' : 'woman-outline';
                  return (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setSex(s)}
                      activeOpacity={0.75}
                      style={[styles.sexCard, {
                        borderColor: selected ? colors.primary : colors.border,
                        backgroundColor: selected ? colors.primaryLight : colors.surface,
                        borderRadius: radius.md,
                      }]}
                    >
                      <View style={[styles.sexIconCircle, { backgroundColor: selected ? colors.primary : colors.surfaceMuted }]}>
                        <Ionicons name={icon} size={22} color={selected ? '#FFFFFF' : colors.icon} />
                      </View>
                      <Text style={{ marginTop: 8, fontFamily: typography.fontFamily.semiBold, fontSize: 14, color: selected ? colors.primary : colors.text }}>
                        {s}
                      </Text>
                      {selected && (
                        <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                          <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Button label="Continue" onPress={handleNext} fullWidth size="lg" style={{ marginTop: 8 }} />
            </View>
          )}

          {/* ── STEP 2 ── */}
          {step === 1 && (
            <View>
              <LinearGradient
                colors={['#0A1929', '#1D3557']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={[styles.stepHeader, { borderRadius: radius.lg }]}
              >
                <View style={styles.stepHeaderIcon}>
                  <Image 
                    source={require('@/assets/images/cross-dove-background.png')} 
                    style={{ width: 34, height: 34 }}
                    contentFit="contain"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: typography.fontFamily.bold, fontSize: 17, color: '#FFFFFF' }}>
                    Parish & Church Group
                  </Text>
                  <Text style={{ fontFamily: typography.fontFamily.regular, fontSize: 13, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                    Find your community
                  </Text>
                </View>
              </LinearGradient>

              {!noParish && (
                <Dropdown
                  label="Select Your Parish *"
                  placeholder="Search for your parish..."
                  options={parishOptions}
                  value={parishId}
                  onChange={(val, opt) => { setParishId(val); setParishName(opt.label); }}
                  searchable
                />
              )}

              <TouchableOpacity
                onPress={() => { setNoParish((v) => !v); setParishId(null); setParishName(null); }}
                style={[styles.checkRow, {
                  borderColor: noParish ? colors.primary : colors.border,
                  backgroundColor: noParish ? colors.primaryLight : colors.surface,
                  borderRadius: radius.sm,
                }]}
              >
                <Ionicons name={noParish ? 'checkbox' : 'square-outline'} size={20} color={noParish ? colors.primary : colors.icon} />
                <Text style={{ marginLeft: 10, fontSize: 14, fontFamily: typography.fontFamily.medium, color: noParish ? colors.primary : colors.text }}>
                  {`I don’t see my parish`}
                </Text>
              </TouchableOpacity>

              {noParish && (
                <View style={[styles.noParishNote, { backgroundColor: colors.warningBg, borderRadius: radius.sm }]}>
                  <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
                  <Text style={{ fontSize: 12, color: colors.warning, fontFamily: typography.fontFamily.regular, flex: 1, marginLeft: 8, lineHeight: 18 }}>
                    You can still create an account, but some parish-specific features will be limited until your parish is approved.
                  </Text>
                </View>
              )}

              {/* Group cards */}
              <Text style={[styles.fieldLabel, { fontFamily: typography.fontFamily.medium, color: colors.textSecondary, marginTop: 8 }]}>
                Church Group *
              </Text>
              <View style={styles.groupGrid}>
                {loadingGroups ? (
                  <View style={{ padding: 20, alignItems: 'center', width: '100%' }}>
                    <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.regular }}>Loading groups...</Text>
                  </View>
                ) : openGroups.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center', width: '100%' }}>
                    <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.regular }}>No groups available.</Text>
                  </View>
                ) : (
                  openGroups.map((g) => {
                    const selected = groupId === g.id;
                    const meta = getGroupMetadata(g.name);
                    return (
                      <TouchableOpacity
                        key={g.id}
                        onPress={() => setGroupId(g.id)}
                        activeOpacity={0.75}
                        style={[styles.groupCard, {
                          width: (SCREEN_WIDTH - 40 - 12) / 2,
                          borderColor: selected ? meta.color : colors.border,
                          backgroundColor: selected ? meta.color + '15' : colors.surface,
                          borderRadius: radius.md,
                        }]}
                      >
                        <View style={[styles.groupIconCircle, { backgroundColor: selected ? meta.color + '25' : colors.surfaceMuted }]}>
                          <Ionicons name={meta.icon as any} size={24} color={selected ? meta.color : colors.icon} />
                        </View>
                        <Text style={{ fontFamily: typography.fontFamily.bold, fontSize: 13, color: selected ? meta.color : colors.text, marginTop: 10, textAlign: 'center' }}>
                          {meta.shortName}
                        </Text>
                        <Text style={{ fontFamily: typography.fontFamily.regular, fontSize: 11, color: colors.textMuted, marginTop: 3, textAlign: 'center', lineHeight: 15 }} numberOfLines={2}>
                          {g.name}
                        </Text>
                        {selected && (
                          <View style={[styles.checkBadge, { backgroundColor: meta.color }]}>
                            <Ionicons name="checkmark" size={11} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              <Button label="Create Account" onPress={handleSubmit} loading={loading} fullWidth size="lg" style={{ marginTop: 8 }} />
            </View>
          )}

          {/* Footer */}
          <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
            <Text style={{ fontSize: 14, fontFamily: typography.fontFamily.regular, color: colors.textSecondary }}>
              Already have an account?{' '}
              <Text style={{ fontFamily: typography.fontFamily.semiBold, color: colors.primary }}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  backBtn: { width: 40 },
  progressTrack: { height: 4, width: '100%' },
  progressFill: { height: 4 },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10, paddingBottom: 4 },
  scroll: { paddingHorizontal: 20, paddingBottom: 48, paddingTop: 16 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 22 },
  stepHeaderIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  fieldLabel: { fontSize: 13, marginBottom: 10, letterSpacing: 0.2 },
  sexRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  sexCard: { flex: 1, alignItems: 'center', paddingVertical: 18, borderWidth: 1.5, position: 'relative' },
  sexIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  groupCard: { alignItems: 'center', paddingVertical: 18, paddingHorizontal: 12, borderWidth: 1.5, position: 'relative' },
  groupIconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  checkBadge: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, marginBottom: 12 },
  noParishNote: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, marginBottom: 8 },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, marginBottom: 16 },
  loginLink: { alignItems: 'center', marginTop: 28 },
});
