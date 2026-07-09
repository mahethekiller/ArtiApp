// Theme tokens extracted from Stitch project 8690335390473969717 (Divine Aarti Sangrah)

export const theme = {
  colors: {
    // Primary / Saffron Accents
    primary: '#8f4e00',
    primaryContainer: '#ff9933',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#693800',
    primaryFixed: '#ffdcc2',
    primaryFixedDim: '#ffb77a',
    onPrimaryFixed: '#2e1500',
    onPrimaryFixedVariant: '#6d3a00',
    inversePrimary: '#ffb77a',

    // Secondary / Gold Accents
    secondary: '#705d00',
    secondaryContainer: '#fcd400',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#6e5c00',
    secondaryFixed: '#ffe16d',
    secondaryFixedDim: '#e9c400',
    onSecondaryFixed: '#221b00',
    onSecondaryFixedVariant: '#544600',

    // Tertiary / Deep Kumkum Red
    tertiary: '#b22b1d',
    tertiaryContainer: '#ff9585',
    onTertiary: '#ffffff',
    onTertiaryContainer: '#8c0c05',
    tertiaryFixed: '#ffdad4',
    tertiaryFixedDim: '#ffb4a8',
    onTertiaryFixed: '#410000',
    onTertiaryFixedVariant: '#8f0f07',

    // Background & Surfaces (Soft Creams)
    background: '#fbf9f1',
    onBackground: '#1b1c17',
    surface: '#fbf9f1',
    onSurface: '#1b1c17',
    surfaceDim: '#dcdad2',
    surfaceBright: '#fbf9f1',
    surfaceVariant: '#e4e3db',
    onSurfaceVariant: '#554336',
    inverseSurface: '#30312c',
    inverseOnSurface: '#f3f1e9',
    surfaceTint: '#8f4e00',

    // Surface Container Levels (Soft Tactility Layers)
    surfaceContainerLowest: '#ffffff',
    surfaceContainerLow: '#f5f4ec',
    surfaceContainer: '#f0eee6',
    surfaceContainerHigh: '#eae8e0',
    surfaceContainerHighest: '#e4e3db',

    // Outlines & Borders
    outline: '#887364',
    outlineVariant: '#dbc2b0',

    // Error States
    error: '#ba1a1a',
    onError: '#ffffff',
    errorContainer: '#ffdad6',
    onErrorContainer: '#93000a',

    // Ambient glow colors for skeuomorphic depth
    glowShadow: 'rgba(255, 153, 51, 0.15)', // low-opacity saffron glow
    overlayBg: 'rgba(27, 28, 23, 0.4)',     // overlay backdrop
  },

  typography: {
    fontFamilies: {
      headline: 'System', // Will map to Noto Serif if loaded, default to System
      body: 'System',     // Will map to Be Vietnam Pro if loaded, default to System
    },
    sizes: {
      headlineLg: 32, // Mobile responsive size
      headlineLgWeb: 40,
      headlineMd: 28,
      bodyLg: 18,
      bodyMd: 16,
      labelSm: 12,
    },
    lineHeights: {
      headlineLg: 38,
      headlineMd: 34,
      bodyLg: 28,
      bodyMd: 24,
      labelSm: 16,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    }
  },

  borderRadius: {
    sm: 4,      // 0.25rem mapped to px
    default: 8,  // 0.5rem (standard container corners)
    md: 12,     // 0.75rem
    lg: 16,     // 1rem
    xl: 24,     // 1.5rem (large prominent blocks)
    full: 9999, // Pill shapes
  },

  spacing: {
    base: 8,
    gutter: 16,
    containerMargin: 24,
    sectionGap: 48,
  }
};
