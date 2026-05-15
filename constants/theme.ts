/**
 * ChurchLife Design System — Theme Tokens
 * Light: "Reverent Dawn" — Marian Blue, Liturgical Gold, Soft Ivory
 * Dark:  "Vespers"       — Midnight Charcoal, Soft Amber, Dark Slate
 */

export const Palette = {
  // Primary — Marian Blue
  blue50:  '#EBF2FA',
  blue100: '#D6E4F0',
  blue200: '#ADC9E0',
  blue300: '#84AED1',
  blue400: '#5B93C1',
  blue500: '#2A6099',   // mid blue
  blue600: '#1D3557',   // Marian Blue — primary brand
  blue700: '#162847',
  blue800: '#0F1B30',
  blue900: '#070E18',

  // Accent — Liturgical Gold
  gold50:  '#FDF9EC',
  gold100: '#FBF5DC',
  gold200: '#F6E9B0',
  gold300: '#EFDB80',
  gold400: '#E8CC54',
  gold500: '#D4AF37',   // Liturgical Gold — primary accent
  gold600: '#B08E22',
  gold700: '#8A6E13',
  gold800: '#634F0A',
  gold900: '#2A2300',

  // Secondary — Muted Indigo
  indigo50:  '#F5F6FD',
  indigo100: '#E8EAF6',
  indigo200: '#C5CAE9',
  indigo300: '#9FA8DA',
  indigo400: '#7986CB',
  indigo500: '#3F51B5',   // Muted Indigo — secondary brand
  indigo600: '#303F9F',
  indigo700: '#283593',
  indigo800: '#1A237E',
  indigo900: '#1A237E22',

  // Amber — Dark Mode primary
  amber50:  '#FFFDE7',
  amber100: '#FFF9C4',
  amber200: '#FFF176',
  amber300: '#FFD740',
  amber400: '#E5C158',   // Soft Amber / Gold — dark mode interactive
  amber500: '#C9A227',
  amber600: '#A07C10',
  amber700: '#7A5B05',
  amber800: '#332A00',
  amber900: '#2A2300',

  // Neutrals
  white:    '#FFFFFF',
  black:    '#000000',

  // Light neutrals (Ivory scale)
  gray50:   '#FAFAFA',   // Soft Ivory background
  gray100:  '#F4F4F4',
  gray200:  '#E2E8F0',
  gray300:  '#CBD5E0',
  gray400:  '#A0AEC0',   // Ash Gray
  gray500:  '#718096',
  gray600:  '#4A5568',   // Muted Slate
  gray700:  '#2D3748',
  gray800:  '#1A202C',
  gray900:  '#111111',   // Deep Charcoal

  // Dark neutrals (Charcoal scale)
  dark50:   '#3A3A3A',
  dark100:  '#2D2D2D',
  dark200:  '#272727',
  dark300:  '#252525',
  dark400:  '#1E1E1E',   // Dark Slate surface
  dark500:  '#181818',
  dark600:  '#141414',
  dark700:  '#121212',   // Midnight Charcoal background
  dark800:  '#0E0E0E',
  dark900:  '#080808',

  // Semantic
  success:      '#27AE60',
  successLight: '#D4EDDA',
  danger:       '#C0392B',
  dangerLight:  '#FDECEA',
  warning:      '#F39C12',
  warningLight: '#FEF9E7',
  info:         '#2980B9',
  infoLight:    '#D6EAF8',
};

