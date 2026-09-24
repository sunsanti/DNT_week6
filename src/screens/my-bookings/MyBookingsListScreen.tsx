import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarCheck, CheckCircle, XCircle } from 'phosphor-react-native';
import type { MyBookingsStackParamList } from '@/navigation/types';
import type { Booking } from '@/types';
import { useMyBookings } from '@/services/api/useMyBookings';
import { useRoom } from '@/services/api/useRoom';
import { useUserId } from '@/store/useSessionStore';
import { formatTimeRange } from '@/utils/formatTime';
import { formatSeats } from '@/utils/formatSeats';
import { fonts, radius, spacing, useThemeColors } from '@/constants/theme';

type Props = NativeStackScreenProps<MyBookingsStackParamList, 'MyBookingsList'>;

function BookingRow({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const colors = useThemeColors();
  const { data: room } = useRoom(booking.roomId);
  const isConfirmed = booking.status === 'confirmed';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.rowPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <Text style={[styles.room, { color: colors.text }]}>{room?.name ?? ' '}</Text>
      {room && (
        <Text style={[styles.time, { color: colors.textMuted }]}>
          {room.building} · Floor {room.floor} · {formatSeats(booking.seatIds)}
        </Text>
      )}
      <Text style={[styles.time, { color: colors.textMuted }]}>
        {formatTimeRange(booking.slot.start, booking.slot.end)}
      </Text>
      <View style={styles.statusRow}>
        {isConfirmed ? (
          <CheckCircle size={14} color={colors.accent} weight="fill" />
        ) : (
          <XCircle size={14} color={colors.destructive} weight="fill" />
        )}
        <Text style={[styles.status, { color: isConfirmed ? colors.accent : colors.destructive }]}>
          {isConfirmed ? 'Confirmed' : 'Cancelled'}
        </Text>
      </View>
    </Pressable>
  );
}

export function MyBookingsListScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const userId = useUserId();
  const { data: bookings, isLoading } = useMyBookings(userId);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookingRow
            booking={item}
            onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <CalendarCheck size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                You have no bookings yet.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
  },
  row: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowPressed: {
    opacity: 0.7,
  },
  room: {
    fontFamily: fonts.semibold,
    fontSize: 15,
  },
  time: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginTop: 2,
  },
  statusRow: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  status: {
    fontFamily: fonts.regular,
    fontSize: 13,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
});
