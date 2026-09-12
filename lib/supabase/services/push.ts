import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supaBaseClient } from '../client';

export async function registerForPushNotifications(userId: string) {
  // Expo Go dropped remote notifications in SDK 53. On Android, expo-notifications
  // throws while its module body is still evaluating, so a static import at the top
  // of this file would take down every screen that reaches AuthContext. Load it only
  // once we know we are in a build that can actually register a token.
  if (isRunningInExpoGo()) {
    console.log(
      'Skipping push notification registration: Expo Go does not support remote notifications. Use a development build.'
    );
    return;
  }

  try {
    const Notifications = await import('expo-notifications');

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for push notifications.');
      return;
    }

    // Get the push token
    let token = '';
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      token = tokenData.data;
    } catch (tokenErr) {
      console.warn('Failed to get Expo push token:', tokenErr);
    }

    if (token) {
      const { error } = await supaBaseClient
        .from('profiles')
        .update({ push_token: token })
        .eq('id', userId);

      if (error) {
        console.error('Error saving push token to profiles:', error.message);
      }
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7A',
      });
    }
  } catch (err) {
    console.error('Error registering for push notifications:', err);
  }
}
