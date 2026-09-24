import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BrowseRoomsStackParamList } from '@/navigation/types';
import type { TimeSlot } from '@/types';
import { useRoomBookings } from '@/services/api/useRoomBookings';
import { useRoom } from '@/services/api/useRoom';
import { generateDaySlots } from '@/utils/generateDaySlots';
import { seatsLeft } from '@/utils/overlapCheck';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { useBookingDraftStore } from '@/store/useBookingDraftStore';
import { fonts, minTouchTarget, radius, spacing, useThemeColors } from '@/constants/theme';

type Props = NativeStackScreenProps<BrowseRoomsStackParamList, 'TimeSlotBooking'>;

export function TimeSlotBookingScreen({ route, navigation }: Props) {
  const colors = useThemeColors();
  const { roomId } = route.params;
  const { data: bookings, isLoading } = useRoomBookings(roomId);
  const { data: room } = useRoom(roomId);
  const selectedSlot = useBookingDraftStore((s) => s.selectedSlot);
  const selectSlot = useBookingDraftStore((s) => s.selectSlot);

  const slots = useMemo(() => generateDaySlots(new Date()), []);
  const seatsLeftFor = (slot: TimeSlot) => seatsLeft(room?.capacity ?? 0, bookings ?? [], slot);

  if (isLoading || !room) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: colors.text }]}>Pick a time slot</Text>
      <Text style={[styles.date, { color: colors.textMuted }]}>
        {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
      </Text>
      <TimeSlotPicker
        slots={slots}
        seatsLeftFor={seatsLeftFor}
        selectedSlot={selectedSlot}
        onSelect={selectSlot}
      />

      <Pressable
        style={({ pressed }) => [
          styles.cta,
          { backgroundColor: selectedSlot ? colors.primary : colors.disabled },
          pressed && !!selectedSlot && styles.ctaPressed,
        ]}
        disabled={!selectedSlot}
        onPress={() =>
          selectedSlot && navigation.navigate('SeatSelection', { roomId, slot: selectedSlot })
        }
        accessibilityRole="button"
      >
        <Text style={[styles.ctaText, { color: colors.onPrimary }]}>
          {selectedSlot ? 'Continue to seats' : 'Pick a time slot'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: 18 },
  date: { fontFamily: fonts.regular, fontSize: 14, marginTop: -spacing.sm },
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
