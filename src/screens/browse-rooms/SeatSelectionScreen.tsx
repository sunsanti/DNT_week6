import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BrowseRoomsStackParamList } from '@/navigation/types';
import { useRoomBookings } from '@/services/api/useRoomBookings';
import { useCreateBooking } from '@/services/api/useCreateBooking';
import { useRoom } from '@/services/api/useRoom';
import { BookingConflictError } from '@/services/api/mock/db';
import { takenSeatIds } from '@/utils/overlapCheck';
import { formatTimeRange } from '@/utils/formatTime';
import { formatSeats } from '@/utils/formatSeats';
import { SeatMap } from '@/components/SeatMap/SeatMap';
import { scheduleReminder } from '@/services/reminders';
import { useUserId } from '@/store/useSessionStore';
import { useToastStore } from '@/store/useToastStore';
import { useBookingDraftStore } from '@/store/useBookingDraftStore';
import { fonts, minTouchTarget, radius, spacing, useThemeColors } from '@/constants/theme';

type Props = NativeStackScreenProps<BrowseRoomsStackParamList, 'SeatSelection'>;

export function SeatSelectionScreen({ route, navigation }: Props) {
  const colors = useThemeColors();
  const { roomId, slot } = route.params;
  const { data: bookings, isLoading } = useRoomBookings(roomId);
  const { data: room } = useRoom(roomId);
  const createBooking = useCreateBooking();
  const seatIds = useBookingDraftStore((s) => s.seatIds);
  const toggleSeat = useBookingDraftStore((s) => s.toggleSeat);
  const clearDraft = useBookingDraftStore((s) => s.clear);
  const userId = useUserId();
  const showToast = useToastStore((s) => s.show);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !room) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const takenIds = takenSeatIds(bookings ?? [], slot);
  const left = room.capacity - takenIds.size;
  const canConfirm = seatIds.length > 0 && seatIds.every((id) => !takenIds.has(id));
  const when = `${new Date(slot.start).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })} · ${formatTimeRange(slot.start, slot.end)}`;

  const handleConfirm = () => {
    createBooking.mutate(
      { roomId, userId, slot, seatIds },
      {
        onSuccess: (booking) => {
          scheduleReminder(booking, room.name);
          showToast(
            `Booking confirmed · ${formatSeats(seatIds)} · ${formatTimeRange(slot.start, slot.end)}`,
          );
          clearDraft();
          navigation.popToTop();
        },
        onError: (err) => {
          setError(
            err instanceof BookingConflictError
              ? err.message
              : 'Could not create the booking. Please try again.',
          );
        },
      },
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>{room.name}</Text>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{when}</Text>

      <View
        style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Text style={[styles.left, { color: left > 0 ? colors.accent : colors.destructive }]}>
          {left} of {room.capacity} seats left
        </Text>
        <Text style={[styles.sub, { color: colors.textMuted }]}>
          {seatIds.length > 0 ? `Selected: ${formatSeats(seatIds)}` : 'Tap a seat to select it'}
        </Text>
      </View>

      <SeatMap
        capacity={room.capacity}
        takenIds={takenIds}
        selectedIds={seatIds}
        onToggle={(id) => {
          setError(null);
          toggleSeat(id);
        }}
      />

      {error && (
        <Text style={[styles.error, { color: colors.destructive }]} accessibilityRole="alert">
          {error}
        </Text>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: canConfirm ? colors.primary : colors.disabled },
          pressed && canConfirm && styles.ctaPressed,
        ]}
        disabled={!canConfirm || createBooking.isPending}
        onPress={handleConfirm}
        accessibilityRole="button"
      >
        <Text style={[styles.ctaText, { color: colors.onPrimary }]}>
          {createBooking.isPending
            ? 'Booking...'
            : canConfirm
              ? `Confirm ${seatIds.length} seat${seatIds.length > 1 ? 's' : ''}`
              : 'Pick at least one seat'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: 20 },
  sub: { fontFamily: fonts.regular, fontSize: 14 },
  summary: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs },
  left: { fontFamily: fonts.semibold, fontSize: 16 },
  error: { fontFamily: fonts.regular, fontSize: 13 },
  cta: {
    marginTop: spacing.lg,
    minHeight: minTouchTarget,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPressed: { opacity: 0.85 },
  ctaText: { fontFamily: fonts.semibold, fontSize: 15 },
});
