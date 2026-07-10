import React from 'react';
import { View, StyleSheet, Image, Pressable } from 'react-native';
import { theme } from '../../theme';
import { Aarti, DEITIES, Deity } from '../../data/mockData';
import { AppText } from '../atoms/Text';
import { AppButton } from '../atoms/Button';
import { useAudioPlayer } from '../../hooks/useAudioPlayer';
import { Ionicons } from '@expo/vector-icons';

export interface AartiCardProps {
  readonly aarti: Aarti;
  readonly isFavorite: boolean;
  readonly onPlayAudio: (aarti: Aarti) => void;
  readonly onPlayVideo: (aarti: Aarti) => void;
  readonly onToggleFavorite: (aartiId: string) => void;
  readonly deities?: readonly Deity[];
}

export const AartiCard: React.FC<AartiCardProps> = ({
  aarti,
  isFavorite,
  onPlayAudio,
  onPlayVideo,
  onToggleFavorite,
  deities,
}) => {
  const { currentAarti, isPlaying, togglePlay, loadAarti } = useAudioPlayer();

  // Find deity image
  const activeDeities = deities || DEITIES;
  const deity = activeDeities.find(d => d.id === aarti.deityId);
  const imageUri = deity?.image || 'https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?w=400';

  const isThisPlaying = currentAarti?.id === aarti.id && isPlaying;

  const handleListenPress = async () => {
    if (currentAarti?.id === aarti.id) {
      await togglePlay();
    } else {
      await loadAarti(aarti, true);
    }
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={() => onPlayAudio(aarti)} style={styles.header}>
        <Image source={{ uri: imageUri }} style={styles.avatar} />
        
        <View style={styles.details}>
          <AppText variant="bodyLg" style={styles.title} numberOfLines={1}>
            {aarti.title}
          </AppText>
          <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} numberOfLines={1}>
            {aarti.subtitle}
          </AppText>
          <AppText variant="labelSm" color={theme.colors.outline} style={styles.meta}>
            Traditional • {aarti.duration} min
          </AppText>
        </View>

        <Pressable
          onPress={() => onToggleFavorite(aarti.id)}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? "Remove from favorites" : "Add to favorites"}
          style={({ pressed }) => [styles.favoriteBtn, pressed && styles.pressed]}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? theme.colors.tertiary : theme.colors.outline}
          />
        </Pressable>
      </Pressable>

      <View style={styles.actions}>
        <AppButton
          title={isThisPlaying ? "Pause Audio" : "Listen Audio"}
          variant={isThisPlaying ? "primary" : "outline"}
          style={styles.actionBtn}
          icon={
            <Ionicons
              name={isThisPlaying ? "pause-circle" : "play-circle-outline"}
              size={20}
              color={isThisPlaying ? "#ffffff" : theme.colors.primary}
            />
          }
          onPress={handleListenPress}
        />
        <AppButton
          title="Watch Video"
          variant="secondary"
          style={styles.actionBtn}
          icon={<Ionicons name="videocam-outline" size={20} color={theme.colors.onSecondaryContainer} />}
          onPress={() => onPlayVideo(aarti)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.gutter,
    marginBottom: theme.spacing.gutter,
    elevation: 2,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.gutter,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.default,
    backgroundColor: theme.colors.surfaceDim,
  },
  details: {
    flex: 1,
    marginLeft: theme.spacing.gutter,
  },
  title: {
    fontWeight: theme.typography.weights.bold,
  },
  meta: {
    marginTop: 2,
  },
  favoriteBtn: {
    padding: 8,
    borderRadius: theme.borderRadius.full,
  },
  pressed: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.base,
  },
  actionBtn: {
    flex: 1,
    height: 40,
  },
});
