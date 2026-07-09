import axios from 'axios';
import { CONFIG } from '../config';
import { AARTIS, DEITIES, WALLPAPERS, INITIAL_REMINDERS, Aarti, Deity, Wallpaper, Reminder } from '../data/mockData';

const api = axios.create({
  baseURL: CONFIG.API_URL,
  timeout: 5000,
});

// Cache variables for mock state persistence when offline
let mockFavorites: string[] = ['aarti_ganesha', 'aarti_shiva'];
let mockReminders: Reminder[] = [...INITIAL_REMINDERS];
let mockProfile = {
  name: 'Jay Shreeram',
  gotra: 'Vashishta',
  rashi: 'Aries',
  streakCount: 3,
  lastPrayerDate: new Date().toISOString().split('T')[0],
};

export const apiService = {
  async getDeities(): Promise<Deity[]> {
    try {
      const res = await api.get('/deities');
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        return [...DEITIES];
      }
      throw e;
    }
  },

  async getAartis(category?: string): Promise<Aarti[]> {
    try {
      const res = await api.get('/aartis', { params: { category } });
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        if (category && category !== 'Popular') {
          return AARTIS.filter(a => a.category === category);
        }
        return [...AARTIS];
      }
      throw e;
    }
  },

  async getAartiDetails(id: string): Promise<Aarti> {
    try {
      const res = await api.get(`/aartis/${id}`);
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        const aarti = AARTIS.find(a => a.id === id);
        if (aarti) return aarti;
        throw new Error('Aarti not found');
      }
      throw e;
    }
  },

  async getGallery(): Promise<Wallpaper[]> {
    try {
      const res = await api.get('/gallery');
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        return [...WALLPAPERS];
      }
      throw e;
    }
  },

  async getProfile(): Promise<typeof mockProfile> {
    try {
      const res = await api.get('/profile');
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        return mockProfile;
      }
      throw e;
    }
  },

  async updateProfile(profileData: { name: string; gotra: string; rashi: string }): Promise<typeof mockProfile> {
    try {
      const res = await api.put('/profile', profileData);
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        mockProfile = {
          ...mockProfile,
          ...profileData,
        };
        return mockProfile;
      }
      throw e;
    }
  },

  async incrementStreak(): Promise<typeof mockProfile> {
    try {
      const res = await api.post('/profile/streak');
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        const today = new Date().toISOString().split('T')[0];
        if (mockProfile.lastPrayerDate !== today) {
          mockProfile.streakCount += 1;
          mockProfile.lastPrayerDate = today;
        }
        return mockProfile;
      }
      throw e;
    }
  },

  async getFavorites(): Promise<string[]> {
    try {
      const res = await api.get('/favorites');
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        return mockFavorites;
      }
      throw e;
    }
  },

  async toggleFavorite(aartiId: string): Promise<boolean> {
    try {
      const res = await api.post('/favorites/toggle', { aarti_id: aartiId });
      return res.data.is_favorite;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        const isFav = mockFavorites.includes(aartiId);
        if (isFav) {
          mockFavorites = mockFavorites.filter(id => id !== aartiId);
          return false;
        } else {
          mockFavorites.push(aartiId);
          return true;
        }
      }
      throw e;
    }
  },

  async getReminders(): Promise<Reminder[]> {
    try {
      const res = await api.get('/reminders');
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        return mockReminders;
      }
      throw e;
    }
  },

  async toggleReminder(id: string, isEnabled: boolean): Promise<Reminder> {
    try {
      const res = await api.put(`/reminders/${id}`, { is_enabled: isEnabled });
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        const remIndex = mockReminders.findIndex(r => r.id === id);
        if (remIndex > -1) {
          mockReminders[remIndex] = {
            ...mockReminders[remIndex],
            isEnabled,
          };
          return mockReminders[remIndex];
        }
        throw new Error('Reminder not found');
      }
      throw e;
    }
  },

  async addReminder(title: string, time: string): Promise<Reminder> {
    try {
      const res = await api.post('/reminders', { title, time });
      return res.data.data;
    } catch (e) {
      if (CONFIG.FALLBACK_TO_MOCK) {
        const newRem: Reminder = {
          id: `rem_${Date.now()}`,
          title,
          time,
          isEnabled: true,
        };
        mockReminders.push(newRem);
        return newRem;
      }
      throw e;
    }
  }
};
