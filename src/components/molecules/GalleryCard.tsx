import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { theme } from '../../theme';
import { Wallpaper } from '../../data/mockData';
import { AppText } from '../atoms/Text';

export interface GalleryCardProps {
  readonly wallpaper: Wallpaper;
  readonly onPress: () => void;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({
  wallpaper,
  onPress,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <Image source={{ uri: wallpaper.imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.overlay}>
        <AppText variant="labelSm" color="#ffffff" style={styles.title} numberOfLines={1}>
          {wallpaper.title}
        </AppText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48.5%', // Slightly less than half to fit space-between gap
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    height: 180, // Reduced height for 2-column grid
    elevation: 2,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(27, 28, 23, 0.6)', // soft dark overlay
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  title: {
    fontWeight: theme.typography.weights.semibold,
    fontSize: 11,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
});
