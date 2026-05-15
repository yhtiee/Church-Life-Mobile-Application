import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function ModalsLayout() {
  const { colors, typography } = useTheme();
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: typography.fontFamily.bold, fontSize: 17, color: colors.text },
      }}
    >
      <Stack.Screen name="announcement-detail" options={{ title: 'Announcement' }} />
      <Stack.Screen name="group-detail" options={{ title: 'Group Details' }} />
      <Stack.Screen name="donation-detail" options={{ title: 'Donation Details' }} />
      <Stack.Screen name="pledge-detail" options={{ title: 'Pledge Details' }} />
      <Stack.Screen name="group-access-request" options={{ title: 'Request Access', presentation: 'modal' }} />
      <Stack.Screen name="group-transition-request" options={{ title: 'Group Transition', presentation: 'modal' }} />
      <Stack.Screen name="edit-email" options={{ title: 'Edit Email', presentation: 'modal' }} />
      <Stack.Screen name="edit-birthday" options={{ title: 'Edit Birthday', presentation: 'modal' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password', presentation: 'modal' }} />
      <Stack.Screen name="donate" options={{ title: 'Make a Donation', presentation: 'modal' }} />
      <Stack.Screen name="new-pledge" options={{ title: 'New Pledge', presentation: 'modal' }} />
      <Stack.Screen name="parish-history" options={{ title: 'Parish History', presentation: 'modal' }} />
      <Stack.Screen name="bible-verse" options={{ title: 'Daily Reading', presentation: 'modal' }} />
      <Stack.Screen name="announcements" options={{ title: 'Announcements', presentation: 'modal' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications', presentation: 'modal' }} />
      <Stack.Screen name="group-chat" options={{ title: 'Group Chat', presentation: 'modal' }} />
      <Stack.Screen name="member-detail" options={{ title: 'Member Profile', presentation: 'modal' }} />
      <Stack.Screen name="log-donation" options={{ title: 'Log Donation', presentation: 'modal' }} />
      <Stack.Screen name="compose-message" options={{ title: 'Broadcast', presentation: 'fullScreenModal' }} />
      <Stack.Screen name="edit-parish-history" options={{ title: 'Edit History', presentation: 'modal' }} />
      <Stack.Screen name="manage-groups" options={{ title: 'Manage Groups', presentation: 'modal' }} />
    </Stack>
  );
}
