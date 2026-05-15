import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

interface AvatarProps {
  name: string;
  size?: number;
  imageUri?: string;
  backgroundColor?: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const BG_COLORS = [
  '#1A2A5E', '#7B1D3A', '#C9A84C',
  '#27AE60', '#2980B9', '#8E44AD',
];

function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return BG_COLORS[Math.abs(hash) % BG_COLORS.length];
}

export function Avatar({ name, size = 44, imageUri, backgroundColor }: AvatarProps) {
  const { typography } = useTheme();
  const initials = getInitials(name);
  const bg = backgroundColor ?? hashColor(name);
  const fontSize = Math.round(size * 0.38);

  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize,
          fontFamily: typography.fontFamily.bold,
          letterSpacing: 0.5,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
});
