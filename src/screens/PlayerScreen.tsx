import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { AppText } from '../components/atoms/Text';
import { AudioControlPanel } from '../components/organisms/AudioControlPanel';
import { LyricsScroller } from '../components/organisms/LyricsScroller';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { AARTIS, DEITIES, Aarti } from '../data/mockData';
import { apiService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';

export interface PlayerScreenProps {
  readonly navigation: any;
  readonly route: any;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({ navigation, route }) => {
  const { aartiId, initialMode } = route.params;
  const [aarti, setAarti] = useState<Aarti | null>(null);
  const [loading, setLoading] = useState(true);
  
  // YouTube player state variables
  const ytPlayerRef = useRef<any>(null);
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [ytPosition, setYtPosition] = useState(0); // in ms
  const [ytDuration, setYtDuration] = useState(0); // in ms
  const ytIntervalRef = useRef<any>(null);

  const {
    currentAarti,
    isPlaying: isAudioPlaying,
    duration: audioDuration,
    position: audioPosition,
    playbackSpeed,
    isAudioMode,
    lyricsIndex: audioLyricsIndex,
    loadAarti,
    play: playAudio,
    pause: pauseAudio,
    togglePlay: toggleAudioPlay,
    seek: seekAudio,
    setSpeed,
    toggleAudioVideoMode,
  } = useAudioPlayer();

  // Load Aarti details
  useEffect(() => {
    let active = true;
    setLoading(true);

    apiService.getAartiDetails(aartiId)
      .then(selectedAarti => {
        if (!active) return;
        setAarti(selectedAarti);
        setLoading(false);
        
        // Load into audio player hook
        const isVideo = initialMode === 'video';
        if (isVideo && isAudioMode) {
          toggleAudioVideoMode();
        } else if (!isVideo && !isAudioMode) {
          toggleAudioVideoMode();
        }

        // Only call loadAarti if this is a different song to avoid interrupting/restarting active music
        if (currentAarti?.id !== selectedAarti.id) {
          loadAarti(selectedAarti, !isVideo);
        }
      })
      .catch(err => {
        if (!active) return;
        console.error('Failed to load Aarti details from API:', err);
        Alert.alert('Error', 'Failed to load Aarti details.');
        navigation.goBack();
      });

    return () => {
      active = false;
    };
  }, [aartiId]);

  // Handle YouTube position polling to keep lyrics scrolling
  useEffect(() => {
    if (!isAudioMode && isYtPlaying) {
      ytIntervalRef.current = setInterval(async () => {
        if (ytPlayerRef.current) {
          try {
            const timeSec = await ytPlayerRef.current.getCurrentTime();
            const durSec = await ytPlayerRef.current.getDuration();
            setYtPosition(timeSec * 1000);
            setYtDuration(durSec * 1000);
          } catch (e) {
            console.log('Error polling YouTube player time:', e);
          }
        }
      }, 500);
    } else {
      if (ytIntervalRef.current) {
        clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
    }

    return () => {
      if (ytIntervalRef.current) {
        clearInterval(ytIntervalRef.current);
      }
    };
  }, [isAudioMode, isYtPlaying]);

  // Compute values dynamically based on active player mode
  const activeDuration = isAudioMode ? audioDuration : ytDuration || (aarti ? aarti.durationSeconds * 1000 : 0);
  const activePosition = isAudioMode ? audioPosition : ytPosition;
  const isPlaying = isAudioMode ? isAudioPlaying : isYtPlaying;

  // Calculate lyric index in video mode based on ytPosition
  const getLyricsIndex = () => {
    if (isAudioMode) return audioLyricsIndex;
    if (!aarti || !aarti.lyrics) return 0;
    
    const posSec = ytPosition / 1000;
    let activeIdx = 0;
    for (let i = 0; i < aarti.lyrics.length; i++) {
      if (posSec >= aarti.lyrics[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }
    return activeIdx;
  };

  const handleTogglePlay = () => {
    if (isAudioMode) {
      toggleAudioPlay();
    } else {
      setIsYtPlaying(prev => !prev);
    }
  };

  const handleSeek = (positionMs: number) => {
    if (isAudioMode) {
      seekAudio(positionMs);
    } else {
      if (ytPlayerRef.current) {
        ytPlayerRef.current.seekTo(positionMs / 1000, true);
        setYtPosition(positionMs);
      }
    }
  };

  const handleYtStateChange = (state: string) => {
    if (state === 'playing') {
      setIsYtPlaying(true);
    } else if (state === 'paused' || state === 'ended') {
      setIsYtPlaying(false);
    }
  };

  // Find deity image
  const deity = aarti ? DEITIES.find(d => d.id === aarti.deityId) : null;
  const imageUri = deity?.image || 'https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?w=400';

  if (loading || !aarti) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable 
          onPress={() => {
            navigation.goBack();
          }} 
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-down" size={28} color={theme.colors.primary} />
        </Pressable>
        <AppText variant="headlineMd" style={styles.headerTitle}>
          Shanti Dhwani
        </AppText>
        <View style={styles.headerSpacer} />
      </View>

      {/* Main player viewport */}
      <View style={styles.playerContainer}>
        {isAudioMode ? (
          // Audio visual card layout
          <View style={styles.audioArtworkContainer}>
            <View style={styles.artworkShadowRing}>
              <Image source={{ uri: imageUri }} style={styles.artworkImage} />
            </View>
            <AppText variant="headlineMd" style={styles.title} numberOfLines={1}>
              {aarti.title}
            </AppText>
            <AppText variant="labelSm" color={theme.colors.primary} style={styles.subtitle}>
              {deity?.name.toUpperCase()} AARTI • TRADITIONAL
            </AppText>
          </View>
        ) : (
          // YouTube Video Playback Screen
          <View style={styles.videoPlayerContainer}>
            <YoutubePlayer
              ref={ytPlayerRef}
              height={220}
              play={isYtPlaying}
              videoId={aarti.videoId}
              onChangeState={handleYtStateChange}
            />
            <AppText variant="bodyLg" style={styles.videoTitle} numberOfLines={1}>
              {aarti.title}
            </AppText>
            <AppText variant="labelSm" color={theme.colors.primary} style={styles.videoSubtitle}>
              WATCHING VIDEO • LIVE RECORDING
            </AppText>
          </View>
        )}

        {/* Audio control panel for play/pause/seek/speed */}
        <View style={styles.controlsSection}>
          <AudioControlPanel
            aarti={aarti}
            isPlaying={isPlaying}
            duration={activeDuration}
            position={activePosition}
            playbackSpeed={playbackSpeed}
            isAudioMode={isAudioMode}
            onTogglePlay={handleTogglePlay}
            onSeek={handleSeek}
            onSetSpeed={setSpeed}
            onToggleAudioVideoMode={toggleAudioVideoMode}
          />
        </View>

        {/* Synchronized lyrics scroller section */}
        <View style={styles.lyricsSection}>
          <View style={styles.lyricsHeaderRow}>
            <View style={styles.lyricsLine} />
            <Ionicons name="flower-outline" size={16} color={theme.colors.primary} />
            <AppText variant="labelSm" color={theme.colors.primary} style={styles.lyricsTitle}>
              Aarti Lyrics
            </AppText>
            <Ionicons name="flower-outline" size={16} color={theme.colors.primary} />
            <View style={styles.lyricsLine} />
          </View>
          
          <LyricsScroller 
            lyrics={aarti.lyrics} 
            lyricsIndex={getLyricsIndex()} 
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.containerMargin,
    height: 56,
  },
  closeBtn: {
    padding: 4,
  },
  headerTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    fontSize: 20,
  },
  headerSpacer: {
    width: 32,
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.containerMargin,
    paddingBottom: theme.spacing.gutter,
  },
  audioArtworkContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  artworkShadowRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primaryContainer,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
    marginBottom: 20,
  },
  artworkImage: {
    width: 190,
    height: 190,
    borderRadius: 95,
  },
  title: {
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    marginTop: 4,
    fontWeight: theme.typography.weights.semibold,
  },
  videoPlayerContainer: {
    marginTop: 10,
    marginBottom: 10,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  videoTitle: {
    fontWeight: theme.typography.weights.bold,
    color: '#ffffff',
    marginTop: 10,
    paddingHorizontal: 12,
  },
  videoSubtitle: {
    marginTop: 2,
    fontWeight: theme.typography.weights.semibold,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  controlsSection: {
    marginVertical: 10,
  },
  lyricsSection: {
    flex: 1,
    justifyContent: 'center',
  },
  lyricsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 4,
  },
  lyricsLine: {
    flex: 0.2,
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
  },
  lyricsTitle: {
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1,
  },
});
