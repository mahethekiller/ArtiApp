import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder, Aarti } from '../data/mockData';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function parse12hTimeToHourMin(time12h: string): { hour: number; minute: number } {
  const parts = time12h.trim().split(' ');
  let hour = 0;
  let minute = 0;
  
  if (parts.length === 2) {
    const timeParts = parts[0].split(':');
    if (timeParts.length === 2) {
      hour = parseInt(timeParts[0], 10);
      minute = parseInt(timeParts[1], 10);
      const ampm = parts[1].toUpperCase();
      
      if (ampm === 'PM' && hour < 12) {
        hour += 12;
      }
      if (ampm === 'AM' && hour === 12) {
        hour = 0;
      }
    }
  }
  return { hour, minute };
}

export const notificationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted!');
        return false;
      }
      return true;
    } catch (e) {
      console.warn('Failed to fetch notification permissions:', e);
      return false;
    }
  },

  async scheduleReminderNotification(reminder: Reminder): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      // Cancel any existing notification for this reminder first to avoid duplicates
      await this.cancelReminderNotification(reminder.id);

      const { hour, minute } = parse12hTimeToHourMin(reminder.time);

      await Notifications.scheduleNotificationAsync({
        identifier: reminder.id,
        content: {
          title: reminder.title,
          body: `It's time for your scheduled ${reminder.title}.`,
          sound: true,
        },
        trigger: {
          type: SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
      console.log(`Scheduled notification for reminder ${reminder.id} at ${hour}:${minute}`);
    } catch (e) {
      console.error(`Failed to schedule notification for reminder ${reminder.id}:`, e);
    }
  },

  async cancelReminderNotification(reminderId: string): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.cancelScheduledNotificationAsync(reminderId);
      console.log(`Cancelled notification for reminder ${reminderId}`);
    } catch (e) {
      console.error(`Failed to cancel notification for reminder ${reminderId}:`, e);
    }
  },

  async syncAllReminders(reminders: readonly Reminder[]): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      // Fetch all currently scheduled notifications
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const scheduledIds = scheduled.map(n => n.identifier);

      for (const reminder of reminders) {
        if (reminder.isEnabled) {
          // Schedule or refresh
          await this.scheduleReminderNotification(reminder);
        } else {
          // Cancel if it was scheduled
          if (scheduledIds.includes(reminder.id)) {
            await this.cancelReminderNotification(reminder.id);
          }
        }
      }
    } catch (e) {
      console.error('Failed to sync reminder notifications:', e);
    }
  },

  async showMediaControls(
    aarti: Aarti,
    playing: boolean,
    positionMs?: number,
    durationMs?: number
  ): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return;

      // Ensure the category is set up first
      await Notifications.setNotificationCategoryAsync('media_controls', [
        {
          identifier: 'previous_track',
          buttonTitle: 'Previous ⏮️',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'play_pause',
          buttonTitle: playing ? 'Pause ⏸️' : 'Play ▶️',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'next_track',
          buttonTitle: 'Next ⏭️',
          options: {
            opensAppToForeground: false,
          },
        }
      ]);

      // Calculate progress indicator if play times are provided
      let progressText = '';
      if (positionMs !== undefined && durationMs !== undefined && durationMs > 0) {
        const percent = Math.min(100, Math.max(0, (positionMs / durationMs) * 100));
        const totalBlocks = 8;
        const filledBlocks = Math.round((percent / 100) * totalBlocks);
        const emptyBlocks = totalBlocks - filledBlocks;
        const bar = '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);

        const formatTime = (ms: number) => {
          const totalSecs = Math.floor(ms / 1000);
          const mins = Math.floor(totalSecs / 60);
          const secs = totalSecs % 60;
          return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        };

        progressText = `\n${formatTime(positionMs)} [${bar}] ${formatTime(durationMs)}`;
      } else {
        progressText = ` • ${playing ? 'Playing' : 'Paused'}`;
      }

      // Present a local notification representing the playing media immediately
      await Notifications.scheduleNotificationAsync({
        identifier: 'active_media_player',
        content: {
          title: `🕉️ ${aarti.title}`,
          body: `${aarti.subtitle}${progressText}`,
          sound: false,
          categoryIdentifier: 'media_controls',
          sticky: playing,
        },
        trigger: null,
      });
    } catch (e) {
      console.error('Failed to show media controls notification:', e);
    }
  },

  async dismissMediaControls(): Promise<void> {
    if (Platform.OS === 'web') return;

    try {
      await Notifications.dismissNotificationAsync('active_media_player');
      console.log('Dismissed media notification controls');
    } catch (e) {
      console.error('Failed to dismiss media controls notification:', e);
    }
  }
};
