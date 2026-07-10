import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, ActivityIndicator, Share, Alert, Modal, RefreshControl, TextInput, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { AppText } from '../components/atoms/Text';
import { GalleryCard } from '../components/molecules/GalleryCard';
import { useGallery } from '../hooks/useGallery';
import { DEITIES, Wallpaper } from '../data/mockData';
import { Ionicons } from '@expo/vector-icons';

export interface GalleryScreenProps {
  readonly navigation: any;
}

type FilterOption = 'All' | 'deity_krishna' | 'deity_shiva' | 'deity_ganesha';

export const GalleryScreen: React.FC<GalleryScreenProps> = () => {
  const [selectedDeityFilter, setSelectedDeityFilter] = useState<FilterOption>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  
  const [refreshing, setRefreshing] = useState(false);

  // Custom hook manages fetching wallpapers and local saved bookmark IDs
  const {
    wallpapers,
    loading,
    error,
    saveWallpaper,
    removeSavedWallpaper,
    savedWallpaperIds,
    refresh,
  } = useGallery(selectedDeityFilter === 'All' ? undefined : selectedDeityFilter);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const displayedWallpapers = wallpapers.filter(w => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return w.title.toLowerCase().includes(query);
  });

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
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={theme.colors.outline} style={styles.searchIcon} />
        <TextInput
          placeholder="Search for divine wallpapers..."
          placeholderTextColor={theme.colors.outline}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery ? (
          <Pressable onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={theme.colors.outline} />
          </Pressable>
        ) : null}
      </View>

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
          data={displayedWallpapers}
          numColumns={2}
          key={`gallery-grid-${selectedDeityFilter}`}
          renderItem={({ item }) => (
            <GalleryCard
              wallpaper={item}
              onPress={() => setSelectedWallpaper(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader()}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={Platform.OS === 'android'}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}

      {/* Fullscreen Wallpaper Viewer Modal */}
      <Modal
        visible={selectedWallpaper !== null}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setSelectedWallpaper(null)}
      >
        <SafeAreaView style={styles.fullscreenContainer}>
          {selectedWallpaper ? (
            <>
              {/* Fullscreen Image */}
              <Image
                source={{ uri: selectedWallpaper.imageUrl }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />

              {/* Close Button */}
              <Pressable
                onPress={() => setSelectedWallpaper(null)}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close image viewer"
              >
                <Ionicons name="close" size={28} color="#ffffff" />
              </Pressable>

              {/* Footer controls */}
              <View style={styles.fullscreenFooter}>
                <View style={styles.footerTextContainer}>
                  <AppText variant="headlineMd" color="#ffffff" style={styles.footerTitle}>
                    {selectedWallpaper.title}
                  </AppText>
                  <AppText variant="bodyMd" color="rgba(255, 255, 255, 0.7)">
                    Sacred Wallpaper Art
                  </AppText>
                </View>

                <View style={styles.footerActions}>
                  <Pressable
                    onPress={() => {
                      handleSaveToggle(selectedWallpaper.id);
                    }}
                    style={styles.footerActionBtn}
                  >
                    <Ionicons
                      name={savedWallpaperIds.includes(selectedWallpaper.id) ? 'bookmark' : 'bookmark-outline'}
                      size={24}
                      color={savedWallpaperIds.includes(selectedWallpaper.id) ? theme.colors.secondaryContainer : '#ffffff'}
                    />
                    <AppText variant="labelSm" color="#ffffff" style={styles.footerActionText}>
                      {savedWallpaperIds.includes(selectedWallpaper.id) ? 'Saved' : 'Save'}
                    </AppText>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      handleShare(selectedWallpaper);
                    }}
                    style={styles.footerActionBtn}
                  >
                    <Ionicons name="share-social-outline" size={24} color="#ffffff" />
                    <AppText variant="labelSm" color="#ffffff" style={styles.footerActionText}>
                      Share
                    </AppText>
                  </Pressable>
                </View>
              </View>
            </>
          ) : null}
        </SafeAreaView>
      </Modal>

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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceContainerLowest,
    height: 48,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.gutter,
    borderWidth: 1,
    borderColor: theme.colors.surfaceContainer,
    marginBottom: theme.spacing.gutter,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' }),
    fontSize: theme.typography.sizes.bodyMd,
    color: theme.colors.onSurface,
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
  columnWrapper: {
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  fullscreenFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 24,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  footerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  footerTitle: {
    fontWeight: theme.typography.weights.bold,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 20,
  },
  footerActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerActionText: {
    marginTop: 4,
    fontSize: 10,
    fontWeight: theme.typography.weights.medium,
  },
});
