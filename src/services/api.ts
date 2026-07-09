import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// --- AUTHENTICATION FLOW (SANCTUM SEAMLESS INTEGRATION) ---

let authToken: string | null = null;
let authPromise: Promise<string | null> | null = null;

async function performAuth(): Promise<string | null> {
  try {
    // 1. Check if token is already persisted
    const savedToken = await AsyncStorage.getItem('auth_token');
    if (savedToken) {
      authToken = savedToken;
      return savedToken;
    }

    // 2. Default credentials for guest account
    const email = 'guest_user@artiapp.com';
    const password = 'password123';

    // Try logging in
    try {
      const loginRes = await api.post('/login', { email, password });
      if (loginRes.data && loginRes.data.token) {
        const token = loginRes.data.token;
        await AsyncStorage.setItem('auth_token', token);
        authToken = token;
        return token;
      }
    } catch (err: any) {
      // If login failed because user doesn't exist, register them
      if (err.response && (err.response.status === 401 || err.response.status === 404)) {
        try {
          const registerRes = await api.post('/register', {
            email,
            password,
            name: 'Seeker of Peace',
          });
          if (registerRes.data && registerRes.data.token) {
            const token = registerRes.data.token;
            await AsyncStorage.setItem('auth_token', token);
            authToken = token;
            return token;
          }
        } catch (regErr) {
          console.warn('Seamless auto-registration failed:', regErr);
        }
      } else {
        console.warn('Seamless auto-login connection error:', err);
      }
    }
  } catch (storageErr) {
    console.warn('AsyncStorage access error:', storageErr);
  }
  return null;
}

function ensureAuthenticated(): Promise<string | null> {
  if (authToken) {
    return Promise.resolve(authToken);
  }
  if (!authPromise) {
    authPromise = performAuth().then((token) => {
      authPromise = null;
      return token;
    });
  }
  return authPromise;
}

