import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, Shadow } from '@/constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
  ring?: string;
  shadow?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('');
}

export function Avatar({ name, size = 44, ring, shadow = false }: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = size * 0.36;
  const ringWidth = ring ? 2.5 : 0;
  const outerSize = size + ringWidth * 2 + (ring ? 4 : 0);

  return (
    <View
      style={[
        {
          width: outerSize,
          height: outerSize,
          borderRadius: outerSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: ring ?? 'transparent',
        },
        shadow ? Shadow.md : {},
      ]}
    >
      <LinearGradient
        colors={Gradients.heroBlue}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
      >
        <Text
          style={[
            styles.initials,
            { fontSize, color: '#FFFFFF' },
          ]}
        >
          {initials}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
