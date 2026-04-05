import { LocalNotifications } from '@capacitor/local-notifications';

export async function checkNotificationsAvailable(): Promise<boolean> {
  try {
    const result = await LocalNotifications.checkPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleDailyReminder(): Promise<void> {
  try {
    const available = await checkNotificationsAvailable();
    if (!available) {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }

    await cancelDailyReminder();

    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      18,
      0,
      0
    );

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: 1,
          title: 'Time to Study! 🔥',
          body: "Don't break your streak! Complete your daily review now.",
          schedule: { at: scheduledTime, every: 'day' },
          sound: 'default',
          smallIcon: 'ic_stat_icon_config_sample',
          largeIcon: 'ic_launcher',
          attachments: [],
          actionTypeId: '',
          extra: null,
        },
      ],
    });
  } catch (error) {
    console.error('Failed to schedule notification:', error);
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: 1 }],
    });
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

export async function rescheduleReminder(): Promise<void> {
  await cancelDailyReminder();
  await scheduleDailyReminder();
}
