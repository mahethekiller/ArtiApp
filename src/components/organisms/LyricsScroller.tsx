import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, FlatList, Dimensions } from 'react-native';
import { theme } from '../../theme';
import { LyricLine } from '../../data/mockData';
import { AppText } from '../atoms/Text';

export interface LyricsScrollerProps {
  readonly lyrics: readonly LyricLine[];
  readonly lyricsIndex: number;
}

export const LyricsScroller: React.FC<LyricsScrollerProps> = ({
  lyrics,
  lyricsIndex,
}) => {
  const listRef = useRef<FlatList<LyricLine>>(null);

  useEffect(() => {
    if (lyrics.length > 0 && lyricsIndex >= 0 && lyricsIndex < lyrics.length) {
      listRef.current?.scrollToIndex({
        index: lyricsIndex,
        animated: true,
        viewPosition: 0.5, // Centers the active item
      });
    }
  }, [lyricsIndex, lyrics]);

  const renderItem = ({ item, index }: { item: LyricLine; index: number }) => {
    const isActive = index === lyricsIndex;

    return (
      <View style={[styles.lyricRow, isActive && styles.activeLyricRow]}>
        <AppText
          variant={isActive ? 'bodyLg' : 'bodyMd'}
          color={isActive ? theme.colors.primary : theme.colors.outline}
          style={[styles.lyricText, isActive && styles.activeLyricText]}
        >
          {item.text}
        </AppText>
      </View>
    );
  };

  if (!lyrics || lyrics.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <AppText variant="bodyMd" color={theme.colors.outline}>
          No lyrics available for this Aarti.
        </AppText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={lyrics as LyricLine[]}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.time}_${index}`}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: 60, // Fixed height for smooth scrolling layout
          offset: 60 * index,
          index,
        })}
        // Avoid rendering issue when layout changes
        onScrollToIndexFailed={(info) => {
          const wait = new Promise(resolve => setTimeout(resolve, 50));
          wait.then(() => {
            listRef.current?.scrollToIndex({
              index: info.index,
              animated: true,
              viewPosition: 0.5
            });
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 180, // Restrict height to show 3 lines clearly
    marginVertical: theme.spacing.gutter,
  },
  listContent: {
    paddingVertical: 60, // padding to allow top/bottom items to center
  },
  lyricRow: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.gutter,
    opacity: 0.4,
  },
  activeLyricRow: {
    opacity: 1.0,
    transform: [{ scale: 1.05 }],
  },
  lyricText: {
    textAlign: 'center',
    fontWeight: theme.typography.weights.medium,
  },
  activeLyricText: {
    fontWeight: theme.typography.weights.bold,
  },
  emptyContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
