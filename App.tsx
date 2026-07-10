import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as Notifications from 'expo-notifications';
import { globalAudioController } from './src/hooks/useAudioPlayer';

export default function App() {
  useEffect(() => {
    // Listen for notification action taps (e.g. Play/Pause, Stop) from lockscreen / notification drawer
    const subscription = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const actionId = response.actionIdentifier;
      if (actionId === 'play_pause') {
        await globalAudioController.togglePlay();
      } else if (actionId === 'next_track') {
        await globalAudioController.playNext();
      } else if (actionId === 'previous_track') {
        await globalAudioController.playPrevious();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
