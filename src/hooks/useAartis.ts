import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Aarti } from '../data/mockData';

export const useAartis = (category?: string) => {
  const [aartis, setAartis] = useState<readonly Aarti[]>([]);
  const [favorites, setFavorites] = useState<readonly string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [aartisList, favsList] = await Promise.all([
        apiService.getAartis(category),
        apiService.getFavorites(),
      ]);
      setAartis(aartisList);
      setFavorites(favsList);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  const toggleFavorite = async (aartiId: string) => {
    setLoading(true);
    try {
      const isFavNow = await apiService.toggleFavorite(aartiId);
      if (isFavNow) {
        setFavorites(prev => [...prev, aartiId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== aartiId));
      }
      return isFavNow;
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
      return favorites.includes(aartiId);
    } finally {
      setLoading(false);
    }
  };

  const filteredAartis = aartis.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      item.title.toLowerCase().includes(query) ||
      item.subtitle.toLowerCase().includes(query)
    );
  });

  return {
    aartis: filteredAartis,
    favorites,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    toggleFavorite,
    refresh: fetchData,
  };
};
