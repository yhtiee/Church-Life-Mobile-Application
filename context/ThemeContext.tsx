import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, Radius, Shadow } from '@/constants/theme';

export type ColorMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colorMode: ColorMode;
  resolvedMode: 'light' | 'dark';
  colors: typeof Colors.light;
  typography: typeof Typography;
  spacing: typeof Spacing;
  radius: typeof Radius;
  shadow: typeof Shadow;
  setColorMode: (mode: ColorMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | null>(null);
const THEME_KEY = '@churchlife_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceScheme = useDeviceColorScheme();
  const [colorMode, setColorModeState] = useState<ColorMode>('system');

  useEffect(() => {
    const load = async () => {
      const stored = await AsyncStorage.getItem(THEME_KEY).catch(() => null);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setColorModeState(stored);
      }
    };
    load();
  }, []);

  const resolvedMode: 'light' | 'dark' =
    colorMode === 'system' ? (deviceScheme ?? 'light') : colorMode;

  const setColorMode = async (mode: ColorMode) => {
    setColorModeState(mode);
    await AsyncStorage.setItem(THEME_KEY, mode).catch(() => {});
  };

  return (
    <ThemeContext.Provider
      value={{
        colorMode,
        resolvedMode,
        colors: Colors[resolvedMode],
        typography: Typography,
        spacing: Spacing,
        radius: Radius,
        shadow: Shadow,
        setColorMode,
        isDark: resolvedMode === 'dark',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