// Axios Request Interceptor to append the Sanctum token
api.interceptors.request.use(
  async (config) => {
    // Skip to prevent infinite loop recursion on login/register calls
    if (config.url === '/login' || config.url === '/register') {
      return config;
    }
    const token = await ensureAuthenticated();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- MAPPING UTILITIES ---

function mapApiDeityToDeity(apiDeity: any): Deity {
  return {
    id: String(apiDeity.id),
    name: apiDeity.name,
    description: apiDeity.description,
    image: apiDeity.image_url || apiDeity.image || 'https://images.unsplash.com/photo-1566378246598-5b11a0d486cc?w=400',
  };
}

function mapApiAartiToAarti(apiAarti: any): Aarti {
  // Extract YouTube Video ID from full URL if needed
  let videoId = apiAarti.video_url || apiAarti.videoId || '';
  if (videoId.includes('youtube.com') || videoId.includes('youtu.be')) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = videoId.match(regExp);
    if (match && match[2].length === 11) {
      videoId = match[2];
    }
  }

  // Parse duration to seconds (e.g. "03:15" -> 195 seconds)
  let durationSeconds = 0;
  if (apiAarti.duration) {
    const parts = apiAarti.duration.split(':');
    if (parts.length === 2) {
      durationSeconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
  }

  // Map lyrics key: 'timestamp' -> 'time'
  const lyrics = (apiAarti.lyrics || []).map((l: any) => ({
    time: l.timestamp !== undefined ? l.timestamp : (l.time !== undefined ? l.time : 0),
    text: l.text || '',
  }));

  return {
    id: String(apiAarti.id),
    deityId: String(apiAarti.deity_id || apiAarti.deityId),
    title: apiAarti.title,
    subtitle: apiAarti.subtitle,
    category: apiAarti.category,
    duration: apiAarti.duration,
    durationSeconds: durationSeconds || apiAarti.durationSeconds || 180,
    audioUrl: apiAarti.audio_url || apiAarti.audioUrl,
    videoId: videoId,
    lyrics: lyrics,
  };
}

function mapApiWallpaperToWallpaper(apiWp: any): Wallpaper {
  return {
    id: String(apiWp.id),
    deityId: apiWp.deity_id ? String(apiWp.deity_id) : undefined,
    title: apiWp.title,
    imageUrl: apiWp.image_url || apiWp.imageUrl,
  };
}

function mapApiProfileToProfile(apiUser: any) {
  return {
    name: apiUser.name || 'Seeker of Peace',
    gotra: apiUser.gotra || '',
    rashi: apiUser.rashi || '',
    streakCount: apiUser.streak_count || 0,
    lastPrayerDate: apiUser.last_prayer_date || '',
  };
}

function mapApiReminderToReminder(apiRem: any): Reminder {
  // Convert 24h format '06:00:00' to 12h AM/PM '06:00 AM'
  let formattedTime = apiRem.time;
  if (formattedTime && formattedTime.split(':').length >= 2) {
    const parts = formattedTime.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    formattedTime = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }

  return {
    id: String(apiRem.id),
    title: apiRem.title,
    time: formattedTime,
    isEnabled: Boolean(apiRem.is_enabled),
  };
}

function convertTime12hTo24h(time12h: string): string {
  // e.g. "06:00 AM" -> "06:00:00"
  const parts = time12h.trim().split(' ');
  if (parts.length === 2) {
    const timeParts = parts[0].split(':');
    if (timeParts.length === 2) {
      let hours = parseInt(timeParts[0], 10);
      const minutes = timeParts[1];
      const ampm = parts[1].toUpperCase();
      
      if (ampm === 'PM' && hours < 12) {
        hours += 12;
      }
      if (ampm === 'AM' && hours === 12) {
        hours = 0;
      }
      return `${hours.toString().padStart(2, '0')}:${minutes}:00`;
    }
  }
  return time12h;
}

// --- API ACTIONS SERVICE ---

export const apiService = {
  async getDeities(): Promise<Deity[]> {
    try {
      const res = await api.get('/deities');
      return (res.data.data || []).map(mapApiDeityToDeity);
    } catch (e) {
      console.warn('API getDeities failed, falling back to mock data. Error:', e);
      if (CONFIG.FALLBACK_TO_MOCK) {
        return [...DEITIES];
      }
      throw e;
    }
  },

  async getAartis(category?: string): Promise<Aarti[]> {
    try {
      const res = await api.get('/aartis', { params: { category } });
      return (res.data.data || []).map(mapApiAartiToAarti);
    } catch (e) {
      console.warn('API getAartis failed, falling back to mock data. Error:', e);
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
      return mapApiAartiToAarti(res.data.data);
    } catch (e) {
      console.warn(`API getAartiDetails for ID ${id} failed, falling back to mock data. Error:`, e);
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
      return (res.data.data || []).map(mapApiWallpaperToWallpaper);
    } catch (e) {
      console.warn('API getGallery failed, falling back to mock data. Error:', e);
      if (CONFIG.FALLBACK_TO_MOCK) {
        return [...WALLPAPERS];
      }
      throw e;
    }
  },

  async getProfile(): Promise<typeof mockProfile> {
    try {
      const res = await api.get('/profile');
      return mapApiProfileToProfile(res.data.data);
    } catch (e) {
      console.warn('API getProfile failed, falling back to mock data. Error:', e);
      if (CONFIG.FALLBACK_TO_MOCK) {
        return mockProfile;
      }
      throw e;
    }
  },

  async updateProfile(profileData: { name: string; gotra: string; rashi: string }): Promise<typeof mockProfile> {
    try {
      const res = await api.put('/profile', profileData);
      return mapApiProfileToProfile(res.data.data);
    } catch (e) {
      console.warn('API updateProfile failed, falling back to mock data. Error:', e);
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
      return mapApiProfileToProfile(res.data.data);
    } catch (e) {
      console.warn('API incrementStreak failed, falling back to mock data. Error:', e);
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
      return (res.data.data || []).map((fav: any) => String(fav.aarti_id));
    } catch (e) {
      console.warn('API getFavorites failed, falling back to mock data. Error:', e);
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
      console.warn('API toggleFavorite failed, falling back to mock data. Error:', e);
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
      return (res.data.data || []).map(mapApiReminderToReminder);
    } catch (e) {
      console.warn('API getReminders failed, falling back to mock data. Error:', e);
      if (CONFIG.FALLBACK_TO_MOCK) {
        return mockReminders;
      }
      throw e;
    }
  },

  async toggleReminder(id: string, isEnabled: boolean): Promise<Reminder> {
    try {
      const res = await api.put(`/reminders/${id}`, { is_enabled: isEnabled });
      return mapApiReminderToReminder(res.data.data);
    } catch (e) {
      console.warn(`API toggleReminder for ID ${id} failed, falling back to mock data. Error:`, e);
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
      const apiTime = convertTime12hTo24h(time);
      const res = await api.post('/reminders', { title, time: apiTime });
      return mapApiReminderToReminder(res.data.data);
    } catch (e) {
      console.warn('API addReminder failed, falling back to mock data. Error:', e);
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
