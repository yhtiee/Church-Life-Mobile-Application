import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface LoadingSpinnerProps { fullScreen?: boolean; size?: number | 'small' | 'large'; }

export function LoadingSpinner({ fullScreen, size = 'large' }: LoadingSpinnerProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  fullScreen: { flex: 1 },
});
