import React, { useRef } from 'react';
import { View, StyleSheet, Pressable, Platform, Dimensions } from 'react-native';
import { theme } from '../../theme';
import { Aarti } from '../../data/mockData';
import { AppText } from '../atoms/Text';
import { Ionicons } from '@expo/vector-icons';

export interface AudioControlPanelProps {
  readonly aarti: Aarti;
  readonly isPlaying: boolean;
  readonly duration: number; // in ms
  readonly position: number; // in ms
  readonly playbackSpeed: number;
  readonly isAudioMode: boolean;
  readonly onTogglePlay: () => void;
  readonly onSeek: (positionMs: number) => void;
  readonly onSetSpeed: (speed: number) => void;
  readonly onToggleAudioVideoMode: () => void;
}

export const AudioControlPanel: React.FC<AudioControlPanelProps> = ({
  aarti,
  isPlaying,
  duration,
  position,
  playbackSpeed,
  isAudioMode,
  onTogglePlay,
  onSeek,
  onSetSpeed,
  onToggleAudioVideoMode,
}) => {
  const progressBarRef = useRef<View>(null);

  const formatTime = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    if (duration === 0) return 0;
    return (position / duration) * 100;
  };

  // Custom seeking handle when clicking on the progress track
  const handleProgressPress = (event: any) => {
    if (duration === 0) return;
    const { locationX } = event.nativeEvent;
    
    // We can estimate the width of progress bar based on screen dimensions minus margins
    const screenWidth = Dimensions.get('window').width;
    const progressBarWidth = screenWidth - (theme.spacing.containerMargin * 2) - (theme.spacing.gutter * 2) - 24;
    
    const clickRatio = Math.max(0, Math.min(1, locationX / progressBarWidth));
    const seekPositionMs = clickRatio * duration;
    onSeek(seekPositionMs);
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    onSetSpeed(speeds[nextIndex]);
  };

  return (
    <View style={styles.container}>
      {/* Audio / Video toggle */}
      <View style={styles.toggleRow}>
        <Pressable
          onPress={onToggleAudioVideoMode}
          style={[styles.toggleBtn, isAudioMode && styles.activeToggle]}
          accessibilityRole="button"
          accessibilityLabel="Switch to Audio Mode"
        >
          <Ionicons name="headset-outline" size={18} color={isAudioMode ? theme.colors.onPrimary : theme.colors.primary} />
          <AppText variant="labelSm" color={isAudioMode ? theme.colors.onPrimary : theme.colors.primary} style={styles.toggleText}>
            Audio Play
          </AppText>
        </Pressable>

        <Pressable
          onPress={onToggleAudioVideoMode}
          style={[styles.toggleBtn, !isAudioMode && styles.activeToggle]}
          accessibilityRole="button"
          accessibilityLabel="Switch to Video Mode"
        >
          <Ionicons name="videocam-outline" size={18} color={!isAudioMode ? theme.colors.onPrimary : theme.colors.primary} />
          <AppText variant="labelSm" color={!isAudioMode ? theme.colors.onPrimary : theme.colors.primary} style={styles.toggleText}>
            Video Play
          </AppText>
        </Pressable>
      </View>

      {/* Progress slider bar */}
      <View style={styles.progressContainer}>
        <View style={styles.timeRow}>
          <AppText variant="labelSm" color={theme.colors.onSurfaceVariant}>
            {formatTime(position)}
          </AppText>
          <AppText variant="labelSm" color={theme.colors.onSurfaceVariant}>
            {formatTime(duration)}
          </AppText>
        </View>

        <Pressable 
          onPress={handleProgressPress}
          style={styles.trackTouchable}
        >
          <View ref={progressBarRef} style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${getProgressPercent()}%` }]} />
            <View style={[styles.progressKnob, { left: `${getProgressPercent()}%` }]} />
          </View>
        </Pressable>
      </View>

      {/* Media buttons */}
      <View style={styles.controlsRow}>
        {/* Speed multiplier button */}
        <Pressable
          onPress={cycleSpeed}
          style={styles.controlIconBtn}
          accessibilityRole="button"
          accessibilityLabel={`Speed ${playbackSpeed}x`}
        >
          <AppText variant="labelSm" color={theme.colors.primary} style={styles.speedLabel}>
            {playbackSpeed.toFixed(2)}x
          </AppText>
        </Pressable>

        {/* Prev button */}
        <Pressable
          style={[styles.controlIconBtn, styles.disabledIcon]}
          accessibilityRole="button"
          accessibilityLabel="Previous"
        >
          <Ionicons name="play-skip-back-outline" size={24} color={theme.colors.onSurfaceVariant} />
        </Pressable>

        {/* Play/Pause main button */}
        <Pressable
          onPress={onTogglePlay}
          style={({ pressed }) => [styles.playBtn, pressed && styles.pressedPlay]}
          accessibilityRole="button"
          accessibilityLabel={isPlaying ? "Pause" : "Play"}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={32}
            color={theme.colors.onPrimary}
          />
        </Pressable>

        {/* Next button */}
        <Pressable
          style={[styles.controlIconBtn, styles.disabledIcon]}
          accessibilityRole="button"
          accessibilityLabel="Next"
        >
          <Ionicons name="play-skip-forward-outline" size={24} color={theme.colors.onSurfaceVariant} />
        </Pressable>

        {/* Shuffle/Repeat mock button */}
        <Pressable
          style={styles.controlIconBtn}
          accessibilityRole="button"
          accessibilityLabel="Toggle Repeat"
        >
          <Ionicons name="repeat-outline" size={24} color={theme.colors.primary} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surfaceContainerLow,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.gutter,
    elevation: 3,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerHigh,
    borderRadius: theme.borderRadius.full,
    padding: 4,
    marginBottom: theme.spacing.gutter,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 36,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  activeToggle: {
    backgroundColor: theme.colors.primaryContainer, // Saffron active state
  },
  toggleText: {
    fontWeight: theme.typography.weights.semibold,
  },
  progressContainer: {
    marginBottom: theme.spacing.gutter,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  trackTouchable: {
    paddingVertical: 10,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.surfaceContainerHighest,
    position: 'relative',
    justifyContent: 'center',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.colors.primaryContainer, // Saffron
  },
  progressKnob: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.secondaryContainer, // Gold flame dot
    borderWidth: 1.5,
    borderColor: theme.colors.primaryContainer,
    position: 'absolute',
    marginLeft: -7,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlIconBtn: {
    padding: 8,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  disabledIcon: {
    opacity: 0.4,
  },
  speedLabel: {
    fontWeight: theme.typography.weights.bold,
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary, // Deep saffron/orange
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  pressedPlay: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },
});
