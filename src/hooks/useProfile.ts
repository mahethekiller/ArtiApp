import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { Reminder } from '../data/mockData';

export const useProfile = () => {
  const [profile, setProfile] = useState<{
    name: string;
    gotra: string;
    rashi: string;
    streakCount: number;
    lastPrayerDate: string;
  } | null>(null);
  const [reminders, setReminders] = useState<readonly Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileAndReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profData, remsData] = await Promise.all([
        apiService.getProfile(),
        apiService.getReminders(),
      ]);
      setProfile(profData);
      setReminders(remsData);
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

  return {
    profile,
    reminders,
    loading,
    error,
    updateProfile,
    completeDailyPrayer,
    toggleReminder,
    addReminder,
    refresh: fetchProfileAndReminders,
  };
};
