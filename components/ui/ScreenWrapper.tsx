import React from 'react';
import { View, ViewProps, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { ViewAsBanner } from '@/components/ui/ViewAsBanner';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  /** Skip horizontal padding for full-bleed sections */
  noPadding?: boolean;
  /** Use SafeAreaView edges  */
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
}

export function ScreenWrapper({
  children,
  noPadding,
  edges = ['top', 'left', 'right'],
  backgroundColor,
  style,
  ...rest
}: ScreenWrapperProps) {
  const { colors, resolvedMode } = useTheme();
  const bg = backgroundColor ?? colors.background;

  return (
    <SafeAreaView
      edges={edges}
      style={[{ flex: 1, backgroundColor: bg }, style]}
      {...rest}
    >
      <StatusBar
        barStyle={resolvedMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={bg}
      />
      {/* Renders nothing unless a platform admin has switched view. It lives
          here so the way back is present on every screen, including the ones
          that hide the admin entry points. */}
      <ViewAsBanner />
      <View style={[{ flex: 1 }, !noPadding && { paddingHorizontal: 0 }]}>
        {children}
      </View>
    </SafeAreaView>
  );
}
