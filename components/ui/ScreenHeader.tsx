import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  showGreeting?: boolean;
  rightElement?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenHeader({ title, subtitle, showGreeting, rightElement, style }: ScreenHeaderProps) {
  const { typography } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  // Calculate greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <LinearGradient
      colors={['#0A1929', '#1D3557']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, style]}
    >
      <View style={{ flex: 1 }}>
        {showGreeting ? (
          <>
            <Text style={{ fontSize: 12, fontFamily: typography.fontFamily.regular, color: 'rgba(255,255,255,0.65)' }}>
              {greeting},{' '}
              <Text style={{ fontFamily: typography.fontFamily.semiBold, color: 'rgba(255,255,255,0.9)' }}>
                {user?.fullName?.split(' ')[0] ?? 'Parishioner'}
              </Text>
            </Text>
            <Text style={{ fontSize: 17, fontFamily: typography.fontFamily.bold, color: '#FFFFFF', marginTop: 2 }}>
              {user?.hasParishAccess ? (user?.parishName ?? 'ChurchLife') : 'ChurchLife'}
            </Text>
            {!user?.hasParishAccess && (
              <View style={styles.awaitingBadge}>
                <Ionicons name="time-outline" size={10} color="#D4AF37" />
                <Text style={{ fontSize: 10, fontFamily: typography.fontFamily.medium, color: '#D4AF37', marginLeft: 4 }}>
                  Awaiting Parish Approval
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            <Text style={{ fontSize: 17, fontFamily: typography.fontFamily.bold, color: '#FFFFFF', marginTop: 2 }}>
              {title}
            </Text>
          </>
        )}
      </View>

      {/* Default right element is the notification bell (and admin icon) unless overridden to null */}
      {rightElement !== undefined ? rightElement : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => router.push('/(modals)/notifications')}
          >
            <View style={styles.badge} />
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Admin shortcut */}
          {/* {user?.role === 'parish_admin' && (
            <TouchableOpacity
              onPress={() => router.push('/(admin)')}
              style={[styles.iconBtn, { backgroundColor: 'rgba(212,175,55,0.2)' }]}
            >
              <Ionicons name="settings-outline" size={20} color="#D4AF37" />
            </TouchableOpacity>
          )} */}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 22,
  },
  awaitingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E53E3E',
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#0A1929',
  },
});
