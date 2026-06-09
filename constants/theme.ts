/**
 * ChurchLife Design System — Theme Tokens (v2 — Refactored)
 * Light: "Reverent Dawn" — Marian Blue, Liturgical Gold, Soft Ivory
 * Dark:  "Sacred Night"  — Deep Navy, Vivid Blue, Liturgical Gold
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
  indigo500: '#3F51B5',
  indigo600: '#303F9F',
  indigo700: '#283593',
  indigo800: '#1A237E',
  indigo900: '#1A237E22',

  // Vivid Action Blue (for gradients & CTAs)
  actionBlue1: '#1A3A6B',
  actionBlue2: '#2A5298',
  actionBlue3: '#3D7DE4',

  // Deep Navy (dark mode)
  navy900: '#040A14',
  navy800: '#071524',
  navy700: '#0D2137',
  navy600: '#102040',
  navy500: '#162844',
  navy400: '#1D3557',
  navy300: '#2A4A7F',

  // Neutrals
  white:    '#FFFFFF',
  black:    '#000000',

  // Light neutrals (Ivory scale)
  gray50:   '#FAFAFA',
  gray100:  '#F4F4F4',
  gray200:  '#E2E8F0',
  gray300:  '#CBD5E0',
  gray400:  '#A0AEC0',
  gray500:  '#718096',
  gray600:  '#4A5568',
  gray700:  '#2D3748',
  gray800:  '#1A202C',
  gray900:  '#111111',

  // Dark neutrals
  dark50:   '#3A3A3A',
  dark100:  '#2D2D2D',
  dark200:  '#272727',
  dark300:  '#252525',
  dark400:  '#1E1E1E',
  dark500:  '#181818',
  dark600:  '#141414',
  dark700:  '#121212',
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

// ─── Gradients ───────────────────────────────────────────────────────────────
export const Gradients = {
  heroDark:     ['#071524', '#0D2137', '#1D3557'] as const,
  heroBlue:     ['#1A3A6B', '#2A5298', '#3D7DE4'] as const,
  heroBlueR:    ['#3D7DE4', '#2A5298', '#1A3A6B'] as const,
  heroLight:    ['#2A6FDB', '#4A8FFF', '#6AAFFF'] as const,
  cardGold:     ['#C49A1A', '#D4AF37', '#E8CC54'] as const,
  cardGreen:    ['#1A6B3A', '#27AE60', '#52C77A'] as const,
  cardPurple:   ['#6B1A6B', '#9C27B0', '#CE93D8'] as const,
  cardOrange:   ['#B45309', '#D97706', '#F59E0B'] as const,
  profileHero:  ['#1D3A6B', '#2A6FDB', '#4A8FFF'] as const,
  surface:      ['#FFFFFF', '#F8FAFF'] as const,
  glassLight:   ['rgba(255,255,255,0.95)', 'rgba(248,250,255,0.90)'] as const,
  glassDark:    ['rgba(8,14,26,0.92)', 'rgba(13,33,55,0.88)'] as const,
  // Announcement overlay gradients
  overlayDark:  ['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.72)'] as const,
  overlayBlue:  ['rgba(26,58,107,0.1)', 'rgba(26,58,107,0.80)'] as const,
};

// ─── Animation ───────────────────────────────────────────────────────────────
export const Animation = {
  fast:   150,
  normal: 250,
  slow:   400,
  spring: { damping: 18, stiffness: 200, mass: 1 },
  springBounce: { damping: 12, stiffness: 160, mass: 1 },
  springGentle: { damping: 22, stiffness: 180, mass: 1 },
} as const;

export const Colors = {
  light: {
    // ─── Base ───────────────────────────────────────────────────────────────
    background:      '#F5F8FF',   // very soft blue-white
    surface:         '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceMuted:    '#EEF3FB',

    // ─── Text ───────────────────────────────────────────────────────────────
    text:            '#0F172A',
    textSecondary:   '#4A6080',
    textMuted:       '#8FA8C8',
    textInverse:     '#FFFFFF',

    // ─── Brand ──────────────────────────────────────────────────────────────
    primary:         '#2A6FDB',   // vivid clear blue (matches inspiration)
    primaryLight:    '#E8F0FE',
    accent:          '#D4AF37',   // Liturgical Gold
    accentLight:     '#FBF5DC',
    secondary:       '#7C3AED',   // purple accent
    secondaryLight:  '#EDE9FE',

    // ─── Borders & Dividers ─────────────────────────────────────────────────
    border:          '#E2ECF8',
    borderStrong:    '#C5D8EF',
    divider:         '#EEF3F8',

    // ─── Icons & UI ─────────────────────────────────────────────────────────
    icon:            '#6B8CAE',
    iconActive:      '#2A6FDB',
    tabBarBg:        'rgba(255,255,255,0.96)',
    tabIconDefault:  '#A0B8D4',
    tabIconSelected: '#2A6FDB',
    tabBadge:        '#7C3AED',

    // ─── Cards ──────────────────────────────────────────────────────────────
    cardShadowColor: '#2A6FDB',

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
    // Sacred Night: deep navy palette derived from the hero gradient
    background:      '#04080F',    // deepest navy
    surface:         '#0A1628',    // dark navy card
    surfaceElevated: '#0F1D35',    // raised navy
    surfaceMuted:    '#071524',    // sunken / muted sections

    // ─── Text ───────────────────────────────────────────────────────────────
    text:            '#EEF2F8',    // near-white, warm
    textSecondary:   '#8FA8C8',    // steel blue
    textMuted:       '#506A88',    // muted navy-grey
    textInverse:     '#071524',

    // ─── Brand ──────────────────────────────────────────────────────────────
    primary:         '#4A90E2',    // vivid blue (readable on dark navy)
    primaryLight:    '#0D2137',
    accent:          '#D4AF37',    // Liturgical Gold stays
    accentLight:     '#1C1500',
    secondary:       '#7986CB',
    secondaryLight:  '#0E1440',

    // ─── Borders & Dividers ─────────────────────────────────────────────────
    border:          '#152035',
    borderStrong:    '#1E3050',
    divider:         '#0D1C30',

    // ─── Icons & UI ─────────────────────────────────────────────────────────
    icon:            '#7A9EC0',
    iconActive:      '#4A90E2',
    tabBarBg:        'rgba(4,8,15,0.92)',
    tabIconDefault:  '#3D5A78',
    tabIconSelected: '#4A90E2',
    tabBadge:        '#7986CB',

    // ─── Cards ──────────────────────────────────────────────────────────────
    cardShadowColor: '#000000',

    // ─── Semantic ───────────────────────────────────────────────────────────
    success:   '#2ECC71',
    successBg: '#061A0F',
    danger:    '#E74C3C',
    dangerBg:  '#1E0600',
    warning:   '#F1C40F',
    warningBg: '#1C1400',
    info:      '#3498DB',
    infoBg:    '#061428',

    // ─── Status bar ─────────────────────────────────────────────────────────
    statusBar: 'light' as 'light' | 'dark',
  },
};

export type ThemeColors = typeof Colors.light;

export const Typography = {
  fontFamily: {
    regular:   'Inter_400Regular',
    medium:    'Inter_500Medium',
    semiBold:  'Inter_600SemiBold',
    bold:      'Inter_700Bold',
    extraBold: 'Inter_800ExtraBold',
  },

  size: {
    xs:    11,
    sm:    13,
    base:  15,
    md:    16,
    lg:    18,
    xl:    20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 34,
    '5xl': 42,
  },

  lineHeight: {
    tight:   1.2,
    normal:  1.5,
    relaxed: 1.7,
  },

  tracking: {
    tight:  -0.5,
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
  '3xl': 40,
  full:  9999,
};

export const Shadow = {
  sm: {
    shadowColor:   'transparent',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius:  0,
    elevation:     0,
  },
  md: {
    shadowColor:   'transparent',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius:  0,
    elevation:     0,
  },
  lg: {
    shadowColor:   'transparent',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius:  0,
    elevation:     0,
  },
  xl: {
    shadowColor:   'transparent',
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius:  0,
    elevation:     0,
  },
};
