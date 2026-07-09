import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, Share, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { AppText } from '../components/atoms/Text';
import { GalleryCard } from '../components/molecules/GalleryCard';
import { useGallery } from '../hooks/useGallery';
import { DEITIES, Wallpaper } from '../data/mockData';

export interface GalleryScreenProps {
  readonly navigation: any;
}

type FilterOption = 'All' | 'deity_krishna' | 'deity_shiva' | 'deity_ganesha';

export const GalleryScreen: React.FC<GalleryScreenProps> = () => {
  const [selectedDeityFilter, setSelectedDeityFilter] = useState<FilterOption>('All');
  
  // Custom hook manages fetching wallpapers and local saved bookmark IDs
  const {
    wallpapers,
    loading,
    error,
    saveWallpaper,
    removeSavedWallpaper,
    savedWallpaperIds,
  } = useGallery(selectedDeityFilter === 'All' ? undefined : selectedDeityFilter);

  const handleShare = async (wallpaper: Wallpaper) => {
    try {
      await Share.share({
        title: wallpaper.title,
        message: `Check out this divine wallpaper of ${wallpaper.title}: ${wallpaper.imageUrl}`,
        url: wallpaper.imageUrl
      });
    } catch (e: any) {
      console.log('Error sharing wallpaper:', e.message);
    }
  };

  const handleSaveToggle = (id: string) => {
    const isSaved = savedWallpaperIds.includes(id);
    if (isSaved) {
      removeSavedWallpaper(id);
      Alert.alert('Saved Wallpapers', 'Wallpaper removed from your saved list.');
    } else {
      saveWallpaper(id);
      Alert.alert('Saved Wallpapers', 'Wallpaper saved! You can view it in your profile.');
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <AppText variant="bodyMd" color={theme.colors.onSurfaceVariant} style={styles.subtitle}>
        Discover a sacred collection of high-resolution wallpapers. Bring the divine presence to your screen with curated spiritual art.
      </AppText>

      {/* Deity Filters row */}
      <View style={styles.filtersRow}>
        <Pressable
          onPress={() => setSelectedDeityFilter('All')}
          style={[styles.filterChip, selectedDeityFilter === 'All' && styles.activeFilterChip]}
        >
          <AppText variant="labelSm" color={selectedDeityFilter === 'All' ? theme.colors.onPrimary : theme.colors.primary}>
            All Deities
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setSelectedDeityFilter('deity_krishna')}
          style={[styles.filterChip, selectedDeityFilter === 'deity_krishna' && styles.activeFilterChip]}
        >
          <AppText variant="labelSm" color={selectedDeityFilter === 'deity_krishna' ? theme.colors.onPrimary : theme.colors.primary}>
            Lord Krishna
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setSelectedDeityFilter('deity_shiva')}
          style={[styles.filterChip, selectedDeityFilter === 'deity_shiva' && styles.activeFilterChip]}
        >
          <AppText variant="labelSm" color={selectedDeityFilter === 'deity_shiva' ? theme.colors.onPrimary : theme.colors.primary}>
            Lord Shiva
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setSelectedDeityFilter('deity_ganesha')}
          style={[styles.filterChip, selectedDeityFilter === 'deity_ganesha' && styles.activeFilterChip]}
        >
          <AppText variant="labelSm" color={selectedDeityFilter === 'deity_ganesha' ? theme.colors.onPrimary : theme.colors.primary}>
            Lord Ganesh
          </AppText>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AppText variant="bodyMd" color={theme.colors.error}>
            Failed to load wallpapers.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={wallpapers}
          renderItem={({ item }) => (
            <GalleryCard
              wallpaper={item}
              isSaved={savedWallpaperIds.includes(item.id)}
              onSaveToggle={handleSaveToggle}
              onShare={handleShare}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

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
  listContent: {
    paddingHorizontal: theme.spacing.containerMargin,
    paddingBottom: theme.spacing.gutter,
  },
  header: {
    marginTop: theme.spacing.gutter,
  },
  subtitle: {
    marginBottom: theme.spacing.gutter,
    lineHeight: 22,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.base,
    marginBottom: theme.spacing.gutter,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryContainer,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primaryContainer, // Saffron active
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
