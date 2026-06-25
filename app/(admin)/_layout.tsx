import { Tabs, Redirect } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Animation } from '@/constants/theme';

type TabConfig = {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused: keyof typeof Ionicons.glyphMap;
};

const ADMIN_TABS: TabConfig[] = [
  { name: 'index', title: 'Home', icon: 'grid-outline', iconFocused: 'grid' },
  { name: 'members', title: 'Members', icon: 'people-outline', iconFocused: 'people' },
  { name: 'finances', title: 'Finances', icon: 'stats-chart-outline', iconFocused: 'stats-chart' },
  { name: 'groups', title: 'Groups', icon: 'business-outline', iconFocused: 'business' },
  { name: 'profile', title: 'Profile', icon: 'person-outline', iconFocused: 'person' },
];

function AnimatedTabIcon({
  name,
  size,
  color,
  focused,
}: {
  name: keyof typeof Ionicons.glyphMap;
  size: number;
  color: string;
  focused: boolean;
}) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (focused) {
    scale.value = withSpring(1.15, Animation.springBounce);
  } else {
    scale.value = withSpring(1, Animation.spring);
  }

  return (
    <View style={styles.tabItem}>
      <Animated.View style={animStyle}>
        <Ionicons name={name} size={size} color={focused ? colors.primary : colors.tabIconDefault} />
      </Animated.View>
      {focused && (
        <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
      )}
    </View>
  );
}

export default function AdminLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  if (user?.role === 'member') {
    return <Redirect href="/(tabs)" />;
  }

  const FLOAT_BOTTOM = Math.max(insets.bottom + 10, 20);
  const FLOAT_H = 68;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          position: 'absolute',
          bottom: FLOAT_BOTTOM,
          left: 24,
          right: 24,
          height: FLOAT_H,
          borderRadius: 40,
          backgroundColor: isDark
            ? 'rgba(10,22,40,0.97)'
            : 'rgba(255,255,255,0.97)',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: isDark
            ? 'rgba(255,255,255,0.07)'
            : 'rgba(42,111,219,0.15)',
          paddingBottom: 0,
          paddingTop: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
        },
      }}
    >
      {ADMIN_TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color }: { focused: boolean; color: string }) => (
              <AnimatedTabIcon
                name={focused ? tab.iconFocused : tab.icon}
                size={24}
                color={color}
                focused={focused}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
});
