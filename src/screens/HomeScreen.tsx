import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable, Dimensions, ActivityIndicator, Modal, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { AppText } from '../components/atoms/Text';
import { DEITIES, AARTIS, Deity, Aarti } from '../data/mockData';
import { apiService } from '../services/api';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { Ionicons } from '@expo/vector-icons';

export interface HomeScreenProps {
  readonly navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [deities, setDeities] = useState<readonly Deity[]>(DEITIES);
  const [popularAartis, setPopularAartis] = useState<readonly Aarti[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { currentAarti, isPlaying, togglePlay } = useAudioPlayer();

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const [deitiesData, aartisData] = await Promise.all([
        apiService.getDeities(),
        apiService.getAartis()
      ]);
      setDeities(deitiesData);
      setPopularAartis(aartisData.filter(a => a.category === 'Popular'));
    } catch (err) {
      console.log('Error refreshing home data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiService.getDeities(),
      apiService.getAartis()
    ])
      .then(([deitiesData, aartisData]) => {
        setDeities(deitiesData);
        // Filter aartis to show only Popular ones
        const popular = aartisData.filter(a => a.category === 'Popular');
        setPopularAartis(popular);
      })
      .catch(err => console.log('Error loading home data:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDeityPress = (deityId: string) => {
    // Navigate to Aarti tab and pass deity filter parameter
    navigation.navigate('Aarti', { deityId });
  };

  const handleAartiPress = (aartiId: string) => {
    navigation.navigate('AartiPlayer', { aartiId });
  };

  const handleLiveAartiPress = async () => {
    setLoading(true);
    try {
      const aartisList = await apiService.getAartis();
      if (aartisList.length > 0) {
        navigation.navigate('AartiPlayer', { aartiId: aartisList[0].id });
      } else {
        Alert.alert('No Aartis', 'No Aartis found in the database. Please verify your seeders.');
      }
    } catch (err) {
      console.log('Failed to fetch live aartis:', err);
      Alert.alert('Error', 'Failed to fetch Aartis from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleFloatingPlayPress = async () => {
    if (currentAarti) {
      await togglePlay();
    } else {
      handleLiveAartiPress();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Header Greeting Section */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <AppText variant="headlineLg" style={styles.greetingTitle}>
              Shanti Dhwani
            </AppText>
            <View style={styles.accentDot} />
          </View>
          <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={styles.subtitleText}>
            Namaste, welcome to your daily spiritual journey
          </AppText>
        </View>

        {/* Divine Deities Horizontal Section */}
        <View style={styles.sectionHeader}>
          <AppText variant="bodyLg" style={styles.sectionTitle}>
            Divine Deities
          </AppText>
          <AppText variant="labelSm" color={theme.colors.outline} style={styles.sectionSubtitleText}>
            TAP TO VIEW
          </AppText>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deitiesScroll}
          style={styles.deitiesScrollWrapper}
        >
          {deities.map((deity) => (
            <Pressable
              key={deity.id}
              onPress={() => handleDeityPress(deity.id)}
              style={({ pressed }) => [styles.deityCircleCard, pressed && styles.pressedDeity]}
            >
              <View style={styles.deityImageContainer}>
                <Image source={{ uri: deity.image }} style={styles.deityCircleImage} />
              </View>
              <AppText variant="labelSm" style={styles.deityCircleName}>
                {deity.name}
              </AppText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Most Popular Aartis Section */}
        <View style={styles.sectionHeader}>
          <AppText variant="bodyLg" style={styles.sectionTitle}>
            Popular Aartis
          </AppText>
        </View>

        <View style={styles.popularList}>
          {popularAartis.map((aarti) => {
            const deity = deities.find(d => d.id === aarti.deityId);
            const imageUri = deity ? deity.image : 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400';
            const isActive = currentAarti?.id === aarti.id;

            return (
              <Pressable
                key={aarti.id}
                onPress={() => handleAartiPress(aarti.id)}
                style={({ pressed }) => [
                  styles.aartiCard,
                  isActive && styles.activeAartiCard,
                  pressed && styles.pressedAartiCard
                ]}
              >
                <Image source={{ uri: imageUri }} style={styles.aartiImage} />
                <View style={styles.aartiDetails}>
                  <AppText variant="bodyMd" style={[styles.aartiTitle, isActive && styles.activeText]}>
                    {aarti.title}
                  </AppText>
                  <AppText variant="labelSm" color={theme.colors.onSurfaceVariant} style={styles.aartiSubtitle}>
                    {aarti.subtitle}
                  </AppText>
                  <View style={styles.durationRow}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.outline} />
                    <AppText variant="labelSm" color={theme.colors.outline} style={styles.durationText}>
                      {aarti.duration} mins
                    </AppText>
                  </View>
                </View>
                <View style={styles.playButtonContainer}>
                  <Ionicons
                    name={isActive && isPlaying ? "pause-circle" : "play-circle"}
                    size={40}
                    color={isActive ? theme.colors.primary : theme.colors.primaryContainer}
                  />
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Floating Action Play Button */}
      <Pressable
        style={styles.floatingPlay}
        onPress={handleFloatingPlayPress}
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? "Pause music" : "Play music"}
      >
        <Ionicons name={isPlaying ? "pause" : "play"} size={28} color="#ffffff" />
      </Pressable>

      {/* Full Screen Loader Overlay */}
      {loading ? (
        <Modal transparent={true} animationType="fade" visible={loading}>
          <View style={styles.fullScreenLoaderBg}>
            <View style={styles.fullScreenLoaderContent}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <AppText variant="bodyMd" style={styles.fullScreenLoaderText}>
                Connecting to Divine Server...
              </AppText>
            </View>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.containerMargin,
    paddingBottom: 100, // Space for floating play button
  },
  header: {
    marginTop: theme.spacing.gutter,
    marginBottom: theme.spacing.gutter,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  accentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primaryContainer,
    marginLeft: 4,
    marginTop: 10,
  },
  subtitleText: {
    marginTop: 4,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  sectionSubtitleText: {
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },
  deitiesScrollWrapper: {
    marginBottom: 8,
  },
  deitiesScroll: {
    paddingRight: 20,
    gap: 16,
  },
  deityCircleCard: {
    alignItems: 'center',
    width: 76,
  },
  pressedDeity: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  deityImageContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: theme.colors.primaryContainer,
    padding: 2,
    backgroundColor: '#ffffff',
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  deityCircleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
  },
  deityCircleName: {
    marginTop: 6,
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
    color: theme.colors.onSurface,
  },
  popularList: {
    width: '100%',
    gap: 12,
  },
  aartiCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
    elevation: 1,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  pressedAartiCard: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  activeAartiCard: {
    borderColor: theme.colors.primaryContainer,
    backgroundColor: theme.colors.primaryFixed,
  },
  aartiImage: {
    width: 58,
    height: 58,
    borderRadius: theme.borderRadius.default,
  },
  aartiDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  aartiTitle: {
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.onSurface,
  },
  activeText: {
    color: theme.colors.onPrimaryFixed,
  },
  aartiSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  durationText: {
    marginLeft: 4,
    fontSize: 11,
  },
  playButtonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 8,
  },
  floatingPlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  fullScreenLoaderBg: {
    flex: 1,
    backgroundColor: 'rgba(27, 28, 23, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenLoaderContent: {
    backgroundColor: theme.colors.background,
    padding: 24,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
    elevation: 5,
  },
  fullScreenLoaderText: {
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
});
