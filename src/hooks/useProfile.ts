import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Reminder, Aarti } from '../data/mockData';

export interface UserProfile {
  name: string;
  email?: string;
  gotra: string;
  rashi: string;
  streakCount: number;
  lastPrayerDate: string;
  isGuest?: boolean;
}

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reminders, setReminders] = useState<readonly Reminder[]>([]);
  const [favoriteAartis, setFavoriteAartis] = useState<readonly Aarti[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileAndReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profData, remsData, favIds, allAartis] = await Promise.all([
        apiService.getProfile(),
        apiService.getReminders(),
        apiService.getFavorites(),
        apiService.getAartis(),
      ]);
      setProfile(profData);
      setReminders(remsData);
      
      // Filter the actual Aartis list using the user's favorite IDs from the API
      const userFavs = allAartis.filter(a => favIds.includes(a.id));
      setFavoriteAartis(userFavs);
    } catch (e: any) {
      setError(e.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndReminders();
  }, []);

  const updateProfile = async (name: string, gotra: string, rashi: string) => {
    try {
      const updated = await apiService.updateProfile({ name, gotra, rashi });
      setProfile(updated);
      return true;
    } catch (e) {
      console.error('Failed to update profile:', e);
      return false;
    }
  };

  const completeDailyPrayer = async () => {
    try {
      const updated = await apiService.incrementStreak();
      setProfile(updated);
      return true;
    } catch (e) {
      console.error('Failed to increment streak:', e);
      return false;
    }
  };

  const toggleReminder = async (id: string, isEnabled: boolean) => {
    try {
      const updated = await apiService.toggleReminder(id, isEnabled);
      setReminders(prev => prev.map(r => r.id === id ? updated : r));
      return true;
    } catch (e) {
      console.error('Failed to toggle reminder:', e);
      return false;
    }
  };

  const addReminder = async (title: string, time: string) => {
    try {
      const newRem = await apiService.addReminder(title, time);
      setReminders(prev => [...prev, newRem]);
      return true;
    } catch (e) {
      console.error('Failed to add reminder:', e);
      return false;
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      const updated = await apiService.login(credentials);
      setProfile(updated);
      await fetchProfileAndReminders();
      return true;
    } catch (e) {
      console.error('Failed to login:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const register = async (profileData: { email: string; password: string; name?: string; gotra?: string; rashi?: string }) => {
    try {
      setLoading(true);
      const updated = await apiService.register(profileData);
      setProfile(updated);
      await fetchProfileAndReminders();
      return true;
    } catch (e) {
      console.error('Failed to register:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiService.logout();
      setProfile(null);
      await fetchProfileAndReminders();
      return true;
    } catch (e) {
      console.error('Failed to logout:', e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    reminders,
    favoriteAartis,
    loading,
    error,
    updateProfile,
    completeDailyPrayer,
    toggleReminder,
    addReminder,
    login,
    register,
    logout,
    refresh: fetchProfileAndReminders,
  };
};
