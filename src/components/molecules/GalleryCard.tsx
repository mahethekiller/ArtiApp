import React from 'react';
import { View, StyleSheet, Image, Pressable, Share } from 'react-native';
import { theme } from '../../theme';
import { Wallpaper } from '../../data/mockData';
import { AppText } from '../atoms/Text';
import { Ionicons } from '@expo/vector-icons';

export interface GalleryCardProps {
  readonly wallpaper: Wallpaper;
  readonly isSaved: boolean;
  readonly onSaveToggle: (id: string) => void;
  readonly onShare: (wallpaper: Wallpaper) => void;
}

export const GalleryCard: React.FC<GalleryCardProps> = ({
  wallpaper,
  isSaved,
  onSaveToggle,
  onShare,
}) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: wallpaper.imageUrl }} style={styles.image} resizeMode="cover" />
      
      <View style={styles.overlay}>
        <View style={styles.topRow}>
          <AppText variant="bodyMd" color="#ffffff" style={styles.title} numberOfLines={1}>
            {wallpaper.title}
          </AppText>
        </View>

        <View style={styles.bottomRow}>
          <Pressable
            onPress={() => onSaveToggle(wallpaper.id)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={isSaved ? "Remove wallpaper" : "Save wallpaper"}
          >
            <Ionicons
              name={isSaved ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isSaved ? theme.colors.secondaryContainer : '#ffffff'}
            />
          </Pressable>

          <Pressable
            onPress={() => onShare(wallpaper)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Share wallpaper"
          >
            <Ionicons name="share-social-outline" size={20} color="#ffffff" />
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceDim,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    height: 380, // Fixed height matching high-res aspect ratio
    marginBottom: theme.spacing.gutter,
    elevation: 3,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
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
    height: 100,
    backgroundColor: 'rgba(27, 28, 23, 0.65)', // Sleek dark overlay
    paddingHorizontal: theme.spacing.gutter,
    paddingVertical: theme.spacing.base,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: theme.typography.weights.semibold,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.gutter,
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
});
