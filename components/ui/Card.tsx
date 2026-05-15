import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Shadow } from '@/constants/theme';

type Elevation = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  elevation?: Elevation;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

export function Card({
  children,
  elevation = 'sm',
  backgroundColor,
  padding = 16,
  borderRadius,
  style,
  ...rest
}: CardProps) {
  const { colors, radius } = useTheme();
  const shadowStyle = elevation === 'none' ? {} : Shadow[elevation];

  return (
    <View
      style={[
        {
          backgroundColor: backgroundColor ?? colors.surface,
          borderRadius: borderRadius ?? radius.md,
          padding,
          borderWidth: 1,
          borderColor: colors.border,
        },
        shadowStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
