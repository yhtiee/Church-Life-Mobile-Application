import { Tabs, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
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
  isSpecial?: boolean;
  routeTo?: string;
};

const TABS: TabConfig[] = [
  { name: 'index',               title: 'Home',          icon: 'home-outline',          iconFocused: 'home' },
  { name: 'groups',              title: 'Community',     icon: 'people-outline',        iconFocused: 'people' },
  { name: 'bible',               title: 'Bible',         icon: 'book-outline',          iconFocused: 'book' },
  { name: 'profile',             title: 'Profile',       icon: 'person-outline',        iconFocused: 'person' },
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
        {name.startsWith('notifications') && (
          <View style={styles.notifDot} />
        )}
      </Animated.View>
      {focused && (
        <View style={[styles.activeDot, { backgroundColor: colors.primary }]} />
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

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
      {TABS.map((tab) => (
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

      {/* Hidden tabs — not shown in nav bar */}
      <Tabs.Screen name="finance" options={{ href: null }} />
      <Tabs.Screen name="notifications-dummy" options={{ href: null }} />
      <Tabs.Screen name="quick-action" options={{ href: null }} />
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
  centerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -12,
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E53E3E',
  },
});
