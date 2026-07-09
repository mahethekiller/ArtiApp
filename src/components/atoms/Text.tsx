import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, Platform } from 'react-native';
import { theme } from '../../theme';

export interface AppTextProps extends RNTextProps {
  readonly variant?: 'headlineLg' | 'headlineMd' | 'bodyLg' | 'bodyMd' | 'labelSm';
  readonly color?: string;
  readonly children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = 'bodyMd',
  color,
  children,
  style,
  ...rest
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'headlineLg':
        return styles.headlineLg;
      case 'headlineMd':
        return styles.headlineMd;
      case 'bodyLg':
        return styles.bodyLg;
      case 'bodyMd':
        return styles.bodyMd;
      case 'labelSm':
        return styles.labelSm;
      default:
        return styles.bodyMd;
    }
  };

  const textColor = color || theme.colors.onSurface;

  return (
    <RNText style={[getVariantStyle(), { color: textColor }, style]} {...rest}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  headlineLg: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontSize: theme.typography.sizes.headlineLg,
    lineHeight: theme.typography.lineHeights.headlineLg,
    fontWeight: theme.typography.weights.bold,
  },
  headlineMd: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontSize: theme.typography.sizes.headlineMd,
    lineHeight: theme.typography.lineHeights.headlineMd,
    fontWeight: theme.typography.weights.semibold,
  },
  bodyLg: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
    fontSize: theme.typography.sizes.bodyLg,
    lineHeight: theme.typography.lineHeights.bodyLg,
    fontWeight: theme.typography.weights.regular,
  },
  bodyMd: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
    fontSize: theme.typography.sizes.bodyMd,
    lineHeight: theme.typography.lineHeights.bodyMd,
    fontWeight: theme.typography.weights.regular,
  },
  labelSm: {
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'sans-serif' }),
    fontSize: theme.typography.sizes.labelSm,
    lineHeight: theme.typography.lineHeights.labelSm,
    fontWeight: theme.typography.weights.semibold,
    letterSpacing: 0.5,
  },
});
