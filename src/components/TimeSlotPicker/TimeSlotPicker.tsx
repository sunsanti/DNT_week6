import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TimeSlot } from '@/types';
import { fonts, radius, spacing, useThemeColors } from '@/constants/theme';
import { formatTimeRange } from '@/utils/formatTime';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  seatsLeftFor: (slot: TimeSlot) => number;
  onSelect: (slot: TimeSlot) => void;
}

export function TimeSlotPicker({
  slots,
  selectedSlot,
  seatsLeftFor,
  onSelect,
}: TimeSlotPickerProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const left = seatsLeftFor(slot);
        const taken = left === 0;
        const isSelected = selectedSlot?.start === slot.start;
        const range = formatTimeRange(slot.start, slot.end);

        return (
          <Pressable
            key={slot.start}
            disabled={taken}
            onPress={() => onSelect(slot)}
            style={({ pressed }) => [
              styles.slot,
              { backgroundColor: colors.surface, borderColor: colors.border },
              taken && { backgroundColor: colors.background, borderColor: colors.disabled },
              isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
              pressed && !taken && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: taken, selected: isSelected }}
            accessibilityLabel={`${range}, ${left} seats left${taken ? ', fully booked' : ''}`}
          >
            <Text
              style={[
                styles.slotText,
                { color: colors.text },
                taken && { color: colors.disabled, textDecorationLine: 'line-through' },
                isSelected && { color: colors.onPrimary },
              ]}
            >
              {range}
            </Text>
            <Text
              style={[
                styles.leftText,
                { color: colors.textMuted },
                taken && { color: colors.disabled },
                isSelected && { color: colors.onPrimary },
              ]}
            >
              {left} left
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slot: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  slotText: {
    fontFamily: fonts.medium,
    fontSize: 13,
  },
  leftText: {
    fontFamily: fonts.regular,
    fontSize: 11,
  },
});