export const Colors = {
  light: {
    // ─── Base ───────────────────────────────────────────────────────────────
    background:     '#FAFAFA',    // Soft Ivory
    surface:        '#FFFFFF',    // Pure White
    surfaceElevated:'#FFFFFF',
    surfaceMuted:   '#F4F4F4',

    // ─── Text ───────────────────────────────────────────────────────────────
    text:           '#111111',    // Deep Charcoal
    textSecondary:  '#4A5568',    // Muted Slate
    textMuted:      '#718096',
    textInverse:    '#FFFFFF',

    // ─── Brand ──────────────────────────────────────────────────────────────
    primary:        '#1D3557',    // Marian Blue
    primaryLight:   '#D6E4F0',
    accent:         '#D4AF37',    // Liturgical Gold
    accentLight:    '#FBF5DC',
    secondary:      '#3F51B5',    // Muted Indigo
    secondaryLight: '#E8EAF6',

    // ─── Borders & Dividers ─────────────────────────────────────────────────
    border:         '#E2E8F0',
    borderStrong:   '#CBD5E0',
    divider:        '#EDF2F7',

    // ─── Icons & UI ─────────────────────────────────────────────────────────
    icon:           '#4A5568',
    iconActive:     '#1D3557',    // Marian Blue
    tabBarBg:       '#FFFFFF',
    tabIconDefault: '#A0AEC0',
    tabIconSelected:'#1D3557',    // Marian Blue
    tabBadge:       '#3F51B5',    // Muted Indigo

    // ─── Cards ──────────────────────────────────────────────────────────────
    cardShadowColor: '#000000',

    // ─── Semantic ───────────────────────────────────────────────────────────
    success:   Palette.success,
    successBg: Palette.successLight,
    danger:    Palette.danger,
    dangerBg:  Palette.dangerLight,
    warning:   Palette.warning,
    warningBg: Palette.warningLight,
    info:      Palette.info,
    infoBg:    Palette.infoLight,

    // ─── Status bar ─────────────────────────────────────────────────────────
    statusBar: 'dark' as 'light' | 'dark',
  },

  dark: {
    // ─── Base ───────────────────────────────────────────────────────────────
    background:     '#121212',    // Midnight Charcoal
    surface:        '#1E1E1E',    // Dark Slate
    surfaceElevated:'#252525',
    surfaceMuted:   '#181818',

    // ─── Text ───────────────────────────────────────────────────────────────
    text:           '#E0E0E0',    // Soft White
    textSecondary:  '#A0AEC0',    // Ash Gray
    textMuted:      '#718096',
    textInverse:    '#111111',

    // ─── Brand ──────────────────────────────────────────────────────────────
    primary:        '#E5C158',    // Soft Amber / Gold (readable on dark)
    primaryLight:   '#332A00',
    accent:         '#E5C158',    // Soft Amber / Gold
    accentLight:    '#2A2300',
    secondary:      '#7986CB',    // Lighter Indigo (readable on dark)
    secondaryLight: '#1A237E22',

    // ─── Borders & Dividers ─────────────────────────────────────────────────
    border:         '#2D2D2D',
    borderStrong:   '#3A3A3A',
    divider:        '#272727',

    // ─── Icons & UI ─────────────────────────────────────────────────────────
    icon:           '#A0AEC0',
    iconActive:     '#E5C158',    // Soft Amber
    tabBarBg:       '#1E1E1E',
    tabIconDefault: '#718096',
    tabIconSelected:'#E5C158',    // Soft Amber
    tabBadge:       '#7986CB',    // Lighter Indigo

    // ─── Cards ──────────────────────────────────────────────────────────────
    cardShadowColor: '#000000',

    // ─── Semantic ───────────────────────────────────────────────────────────
    success:   '#2ECC71',
    successBg: '#0D2B1A',
    danger:    '#E74C3C',
    dangerBg:  '#2D0E0B',
    warning:   '#F1C40F',
    warningBg: '#2D2200',
    info:      '#3498DB',
    infoBg:    '#0B1D2E',

    // ─── Status bar ─────────────────────────────────────────────────────────
    statusBar: 'light' as 'light' | 'dark',
  },
};

export type ThemeColors = typeof Colors.light;

export const Typography = {
  // Font families (expo-font will load Inter)
  fontFamily: {
    regular:   'Inter_400Regular',
    medium:    'Inter_500Medium',
    semiBold:  'Inter_600SemiBold',
    bold:      'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
  },

  // Font sizes
  size: {
    xs:   11,
    sm:   13,
    base: 15,
    md:   16,
    lg:   18,
    xl:   20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 42,
  },

  // Line heights
  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.7,
  },

  // Letter spacing
  tracking: {
    tight:   -0.5,
    normal:  0,
    wide:    0.5,
    wider:   1,
    widest:  2,
  },
};

export const Spacing = {
  px:   1,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,
  2.5:  10,
  3:    12,
  4:    16,
  5:    20,
  6:    24,
  7:    28,
  8:    32,
  10:   40,
  12:   48,
  16:   64,
  20:   80,
  24:   96,
};

export const Radius = {
  xs:    4,
  sm:    8,
  md:    12,
  lg:    16,
  xl:    20,
  '2xl': 28,
  full:  9999,
};

export const Shadow = {
  sm: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius:  3,
    elevation:     2,
  },
  md: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius:  8,
    elevation:     5,
  },
  lg: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius:  14,
    elevation:     10,
  },
  xl: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius:  24,
    elevation:     16,
  },
};
