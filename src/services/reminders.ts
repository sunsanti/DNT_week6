import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import type { Booking } from '@/types';
import { formatTimeRange } from '@/utils/formatTime';
import { formatSeats } from '@/utils/formatSeats';
import { reminderTime } from '@/utils/reminderTime';

const CHANNEL_ID = 'reminders';
type Notifications = typeof import('expo-notifications');

// Loaded lazily inside try/catch. Never imported in Expo Go: since SDK 53 the package throws on
// import there (remote push removed), so reminders only work in a development build / APK.
let loading: Promise<Notifications | null> | undefined;
function load(): Promise<Notifications | null> {
  if (Platform.OS === 'web' || isRunningInExpoGo()) return Promise.resolve(null);
  loading ??= import('expo-notifications')
    .then((N) => {
      N.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      return N;
    })
    .catch(() => null);
  return loading;
}

// Call once at app start so reminders that fire while the app is open still show.
export function initReminders(): void {
  void load();
}

async function ensurePermission(N: Notifications): Promise<boolean> {
  if (Platform.OS === 'android') {
    await N.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Booking reminders',
      importance: N.AndroidImportance.HIGH,
    });
  }
  const current = await N.getPermissionsAsync();
  if (current.granted) return true;
  return (await N.requestPermissionsAsync()).granted;
}

// The booking id doubles as the notification id, so cancelReminder needs no lookup table.
export async function scheduleReminder(booking: Booking, roomName: string): Promise<void> {
  try {
    const N = await load();
    const date = reminderTime(booking.slot.start);
    if (!N || !date || !(await ensurePermission(N))) return;
    await N.scheduleNotificationAsync({
      identifier: booking.id,
      content: {
        title: `Upcoming: ${roomName}`,
        body: `${formatSeats(booking.seatIds)}, ${formatTimeRange(booking.slot.start, booking.slot.end)}`,
      },
      trigger: { type: N.SchedulableTriggerInputTypes.DATE, date, channelId: CHANNEL_ID },
    });
  } catch {
    // A missing reminder must never block the booking itself.
  }
}

export async function cancelReminder(bookingId: string): Promise<void> {
  try {
    await (await load())?.cancelScheduledNotificationAsync(bookingId);
  } catch {
    // Nothing scheduled — fine.
  }
}
