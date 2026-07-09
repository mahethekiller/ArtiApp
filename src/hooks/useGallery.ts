import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Wallpaper } from '../data/mockData';

// Shared state for downloaded/saved wallpapers to show in Profile
let savedWallpaperIds: string[] = ['wp_mandala', 'wp_ganga', 'wp_peacock', 'wp_lotus'];
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

export const useGallery = (deityId?: string) => {
  const [wallpapers, setWallpapers] = useState<readonly Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  const forceUpdate = () => setTick(t => t + 1);

  useEffect(() => {
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
    };
  }, []);

  const fetchWallpapers = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await apiService.getGallery();
      setWallpapers(list);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch wallpapers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallpapers();
  }, []);

  const saveWallpaper = (wallpaperId: string) => {
    if (!savedWallpaperIds.includes(wallpaperId)) {
      savedWallpaperIds.push(wallpaperId);
      notifyListeners();
      return true;
    }
    return false;
  };

  const removeSavedWallpaper = (wallpaperId: string) => {
    savedWallpaperIds = savedWallpaperIds.filter(id => id !== wallpaperId);
    notifyListeners();
  };

  const filteredWallpapers = deityId 
    ? wallpapers.filter(w => w.deityId === deityId)
    : wallpapers;

  const savedWallpapersList = wallpapers.filter(w => savedWallpaperIds.includes(w.id));

  return {
    wallpapers: filteredWallpapers,
    savedWallpapers: savedWallpapersList,
    savedWallpaperIds,
    loading,
    error,
    saveWallpaper,
    removeSavedWallpaper,
    refresh: fetchWallpapers,
  };
};
