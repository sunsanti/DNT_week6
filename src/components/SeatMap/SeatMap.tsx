import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, minTouchTarget, radius, spacing, useThemeColors } from '@/constants/theme';

interface SeatMapProps {
  capacity: number;
  takenIds: Set<number>;
  selectedIds: number[];
  onToggle: (id: number) => void;
}

export function SeatMap({ capacity, takenIds, selectedIds, onToggle }: SeatMapProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.wrap}>
      <View style={styles.grid}>
        {Array.from({ length: capacity }, (_, id) => {
          const taken = takenIds.has(id);
          const selected = selectedIds.includes(id);
          return (
            <Pressable
              key={id}
              disabled={taken}
              onPress={() => onToggle(id)}
              style={({ pressed }) => [
                styles.seat,
                { backgroundColor: colors.surface, borderColor: colors.border },
                taken && { backgroundColor: colors.background, borderColor: colors.disabled },
                selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                pressed && !taken && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Seat ${id + 1}, ${taken ? 'taken' : selected ? 'selected' : 'free'}`}
              accessibilityState={{ disabled: taken, selected }}
            >
              <Text
                style={[
                  styles.label,
                  { color: colors.text },
                  taken && { color: colors.disabled, textDecorationLine: 'line-through' },
                  selected && { color: colors.onPrimary },
                ]}
              >
                {id + 1}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.legend}>
        {[
          ['Free', colors.surface, colors.border],
          ['Selected', colors.primary, colors.primary],
          ['Taken', colors.background, colors.disabled],
        ].map(([label, bg, border]) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.swatch, { backgroundColor: bg, borderColor: border }]} />
            <Text style={[styles.legendText, { color: colors.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  seat: {
    width: minTouchTarget,
    height: minTouchTarget,
    borderWidth: 1,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  label: { fontFamily: fonts.medium, fontSize: 13 },
  legend: { flexDirection: 'row', gap: spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  swatch: { width: 14, height: 14, borderRadius: 4, borderWidth: 1 },
  legendText: { fontFamily: fonts.regular, fontSize: 12 },
});
