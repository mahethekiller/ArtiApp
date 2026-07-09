import { useState, useEffect } from 'react';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { Aarti } from '../data/mockData';

// Shared Player State (Singleton style to persist across navigation)
let soundInstance: Audio.Sound | null = null;
let currentAarti: Aarti | null = null;
let isPlaying = false;
let duration = 0; // in milliseconds
let position = 0; // in milliseconds
let playbackSpeed = 1.0;
let isAudioMode = true; // true = audio, false = video mode
let lyricsIndex = 0;

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach(listener => listener());
}

// Configure audio mode for background play and silent mode override
Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  playsInSilentModeIOS: true,
  playThroughEarpieceAndroid: false,
  staysActiveInBackground: true,
  interruptionModeIOS: InterruptionModeIOS.DuckOthers,
  interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
}).catch(err => console.log('Error setting audio mode:', err));

export const useAudioPlayer = () => {
  const [, setTick] = useState(0);

  const forceUpdate = () => setTick(t => t + 1);

  useEffect(() => {
    listeners.add(forceUpdate);
    return () => {
      listeners.delete(forceUpdate);
    };
  }, []);

  // Update synchronized lyrics index based on elapsed seconds
  const updateLyricsIndex = (posMs: number) => {
    if (!currentAarti || !currentAarti.lyrics) return;
    const posSec = posMs / 1000;
    
    let activeIdx = 0;
    for (let i = 0; i < currentAarti.lyrics.length; i++) {
      if (posSec >= currentAarti.lyrics[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }
    
    if (lyricsIndex !== activeIdx) {
      lyricsIndex = activeIdx;
      notifyListeners();
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      isPlaying = status.isPlaying;
      position = status.positionMillis;
      duration = status.durationMillis || currentAarti?.durationSeconds ? (currentAarti?.durationSeconds || 0) * 1000 : 0;
      updateLyricsIndex(status.positionMillis);
      notifyListeners();

      if (status.didJustFinish) {
        isPlaying = false;
        position = 0;
        lyricsIndex = 0;
        notifyListeners();
      }
    } else if (status.error) {
      console.error(`Playback error: ${status.error}`);
    }
  };

  const loadAarti = async (aarti: Aarti, shouldPlay = true) => {
    try {
      if (soundInstance) {
        await soundInstance.unloadAsync();
      }

      currentAarti = aarti;
      isPlaying = false;
      position = 0;
      lyricsIndex = 0;
      notifyListeners();

      const { sound } = await Audio.Sound.createAsync(
        { uri: aarti.audioUrl },
        { 
          shouldPlay, 
          rate: playbackSpeed, 
          shouldCorrectPitch: true 
        },
        onPlaybackStatusUpdate
      );

      soundInstance = sound;
      
      // Get initial duration
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        duration = status.durationMillis || aarti.durationSeconds * 1000;
      }
      notifyListeners();
    } catch (e) {
      console.error('Failed to load audio:', e);
    }
  };

  const play = async () => {
    if (!soundInstance && currentAarti) {
      await loadAarti(currentAarti, true);
      return;
    }
    if (soundInstance) {
      await soundInstance.playAsync();
      isPlaying = true;
      notifyListeners();
    }
  };

  const pause = async () => {
    if (soundInstance) {
      await soundInstance.pauseAsync();
      isPlaying = false;
      notifyListeners();
    }
  };

  const togglePlay = async () => {
    if (isPlaying) {
      await pause();
    } else {
      await play();
    }
  };

  const seek = async (positionMs: number) => {
    if (soundInstance) {
      await soundInstance.setPositionAsync(positionMs);
      position = positionMs;
      updateLyricsIndex(positionMs);
      notifyListeners();
    }
  };

  const setSpeed = async (speed: number) => {
    playbackSpeed = speed;
    if (soundInstance) {
      await soundInstance.setRateAsync(speed, true);
    }
    notifyListeners();
  };

  const toggleAudioVideoMode = async () => {
    isAudioMode = !isAudioMode;
    if (!isAudioMode && isPlaying) {
      // Pause audio when switching to video mode, as video will have its own player
      await pause();
    }
    notifyListeners();
  };

  return {
    currentAarti,
    isPlaying,
    duration,
    position,
    playbackSpeed,
    isAudioMode,
    lyricsIndex,
    loadAarti,
    play,
    pause,
    togglePlay,
    seek,
    setSpeed,
    toggleAudioVideoMode,
  };
};
