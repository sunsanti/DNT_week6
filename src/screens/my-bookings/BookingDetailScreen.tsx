import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CheckCircle, XCircle } from 'phosphor-react-native';
import type { MyBookingsStackParamList } from '@/navigation/types';
import { useMyBookings } from '@/services/api/useMyBookings';
import { useCancelBooking } from '@/services/api/useCancelBooking';
import { useRoom } from '@/services/api/useRoom';
import { RoomInfo } from '@/components/RoomInfo/RoomInfo';
import { useToastStore } from '@/store/useToastStore';
import { useUserId } from '@/store/useSessionStore';
import { cancelReminder } from '@/services/reminders';
import { formatTimeRange } from '@/utils/formatTime';
import { formatSeats } from '@/utils/formatSeats';
import { fonts, minTouchTarget, radius, spacing, useThemeColors } from '@/constants/theme';

type Props = NativeStackScreenProps<MyBookingsStackParamList, 'BookingDetail'>;

export function BookingDetailScreen({ route, navigation }: Props) {
  const colors = useThemeColors();
  const { bookingId } = route.params;
  const userId = useUserId();
  const { data: bookings, isLoading } = useMyBookings(userId);
  const showToast = useToastStore((s) => s.show);
  const cancelBooking = useCancelBooking(userId);
  const booking = bookings?.find((b) => b.id === bookingId);
  const { data: room } = useRoom(booking?.roomId ?? '');

  if (isLoading || !booking) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const canCancel = booking.status === 'confirmed';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.time, { color: colors.text }]}>{room?.name}</Text>
      {room && <RoomInfo room={room} />}
      <Text style={[styles.status, { color: colors.textMuted }]}>
        {formatSeats(booking.seatIds)} · {formatTimeRange(booking.slot.start, booking.slot.end)}
      </Text>
      <View style={styles.statusRow}>
        {canCancel ? (
          <CheckCircle size={16} color={colors.accent} weight="fill" />
        ) : (
          <XCircle size={16} color={colors.destructive} weight="fill" />
        )}
        <Text style={[styles.status, { color: canCancel ? colors.accent : colors.destructive }]}>
          {canCancel ? 'Confirmed' : 'Cancelled'}
        </Text>
      </View>

      {canCancel && (
        <Pressable
          style={({ pressed }) => [
            styles.cancelButton,
            { backgroundColor: colors.destructive },
            pressed && styles.cancelButtonPressed,
          ]}
          disabled={cancelBooking.isPending}
          onPress={() =>
            cancelBooking.mutate(booking.id, {
              onSuccess: () => {
                cancelReminder(booking.id);
                showToast('Booking cancelled');
                navigation.goBack();
              },
            })
          }
          accessibilityRole="button"
        >
          <Text style={[styles.cancelButtonText, { color: colors.onPrimary }]}>
            {cancelBooking.isPending ? 'Cancelling...' : 'Cancel booking'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    fontFamily: fonts.bold,
    fontSize: 18,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  status: {
    fontFamily: fonts.regular,
    fontSize: 14,
  },
  cancelButton: {
    marginTop: spacing.lg,
    minHeight: minTouchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.85,
  },
  cancelButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
});
