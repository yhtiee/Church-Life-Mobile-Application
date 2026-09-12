import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * React Native reports `'unspecified'` when the device expresses no preference,
 * so normalise it to a concrete scheme that the colour palettes can be indexed with.
 */
export function useColorScheme(): 'light' | 'dark' {
  return useRNColorScheme() === 'dark' ? 'dark' : 'light';
}
