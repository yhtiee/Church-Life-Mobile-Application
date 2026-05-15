import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function AdminLayout() {
  const { colors, typography } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
        },
        tabBarLabelStyle: {
          fontFamily: typography.fontFamily.medium,
          fontSize: 9, // Slightly smaller since there are 6 tabs
          marginTop: -2,
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
              <Ionicons name={focused ? tab.iconFocused : tab.icon} size={20} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
