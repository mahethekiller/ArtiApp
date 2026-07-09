import React from 'react';
import { View, StyleSheet, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { AppText } from '../components/atoms/Text';
import { DEITIES, AARTIS } from '../data/mockData';
import { Ionicons } from '@expo/vector-icons';

export interface HomeScreenProps {
  readonly navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const handleDeityPress = (deityId: string) => {
    // Navigate to Aarti tab and pass deity filter parameter
    navigation.navigate('Aarti', { deityId });
  };

  const handleLiveAartiPress = () => {
    // Find Shree Ganesha Aarti to play as placeholder
    const ganeshaAarti = AARTIS.find(a => a.id === 'aarti_ganesha');
    if (ganeshaAarti) {
      navigation.navigate('AartiPlayer', { aartiId: ganeshaAarti.id });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Greeting Section */}
        <View style={styles.header}>
          <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant}>
            Namaste, Jay Shreeram
          </AppText>
          <AppText variant="headlineLg" style={styles.greetingTitle}>
            Begin Your Peaceful Morning
          </AppText>
        </View>

        {/* Daily Darshan Slider Block */}
        <View style={styles.sectionHeader}>
          <AppText variant="bodyLg" style={styles.sectionTitle}>
            Daily Darshan
          </AppText>
          <Pressable style={styles.seeMaps}>
            <AppText variant="labelSm" color={theme.colors.primary}>
              SEE TEMPLE MAPS
            </AppText>
          </Pressable>
        </View>

        <Pressable onPress={handleLiveAartiPress} style={styles.darshanCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1561361062-652237d73291?w=800&auto=format&fit=crop&q=80' }}
            style={styles.darshanImage}
          />
          <View style={styles.liveBadge}>
            <AppText variant="labelSm" color="#ffffff" style={styles.liveText}>
              LIVE NOW
            </AppText>
          </View>
          <View style={styles.darshanOverlay}>
            <AppText variant="bodyLg" color="#ffffff" style={styles.templeName}>
              Kashi Vishwanath Aarti
            </AppText>
            <AppText variant="labelSm" color="rgba(255, 255, 255, 0.8)">
              Varanasi • 1.2k Seekers Listening
            </AppText>
          </View>
        </Pressable>

        {/* Divine Deities Grid Section */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <AppText variant="bodyMd" color={theme.colors.outline} style={styles.dividerText}>
            Divine Deities
          </AppText>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.deitiesGrid}>
          {DEITIES.map((deity) => (
            <Pressable
              key={deity.id}
              onPress={() => handleDeityPress(deity.id)}
              style={({ pressed }) => [styles.deityCard, pressed && styles.pressedDeity]}
            >
              <Image source={{ uri: deity.image }} style={styles.deityImage} />
              <AppText variant="bodyMd" style={styles.deityName}>
                {deity.name}
              </AppText>
              <AppText variant="labelSm" color={theme.colors.onSurfaceVariant} style={styles.deityDesc}>
                {deity.description}
              </AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Play Button */}
      <Pressable
        style={styles.floatingPlay}
        onPress={handleLiveAartiPress}
        accessibilityRole="button"
        accessibilityLabel="Open player"
      >
        <Ionicons name="play" size={28} color="#ffffff" />
      </Pressable>
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
    paddingBottom: 80, // Space for floating play button
  },
  header: {
    marginTop: theme.spacing.gutter,
    marginBottom: theme.spacing.gutter,
  },
  greetingTitle: {
    fontWeight: theme.typography.weights.bold,
    marginTop: 4,
    color: theme.colors.onSurface,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.base,
  },
  sectionTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
  seeMaps: {
    paddingVertical: 4,
  },
  darshanCard: {
    height: 220,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    marginBottom: theme.spacing.gutter,
  },
  darshanImage: {
    width: '100%',
    height: '100%',
  },
  liveBadge: {
    position: 'absolute',
    top: theme.spacing.gutter,
    left: theme.spacing.gutter,
    backgroundColor: '#ff1744', // Alert red
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  liveText: {
    fontWeight: theme.typography.weights.bold,
  },
  darshanOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.gutter,
    backgroundColor: 'rgba(27, 28, 23, 0.5)', // soft overlay
  },
  templeName: {
    fontWeight: theme.typography.weights.bold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.gutter,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.outlineVariant,
  },
  dividerText: {
    marginHorizontal: theme.spacing.gutter,
    fontWeight: theme.typography.weights.medium,
  },
  deitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.base,
  },
  deityCard: {
    width: '48%', // Two column layout
    backgroundColor: theme.colors.surfaceContainerLowest,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.base,
    alignItems: 'center',
    marginBottom: theme.spacing.gutter,
    elevation: 1.5,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
  },
  pressedDeity: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  deityImage: {
    width: '100%',
    height: 130,
    borderRadius: theme.borderRadius.default,
    marginBottom: 8,
  },
  deityName: {
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
  },
  deityDesc: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  floatingPlay: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryContainer, // Saffron float button
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
