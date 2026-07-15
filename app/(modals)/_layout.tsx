import { Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function ModalsLayout() {
  return (
    <Stack screenOptions={{ presentation: 'modal', headerShown: false }}>
      <Stack.Screen name="announcement-detail" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="bible-verse" />
      <Stack.Screen name="parish-history" />
      <Stack.Screen name="group-detail" />
      <Stack.Screen name="group-chat" />
      <Stack.Screen name="group-access-request" />
      <Stack.Screen name="group-transition-request" />
      <Stack.Screen name="manage-groups" />
      <Stack.Screen name="member-detail" />
      <Stack.Screen name="donate" />
      <Stack.Screen name="new-pledge" />
      <Stack.Screen name="donation-detail" />
      <Stack.Screen name="pledge-detail" />
      <Stack.Screen name="log-donation" />
      <Stack.Screen name="edit-email" />
      <Stack.Screen name="edit-phone" />
      <Stack.Screen name="edit-birthday" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="compose-message" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="edit-parish-history" />
      <Stack.Screen name="hymn" />
      <Stack.Screen name="mass" />
      <Stack.Screen name="advertise" />
    </Stack>
  );
}

const styles = StyleSheet.create({});
