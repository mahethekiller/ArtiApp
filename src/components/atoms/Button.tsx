import React from 'react';
import { Pressable, PressableProps, StyleSheet, View, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import { AppText } from './Text';

export interface AppButtonProps extends PressableProps {
  readonly title: string;
  readonly variant?: 'primary' | 'secondary' | 'outline';
  readonly icon?: React.ReactNode;
  readonly loading?: boolean;
  readonly disabled?: boolean;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  style,
  ...rest
}) => {
  const getButtonStyles = (pressed: boolean) => {
    const base: any[] = [styles.button];

    if (variant === 'primary') {
      base.push(styles.primary);
    } else if (variant === 'secondary') {
      base.push(styles.secondary);
    } else if (variant === 'outline') {
      base.push(styles.outline);
    }

    if (disabled) {
      base.push(styles.disabled);
    } else if (pressed) {
      base.push(styles.pressed);
    }

    return base;
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.outline;
    if (variant === 'primary') return theme.colors.onPrimary;
    if (variant === 'secondary') return theme.colors.onSecondaryContainer;
    return theme.colors.primary;
  };

  return (
    <Pressable
      disabled={disabled || loading}
      style={({ pressed }) => [getButtonStyles(pressed), typeof style === 'function' ? style({ pressed }) : style]}
      accessibilityRole="button"
      accessibilityLabel={title}
      {...rest}
    >
      <View style={styles.contentContainer}>
        {loading ? (
          <ActivityIndicator size="small" color={getTextColor()} style={styles.icon} />
        ) : icon ? (
          <View style={styles.icon}>{icon}</View>
        ) : null}
        <AppText
          variant="labelSm"
          color={getTextColor()}
          style={styles.text}
        >
          {title}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.gutter,
    elevation: 2,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  primary: {
    backgroundColor: theme.colors.primaryContainer, // Saffron
  },
  secondary: {
    backgroundColor: theme.colors.secondaryContainer, // Gold
    elevation: 1,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primaryContainer,
    elevation: 0,
    shadowOpacity: 0,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: theme.colors.surfaceDim,
    borderColor: theme.colors.outlineVariant,
    elevation: 0,
    shadowOpacity: 0,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.spacing.base,
  },
  text: {
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
});
