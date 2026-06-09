import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { FeedbackProvider } from '@/context/FeedbackContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const unstable_settings = { anchor: '(tabs)' };

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { resolvedMode } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuth) {
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && inAuth) {
      // Check user role for redirection
      if (user?.role === 'parish_admin') {
        router.replace('/(admin)');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [isAuthenticated, isLoading, segments, user?.role]);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <NavThemeProvider value={resolvedMode === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(modals)" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
      <StatusBar style={resolvedMode === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <FeedbackProvider>
              <RootLayoutNav />
            </FeedbackProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
