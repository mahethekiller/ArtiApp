import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TextInput, Pressable, Image, ActivityIndicator, Platform, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { AppText } from '../components/atoms/Text';
import { AartiCard } from '../components/molecules/AartiCard';
import { useAartis } from '../hooks/useAartis';
import { DEITIES, Aarti, Deity } from '../data/mockData';
import { apiService } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export interface AartilistScreenProps {
  readonly navigation: any;
  readonly route: any;
}

type FilterCategory = 'Popular' | 'Morning' | 'Evening';

export const AartilistScreen: React.FC<AartilistScreenProps> = ({ navigation, route }) => {
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('Popular');
  const [deityFilter, setDeityFilter] = useState<string | null>(null);
  const [deities, setDeities] = useState<readonly Deity[]>(DEITIES);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    apiService.getDeities()
      .then(data => setDeities(data))
      .catch(err => console.log('Error loading deities in list:', err));
  }, []);

  // Hook handles loading, search query filtering, favorites lists
  const {
    aartis,
    favorites,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    toggleFavorite,
    refresh
  } = useAartis(deityFilter ? undefined : selectedCategory);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  // Handle parameter from home screen to filter by Deity
  useEffect(() => {
    if (route.params?.deityId) {
      setDeityFilter(route.params.deityId);
      // Clear route params so it doesn't get locked on navigation back
      navigation.setParams({ deityId: undefined });
    }
  }, [route.params?.deityId]);

  const handlePlayAudio = (aarti: Aarti) => {
    navigation.navigate('AartiPlayer', { aartiId: aarti.id, initialMode: 'audio' });
  };

  const handlePlayVideo = (aarti: Aarti) => {
    navigation.navigate('AartiPlayer', { aartiId: aarti.id, initialMode: 'video' });
  };

  const getFilteredAartis = () => {
    if (deityFilter) {
      return aartis.filter(a => a.deityId === deityFilter);
    }
    return aartis;
  };

  const activeDeityName = deityFilter ? deities.find(d => d.id === deityFilter)?.name : '';

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color={theme.colors.outline} style={styles.searchIcon} />
        <TextInput
          placeholder="Search for your favorite Aarti..."
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

      {/* Filter Categories Chips */}
      <View style={styles.chipsRow}>
        {(['Popular', 'Morning', 'Evening'] as FilterCategory[]).map((cat) => (
          <Pressable
            key={cat}
            onPress={() => {
              setSelectedCategory(cat);
              setDeityFilter(null); // Clear deity filter when switching categories
            }}
            style={[
              styles.chip,
              selectedCategory === cat && !deityFilter && styles.activeChip,
            ]}
          >
            <AppText
              variant="labelSm"
              color={selectedCategory === cat && !deityFilter ? theme.colors.onPrimary : theme.colors.primary}
            >
              {cat}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* Active Deity Filter Banner if applicable */}
      {deityFilter ? (
        <View style={styles.activeFilterBadge}>
          <AppText variant="labelSm" color={theme.colors.onPrimary}>
            Deity: {activeDeityName}
          </AppText>
          <Pressable onPress={() => setDeityFilter(null)} style={styles.closeBadge}>
            <Ionicons name="close-circle" size={16} color="#ffffff" />
          </Pressable>
        </View>
      ) : null}

      {/* Trending Today Card banner (Hide if searched or deity filtered) */}
      {!searchQuery && !deityFilter && selectedCategory === 'Popular' ? (
        <Pressable
          onPress={() => navigation.navigate('AartiPlayer', { aartiId: 'aarti_ganesha' })}
          style={styles.trendingCard}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?w=800&auto=format&fit=crop&q=80' }}
            style={styles.trendingImage}
          />
          <View style={styles.trendingBadge}>
            <AppText variant="labelSm" color="#ffffff" style={styles.trendingBadgeText}>
              TRENDING TODAY
            </AppText>
          </View>
          <View style={styles.trendingDetails}>
            <AppText variant="headlineMd" color="#ffffff" style={styles.trendingTitle}>
              Shree Ganesha Aarti
            </AppText>
            <AppText variant="bodyMd" color="rgba(255, 255, 255, 0.9)">
              Sukh Karta Dukh Harta
            </AppText>
          </View>
        </Pressable>
      ) : null}

      <AppText variant="bodyLg" style={styles.listTitle}>
        {deityFilter ? `${activeDeityName} Aartis` : 'Daily Selections'}
      </AppText>
    </View>
  );

  const displayedAartis = getFilteredAartis();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      {loading && displayedAartis.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <AppText variant="bodyMd" color={theme.colors.error}>
            Error: {error}
          </AppText>
          <Pressable onPress={refresh} style={styles.retryBtn}>
            <AppText variant="labelSm" color="#ffffff">
              Retry
            </AppText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={displayedAartis}
          renderItem={({ item }) => (
            <AartiCard
              aarti={item}
              isFavorite={favorites.includes(item.id)}
              onPlayAudio={handlePlayAudio}
              onPlayVideo={handlePlayVideo}
              onToggleFavorite={toggleFavorite}
              deities={deities}
            />
          )}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <AppText variant="bodyMd" color={theme.colors.outline}>
                No Aartis found matching your search.
              </AppText>
            </View>
          }
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
  chipsRow: {
    flexDirection: 'row',
    gap: theme.spacing.base,
    marginBottom: theme.spacing.gutter,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primaryContainer,
    backgroundColor: 'transparent',
  },
  activeChip: {
    backgroundColor: theme.colors.primaryContainer, // Saffron
  },
  activeFilterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    marginBottom: theme.spacing.gutter,
  },
  closeBadge: {
    marginLeft: 6,
  },
  trendingCard: {
    height: 180,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: theme.spacing.gutter,
    elevation: 3,
    shadowColor: theme.colors.glowShadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  trendingImage: {
    width: '100%',
    height: '100%',
  },
  trendingBadge: {
    position: 'absolute',
    top: theme.spacing.gutter,
    left: theme.spacing.gutter,
    backgroundColor: 'rgba(143, 78, 0, 0.85)', // primary color overlay tint
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  trendingBadgeText: {
    fontWeight: theme.typography.weights.bold,
  },
  trendingDetails: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: theme.spacing.gutter,
    backgroundColor: 'rgba(27, 28, 23, 0.45)',
  },
  trendingTitle: {
    fontWeight: theme.typography.weights.bold,
  },
  listTitle: {
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.base,
    marginTop: 8,
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
    paddingHorizontal: 40,
  },
  retryBtn: {
    marginTop: theme.spacing.gutter,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.full,
  },
  emptyContainer: {
    paddingVertical: 40,
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
